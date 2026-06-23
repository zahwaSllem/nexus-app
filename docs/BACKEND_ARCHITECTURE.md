# Nexus — Backend Architecture & API Contract

**Status:** Plan only — no backend code written yet
**Last updated:** 2026-06-18
**Author:** Implementation planning session
**Scope:** Defines the backend that the existing Next.js frontend (mock-data only) will migrate onto. Every contract below maps 1:1 to the TypeScript types in `src/lib/types/nexus.ts` and the helpers the frontend already calls.

This document is the bridge between the finished frontend and a real backend. It does **not** redesign the product. It formalizes the persistence, API, auth, scoring, reporting, and PDF layers that the mock store currently fakes, and gives an exact swap-out path.

---

## 0. Governing constraints (non-negotiable)

These come from `IMPLEMENTATION_ROADMAP.md`, `PRD.md`, `ScoringSpecification.md`, and `Domain6Framework.md`. The backend must enforce them server-side; they cannot be frontend-only.

1. **Two roles only:** `admin` and `candidate`. No manager/assessor/executive roles at V1.
2. **The AI Agent selects everything.** Admin never hand-picks items. Admin reviews and approves only.
3. **Metadata is immutable.** The agent may rewrite item wording into `contextualized_text`, but `item_id`, `dimension_id`, `facet_id`, `use_status`, `reverse_scored`, `keyed_answer`, scoring keys, and all governance fields are copied verbatim from the bank and never altered.
4. **Domain 6 is derived, not a questionnaire domain.** It is computed after D1–D5 scoring from the standardized profile + a 17-field context form. No D6 items ever exist in any bank or form.
5. **No omnibus total-person score.** Dimensions are the primary scored unit; domain summaries are optional aggregations.
6. **Governance gates block output, they do not merely hide it.** D3 and D5 are `operational_blocked` at V1 and must never reach a candidate. D6 Derailment Risk Index (DRI) is **permanently blocked**.
7. **Determinism + versioning.** Every scored/derived output carries `scoring_version` and `synthesis_weight_version` (currently `1.0.0-provisional`) and `policy_version` (`1.0.0`).
8. **Eligibility is a product equation, not a UI choice:** `Eligible(O) = Validation(O) × Confidence(O) × Permission(O)` — all binary. Enforced in the scoring/governance engine, not the report renderer.
9. **Audit logging failure is SEV-1** — if the audit write fails, the operation must fail (fail-closed).

---

## 1. Backend stack recommendation

### 1.1 Primary recommendation (chosen)

A **modular monolith built on the existing Next.js app**, using Route Handlers as the API layer, Prisma + PostgreSQL for persistence, and a small set of internal "engine" modules (scoring, governance, domain6, reporting, agent) that are pure and independently testable.

| Concern | Choice | Why |
|---|---|---|
| API layer | **Next.js 14 Route Handlers** (`src/app/api/**/route.ts`) | Reuses the existing repo, TS types, and deploy target. Fastest migration from the mock store — the frontend swaps `useStore()` calls for `fetch()` against handlers that return the same shapes. |
| Language | **TypeScript** (shared types) | `src/lib/types/nexus.ts` becomes the single source of truth shared by client and server. Zero contract drift. |
| ORM / DB | **Prisma + PostgreSQL** | PRD §18 mandates a relational core. Prisma generates types that we reconcile against `nexus.ts`. JSONB columns hold method-specific payloads and engine outputs. |
| Auth | **Auth.js (NextAuth v5)**, credentials + JWT session, `role` claim | Two roles, server-enforced. Integrates natively with Route Handlers + middleware. |
| Background jobs | **BullMQ + Redis** (scoring, Domain 6, report build, PDF render, email) | PRD §10 wants async, auditable, multi-pass scoring. V1 may run scoring inline; the job interface is defined now so it can move async without contract change. |
| AI Agent | **Anthropic SDK**, model `claude-opus-4-8`, tool-use over the governed bank | The agent calls `select_items` / `contextualize_item` tools that are constrained to bank metadata, guaranteeing constraint #3 server-side. |
| PDF | **Puppeteer** (HTML→PDF) rendering a server report template, or `@react-pdf/renderer` | Reuses the report React components / governed HTML. See §9. |
| Object storage | **S3-compatible bucket** (PDFs, export artifacts) | PDFs are generated artifacts, not DB rows. Store URL + checksum in `report_exports`. |
| Validation | **Zod** schemas at every handler boundary | Rejects malformed payloads before they reach engines; doubles as request/response contract. |

### 1.2 Alternative (if a separate backend is wanted)

A standalone **NestJS** service (same PostgreSQL/Prisma/BullMQ) exposing the identical REST contract, with Next.js acting purely as the frontend. Choose this only if the team wants language/deploy separation or expects non-web clients. It costs a duplicated type layer (publish `nexus.ts` as an internal npm package). **Recommendation: start with 1.1; extract to 1.2 only if scaling demands it.** PRD §9 explicitly endorses "modular monolith first."

### 1.3 Engine modules (framework-agnostic, pure where possible)

These live in `src/lib/engines/**` and contain **no HTTP or DB code** — they take typed inputs and return typed outputs, so they are unit-testable and reusable by both inline and job-queue execution:

- `engines/scoring` — item→facet→dimension→domain, reverse scoring, keyed scoring, forced-choice mapping, SE/confidence.
- `engines/governance` — applies `Eligible(O)` gates, computes `display_state`, `validity_state`, `release_state`.
- `engines/domain6` — CAI/DII + 6 secondary indices from standardized profile + context.
- `engines/reporting` — builds `admin_view` and `candidate_view` from the governed result.
- `engines/agent` — orchestrates the Claude interview → blueprint → contextualization → governance scan.

> The current `src/lib/scoring/mock-scorer.ts` is the seed of `engines/scoring`. Its rules (reverse = `6 - raw`, keyed = 1/0, forced-choice A=1/B=0, 0–100 linear standardization, SE→confidence bands) are already spec-compliant and become the real engine's default config.

---

## 2. Database schema

PostgreSQL. Names follow PRD §18 with additions for the agent, contextualization, assignments, consent, reports, and exports the frontend actually uses. Types reference `nexus.ts` enums; store enums as Postgres `enum` types or `text` + check constraints.

### 2.1 Identity & access

```
users
  user_id            uuid pk
  email              text unique not null
  password_hash      text not null
  role_type          enum('admin','candidate') not null
  display_name       text
  organization       text
  created_at         timestamptz not null
  last_login_at      timestamptz

candidates                       -- candidate profile projection (mirrors StoredCandidate)
  candidate_id       text pk      -- 'cand-001' style or uuid
  user_id            uuid fk users null    -- null until candidate activates account
  candidate_name     text not null
  candidate_email    text not null unique
  job_title          text
  created_at         timestamptz not null
```

### 2.2 Question bank registry (read-mostly, governed)

```
item_banks
  bank_id            text pk
  version            text not null         -- 'final'
  status             enum('production','pilot','research') not null
  imported_at        timestamptz not null

items                              -- 1:1 with BankItem (31 fields)
  item_id            text pk        -- 'NEX-GMB-001'
  bank_id            text fk item_banks
  domain_id          text not null
  domain_name        text not null
  dimension_id       text not null
  dimension_name     text not null
  facet_id           text not null
  facet_name         text not null
  method_family      enum(method_family) not null
  item_format        text not null
  item_text          text not null
  option_a..option_e text null
  keyed_answer       text null
  response_scale     enum(response_scale) not null
  primary_domain_id      text not null
  primary_dimension_id   text not null
  primary_facet_id       text not null
  secondary_dimension_ids text null       -- comma-delimited
  loading_type       enum('direct','adjacent','synthesized') not null
  intended_meaning   text not null
  prohibited_overlap text null
  bank_state         enum(bank_state) not null
  use_status         enum(use_status) not null
  validation_track   text not null
  job_level_overlay  enum(job_level_overlay) not null
  reverse_scored     boolean not null
  index: (domain_id), (dimension_id), (method_family), (use_status)

forced_choice_pair_map            -- scoring keys NOT in CSV (PRD §11.4)
  item_id            text fk items
  option_a_dimension text not null
  option_b_dimension text not null
  scoring_version    text not null
```

### 2.3 Blueprints (agent output)

```
role_blueprints                    -- RoleBlueprint
  blueprint_id       text pk        -- 'bp-001'
  role_context       jsonb not null -- RoleContext
  context_profile    jsonb not null -- ContextProfile (17 fields + id/name)
  included_domains   text[] not null
  approval_status    enum('draft','reviewed','approved','validated') not null
  blueprint_quality  jsonb not null -- BlueprintQualityScore (E,C,S,W,R,composite)
  agent_conversation_id text fk agent_conversations
  created_at         timestamptz not null
  approved_at        timestamptz null
  approved_by        text null

role_blueprint_dimensions          -- SelectedDimension (normalized for query)
  blueprint_id       text fk role_blueprints
  dimension_id       text not null
  dimension_name     text not null
  domain_id          text not null
  selection_rationale text not null
  required_level     numeric null   -- target Td for role-fit (0–100), Phase 2
  weight             numeric null   -- Wd, default 1
  pk (blueprint_id, dimension_id)

blueprint_governance_warnings      -- GovernanceWarning
  id                 uuid pk
  blueprint_id       text fk role_blueprints
  code               text not null
  severity           enum('blocking','caution','info') not null
  message            text not null
  affected_item_ids       text[] null
  affected_dimension_ids  text[] null
  nexus_rule         text null

assessment_blueprints              -- AssessmentBlueprint
  assessment_blueprint_id text pk   -- 'abp-001'
  role_blueprint_id  text fk role_blueprints
  total_items        int not null
  estimated_duration_min int not null
  method_mix         jsonb not null
  domain_coverage    jsonb not null -- DomainCoverage[]
  agent_selection_rationale text not null
  generated_at       timestamptz not null

contextualized_items               -- ContextualizedItem (metadata immutable)
  id                 uuid pk
  assessment_blueprint_id text fk assessment_blueprints
  item_id            text fk items  -- immutable link
  original_text      text not null  -- copied verbatim from items.item_text
  contextualized_text text not null -- agent-generated
  contextualization_rationale text not null
  display_order      int not null
  unique (assessment_blueprint_id, item_id)
```

### 2.4 Assignments, consent, sessions, responses

```
assignments                        -- AssessmentAssignment
  assignment_id      text pk        -- 'asgn-001' / 'ASGN-XXXXXX'
  blueprint_id       text fk role_blueprints
  assessment_blueprint_id text fk assessment_blueprints
  candidate_id       text fk candidates
  candidate_name     text not null
  candidate_email    text not null
  job_title          text null
  use_case           enum('developmental','hiring_support_validated_blueprint') not null
  status             enum('not_started','in_progress','completed','expired') not null
  consent_confirmed  boolean not null default false
  consent_date       timestamptz null
  deadline           date not null
  assigned_at        timestamptz not null
  assigned_by        text not null   -- admin email
  session_id         text null fk assessment_sessions
  completed_at       timestamptz null
  invitation_link    text null
  invitation_status  enum('not_sent','sent','opened') null
  index: (candidate_id), (status)

consents                           -- per-use-case (governance #req)
  id                 uuid pk
  assignment_id      text fk assignments
  candidate_id       text fk candidates
  use_case           text not null
  consent_text_version text not null
  confirmed_at       timestamptz not null
  ip_address         inet null

assessment_sessions
  session_id         text pk        -- 'sess-001'
  assignment_id      text fk assignments
  assessment_blueprint_id text fk assessment_blueprints
  candidate_id       text fk candidates
  state              enum('created','in_progress','submitted','scored','expired') not null
  started_at         timestamptz null
  submitted_at       timestamptz null
  current_index      int not null default 0

responses                          -- ItemResponse union, normalized
  response_id        uuid pk
  session_id         text fk assessment_sessions
  item_id            text fk items
  method_family      enum(method_family) not null
  value              int null          -- likert/frequency 1..5
  selected_option    text null         -- 'A'..'E' for fc/cog/sjt
  latency_ms         int not null
  captured_at        timestamptz not null
  unique (session_id, item_id)
```

### 2.5 Scoring, Domain 6, role-fit, reports, exports

```
scoring_runs                       -- ScoredResult header
  scoring_run_id     text pk        -- 'score-001'
  session_id         text fk assessment_sessions
  bank_version       text not null   -- 'final'
  norm_version       text not null   -- 'provisional'
  scoring_version    text not null   -- '1.0.0-provisional'
  synthesis_weight_version text not null
  validity_state     enum(validity_state) not null
  release_state      enum(release_state) not null
  completion_ratio   numeric not null
  confidence         text null
  scored_at          timestamptz not null

item_scores
  scoring_run_id     text fk scoring_runs
  item_id            text fk items
  scored_value       numeric not null
  reverse_applied    boolean not null
  pk (scoring_run_id, item_id)

dimension_scores                   -- DimensionScore
  scoring_run_id     text fk scoring_runs
  dimension_id       text not null
  dimension_name     text not null
  domain_id          text not null
  raw_score          numeric not null
  standardized_score numeric not null   -- 0–100
  standard_error     numeric not null
  confidence         enum('HIGH','MODERATE','LOW','UNACCEPTABLE') not null
  display_state      enum('visible','visible_with_caution','downgraded','hidden','blocked') not null
  item_count         int not null
  reverse_items_applied int not null
  pk (scoring_run_id, dimension_id)

domain_scores
  scoring_run_id     text fk scoring_runs
  domain_id          text not null
  domain_name        text not null
  standardized_score numeric not null
  confidence         enum(confidence_band) not null
  pk (scoring_run_id, domain_id)

qc_flags                           -- QCFlag
  id                 uuid pk
  scoring_run_id     text fk scoring_runs
  flag_code          text not null
  severity           enum('low','moderate','high') not null
  description        text not null
  affected_domain    text null

contexts                           -- ContextProfile instance (D6 input)
  context_id         text pk
  context_name       text not null
  payload            jsonb not null  -- all 17 fields + leadership_scope
  created_at         timestamptz not null

domain6_runs
  domain6_run_id     text pk
  scoring_run_id     text fk scoring_runs
  context_id         text fk contexts
  version            text not null
  confidence         enum('High','Moderate','Provisional') not null
  governance_notes   text[] not null
  created_at         timestamptz not null

domain6_scores                     -- index_code in {CAI,DII,AFI,ECFI,SII,DDI,PDRI,ECSI}
  domain6_run_id     text fk domain6_runs
  index_code         text not null
  score              numeric not null
  interpretation_band text null
  pk (domain6_run_id, index_code)
  -- DRI is NEVER written here (permanently blocked)

role_blueprint_dimensions ... (see §2.3; required_level/weight feed role-fit)

role_fit_runs                      -- Phase 2 (validated blueprint only)
  role_fit_run_id    text pk
  scoring_run_id     text fk scoring_runs
  domain6_run_id     text fk domain6_runs null
  role_blueprint_id  text fk role_blueprints
  fit_score          numeric not null
  fit_band           text not null
  confidence         text not null
  top_strengths      jsonb not null
  top_risks          jsonb not null
  threshold_failures jsonb not null
  narrative_summary  text not null
  blueprint_status   text not null
  created_at         timestamptz not null

reports                            -- Report
  report_id          text pk        -- 'rpt-001'
  scoring_run_id     text fk scoring_runs
  blueprint_id       text fk role_blueprints
  assessment_blueprint_id text fk assessment_blueprints
  use_case           text not null
  policy_version     text not null  -- '1.0.0'
  scoring_version    text not null
  synthesis_weight_version text not null
  release_state      enum(release_state) not null
  visible_sections   text[] not null
  blocked_sections   text[] not null
  downgraded_dimension_ids text[] not null
  hidden_dimension_ids     text[] not null
  admin_view         jsonb not null -- AdminReportView
  candidate_view     jsonb not null -- CandidateReportView
  generated_at       timestamptz not null

report_exports                     -- PDF artifacts
  export_id          uuid pk
  report_id          text fk reports
  audience           enum('admin','candidate') not null
  storage_url        text not null
  checksum           text not null
  policy_version     text not null
  generated_at       timestamptz not null
  generated_by       text not null

agent_conversations                -- agent interview transcript
  agent_conversation_id text pk     -- 'conv-001'
  admin_user_id      uuid fk users
  status             enum('in_progress','completed') not null
  turns              jsonb not null  -- AgentTurn[]
  created_at         timestamptz not null
  completed_at       timestamptz null

audit_events                       -- immutable, append-only (SEV-1 if write fails)
  event_id           uuid pk
  actor_user_id      uuid null
  actor_role         text null
  event_type         text not null   -- 'blueprint.approved','session.submitted','report.released','score.suppressed', ...
  target_type        text not null
  target_id          text not null
  payload            jsonb not null
  policy_version     text null
  occurred_at        timestamptz not null
```

**Design notes**
- JSONB for `role_context`, `context_profile`, `blueprint_quality`, `method_mix`, `domain_coverage`, `admin_view`, `candidate_view` keeps the stored object byte-aligned with the TS types while the normalized child tables (`role_blueprint_dimensions`, `dimension_scores`, etc.) support querying/aggregation.
- `audit_events` is append-only; revoke UPDATE/DELETE at the DB role level.
- Forced-choice scoring keys are **not** in the bank CSV → stored in `forced_choice_pair_map` (PRD §11.4), seeded from the mock scorer's provisional map.

---

## 3. API endpoints

REST, JSON, all under `/api`. Request/response bodies use the exact `nexus.ts` shapes. Auth via session cookie (Auth.js). `[A]` = admin-only, `[C]` = candidate-only, `[A/C]` = both (ownership-scoped), `[Pub]` = public.

### 3.1 Auth

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | Pub | Credentials → session; returns `{ role, redirect }` (admin→`/dashboard/agent`, candidate→`/assessment`) |
| POST | `/api/auth/logout` | A/C | Destroy session |
| GET | `/api/auth/session` | A/C | Current user `{ user_id, role, email }` |

### 3.2 Question bank — replaces `question-bank.ts` helpers

| Method | Path | Role | Replaces |
|---|---|---|---|
| GET | `/api/bank` | A | full bank; `?domain=&dimension=&method=&use_status=` filters | `getBankItemsBy*` |
| GET | `/api/bank/:itemId` | A | single item | `getBankItemById` |

### 3.3 Agent (blueprint creation) — replaces scripted transcript

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | `/api/agent/conversations` | [A] | Start interview; returns `agent_conversation_id` |
| POST | `/api/agent/conversations/:id/messages` | [A] | Send admin turn → returns next `AgentTurn` (Claude) |
| POST | `/api/agent/conversations/:id/generate-blueprint` | [A] | Agent emits `RoleBlueprint` + `AssessmentBlueprint` (selects + contextualizes items, runs governance scan) |
| GET | `/api/agent/conversations/:id` | [A] | Transcript replay |

### 3.4 Role & assessment blueprints — replaces `blueprints.ts` / `assessment-blueprints.ts`

| Method | Path | Role | Replaces |
|---|---|---|---|
| GET | `/api/blueprints` | [A] | list; `?approved=true` | `getApprovedBlueprints` |
| GET | `/api/blueprints/:id` | [A] | role blueprint detail | `getBlueprintById` |
| POST | `/api/blueprints/:id/approve` | [A] | governance workflow → `approved`/`validated`; writes `approved_at/by`; audited |
| GET | `/api/blueprints/:id/assessment` | [A] | assessment blueprint for role blueprint | `getAssessmentBlueprintByRoleBlueprint` |
| GET | `/api/assessment-blueprints/:id` | [A] | by id | `getAssessmentBlueprintById` |
| GET | `/api/blueprints/:id/governance` | [A] | `GovernanceWarning[]` |

### 3.5 Assignments — replaces `store-provider` mutations + `assignments.ts`

| Method | Path | Role | Replaces |
|---|---|---|---|
| GET | `/api/assignments` | [A] | list; `?status=&candidateId=` | `getPending/Completed/ForCandidate` |
| GET | `/api/assignments/:id` | [A/C] | single (candidate sees own) | `getAssignmentById` |
| POST | `/api/assignments` | [A] | create single → `{ assignmentId, invitationLink }` | `createAssignment` |
| POST | `/api/assignments/bulk` | [A] | batch (email dedupe) → `CreatedAssignmentRecord[]` | `createAssignmentsBulk` |
| PATCH | `/api/assignments/:id/invitation` | [A] | set `invitation_status` | `setInvitationStatus` |
| GET | `/api/candidates` | [A] | roster (`StoredCandidate[]`) | store `candidates` |
| GET | `/api/candidates/:id` | [A] | candidate detail + linked assignments/reports |

### 3.6 Candidate assessment runtime

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/api/me/assignment` | [C] | candidate's current assignment | `getAssignmentForCandidate` |
| POST | `/api/sessions` | [C] | start session from assignment (requires consent) → `session_id` |
| GET | `/api/sessions/:id` | [C] | session state + `ContextualizedItem[]` to render (no keys/metadata leaked) |
| POST | `/api/sessions/:id/consent` | [C] | record per-use-case consent |
| POST | `/api/sessions/:id/responses` | [C] | submit `ItemResponse[]` batch (autosave-friendly) |
| POST | `/api/sessions/:id/complete` | [C] | finalize → enqueue scoring → returns `{ scoring_run_id }` |
| GET | `/api/sessions/:id/status` | [C] | poll scoring progress |

> **Item delivery safety:** `GET /api/sessions/:id` returns only `item_id`, `display_order`, `contextualized_text`, `method_family`, `response_scale`, and rendering options — **never** `keyed_answer`, `reverse_scored`, `intended_meaning`, or scoring keys. This is enforced server-side, not by the client.

### 3.7 Scoring, Domain 6, role-fit — replaces `mock-scorer.ts` + `scored-results.ts`

| Method | Path | Role | Replaces |
|---|---|---|---|
| GET | `/api/scoring/:scoringRunId` | [A] | `ScoredResult` | `getScoredResultById` |
| GET | `/api/sessions/:sessionId/scoring` | [A] | by session | `getScoredResultBySession` |
| POST | `/api/contexts` | [A] | create `ContextProfile` instance |
| POST | `/api/domain6` | [A] | compute D6 from `scoring_run_id` + `context_id` |
| GET | `/api/domain6/:runId` | [A] | D6 result (DRI never present) |
| POST | `/api/role-fit` | [A] | Phase 2: validated blueprint only |
| GET | `/api/role-fit/:runId` | [A] | Phase 2 |

### 3.8 Reports & exports — replaces `reports.ts`

| Method | Path | Role | Replaces |
|---|---|---|---|
| GET | `/api/reports` | [A] | list reports | reports list |
| GET | `/api/reports/:id` | [A] | full `Report` (admin_view + candidate_view) | `getReportById` |
| GET | `/api/reports/by-candidate/:candidateId` | [A] | by candidate | `getReportByCandidateId` |
| GET | `/api/reports/by-scoring-run/:runId` | [A] | by run | `getReportByScoringRun` |
| GET | `/api/me/report` | [C] | candidate's own **candidate_view only** (admin_view stripped server-side) |
| POST | `/api/reports/:id/export?audience=admin\|candidate` | [A/C] | enqueue PDF; candidate restricted to `candidate` audience → `export_id` |
| GET | `/api/exports/:exportId` | [A/C] | export status + signed `storage_url` |

### 3.9 Admin governance views

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/api/admin/governance` | [A] | governance gate states + 7-layer status (drives `/admin`) |
| GET | `/api/admin/users` | [A] | user list |

---

## 4. Auth and role permissions

### 4.1 Model

- **Two roles** in `users.role_type`: `admin`, `candidate`. Stored in the JWT/session claim.
- **Auth.js (NextAuth v5)** credentials provider; password hashed with Argon2id.
- **Middleware** (`src/middleware.ts`, already present) gates route groups: `/dashboard/*` and `/admin/*` require `admin`; `/assessment/*`, `/candidate/*` require `candidate`. API handlers re-check (defense in depth) — never trust middleware alone.
- **Candidate activation:** assignment creates a `candidates` row; the invitation link carries a signed token that lets the candidate set a password and bind `user_id`. Until then `users.user_id` is null and the candidate authenticates via the magic link.

### 4.2 Permission matrix (server-enforced)

| Capability | Admin | Candidate |
|---|---|---|
| Run agent / create blueprints | ✅ | ❌ |
| Approve blueprints | ✅ | ❌ |
| Create/assign assessments | ✅ | ❌ |
| View question bank + metadata + keys | ✅ | ❌ |
| Take assigned assessment | ❌ | ✅ (own assignment only) |
| Submit responses | ❌ | ✅ (own session only) |
| View `admin_view` / detailed report | ✅ | ❌ |
| View `candidate_view` / candidate-safe report | ✅ | ✅ (own only) |
| View Domain 6 indices | ✅ | per release policy (V1: summary only) |
| Export admin PDF | ✅ | ❌ |
| Export candidate PDF | ✅ | ✅ (own) |
| View governance / audit | ✅ | ❌ |

### 4.3 Ownership scoping

Every candidate-facing endpoint resolves the resource's `candidate_id` and asserts it equals the session user's candidate. A candidate can never fetch another candidate's session, scoring run, or report — enforced in the handler, returning 404 (not 403) to avoid enumeration.

### 4.4 The candidate-safe boundary (critical)

`GET /api/me/report` and the candidate PDF path must construct their response **only** from `reports.candidate_view`. The `admin_view` JSONB is never serialized to a candidate. Similarly, blocked sections (D3, D5, D6 DRI, percentiles, response-quality) are absent from `candidate_view` at build time — they are not "hidden by CSS," they are never written into the candidate object.

---

## 5. Data flow — Admin journey

```
1. Login (admin)                         POST /api/auth/login → role=admin → /dashboard/agent
2. Agent interview                       POST /api/agent/conversations
                                         POST .../messages (loop) ← Claude turns
3. Generate blueprint                    POST .../generate-blueprint
   - Agent tool: select_items(bank, context)   → constrained to use_status != operational_blocked
   - Agent tool: contextualize_item(item)      → writes contextualized_text; copies metadata verbatim
   - Agent: governance_scan()                  → GovernanceWarning[]
   - Persists role_blueprints + role_blueprint_dimensions + assessment_blueprints + contextualized_items
4. Review Role Blueprint                  GET /api/blueprints/:id          (BQ score, context profile, dims)
5. Review Assessment Blueprint            GET /api/blueprints/:id/assessment (items: original vs contextualized)
6. Governance review                      GET /api/blueprints/:id/governance (blocking must be resolved)
7. Approve                                POST /api/blueprints/:id/approve → approval_status, audit_event
8. Assign to candidate(s)                 POST /api/assignments  or  /bulk → invitation_link(s)
9. (candidate completes assessment — see §6)
10. View report                           GET /api/reports/by-candidate/:id → admin_view
11. Export                                POST /api/reports/:id/export?audience=admin → PDF
```

**Server guarantees during step 3:** the agent runtime physically cannot mutate metadata — the `contextualize_item` tool accepts only `item_id` + new wording and the server copies all governance/scoring fields from `items` into `contextualized_items.original_text` and leaves the bank row untouched. Blocked-domain items (D3/D5) are filtered out of the candidate set before selection, so they can never be assigned.

---

## 6. Data flow — Candidate journey

```
1. Open invitation link                  signed token → activate account / login (candidate)
2. View assigned assessment              GET /api/me/assignment → blueprint domains, item count, duration
3. Consent (per use-case)                POST /api/sessions/:id/consent  (gates Start; consent row + audit)
4. Start session                         POST /api/sessions → session_id (state=in_progress)
5. Render & answer items                 GET /api/sessions/:id → ContextualizedItem[] (NO keys/metadata)
                                         POST /api/sessions/:id/responses (batched ItemResponse[])
                                         — QuestionRouter renders by method_family/response_scale
6. Submit                                POST /api/sessions/:id/complete → enqueue scoring job
7. Scoring pipeline runs (see §7)        → scoring_run + governance + (optional) domain6 + report
8. View results / report                 GET /api/me/report → candidate_view ONLY
                                         (Release banner, visible dimensions, behavioral_descriptors,
                                          development_suggestions, blocked_section_notices)
9. Export candidate PDF                  POST /api/reports/:id/export?audience=candidate
```

**Candidate-safe enforcement:** steps 5 and 8 are the two leak-risk points. Step 5 strips scoring keys; step 8 serializes `candidate_view` exclusively. Both are covered by handler-level tests and an audit event on every report read.

---

## 7. Scoring engine plan

Implements `ScoringSpecification.md` and PRD §10–§15. The mock scorer's rules are the V1 defaults; the engine generalizes them with versioned config so calibration can replace constants without code changes.

### 7.1 Pipeline (async job, multi-pass, auditable)

| Stage | Input | Action | Output |
|---|---|---|---|
| 1. Finalize | session responses | check completion ratio, missingness, method validity | locked payload |
| 2. Item scoring | responses + item metadata | reverse (`6−raw`), keyed (1/0), forced-choice pair-map | `item_scores` |
| 3. Aggregate | item scores | facet→dimension→domain means (equal-weight default) | raw profile |
| 4. Standardize | raw scores + norm config | non-cog: `(mean−1)/4×100`; cog/SJT: `proportion_correct×100` | 0–100 dimension scores |
| 5. QC | scores + response metadata | straightlining, reverse-consistency, latency anomaly, missingness | `qc_flags` |
| 6. Confidence | dimension SE | SE≤.25 HIGH · ≤.35 MODERATE · ≤.45 LOW · >.45 UNACCEPTABLE | `confidence` per dimension |
| 7. Governance | profile + rules | apply `Eligible(O)`, set `display_state`, block D3/D5, compute `validity_state` + `release_state` | governed `ScoredResult` |
| 8. Domain 6 | governed profile + context | CAI/DII + 6 secondaries (§8) — only if context exists | `domain6_run` |
| 9. Report build | all prior | build `admin_view` + `candidate_view` (§8 reporting) | `report` |

### 7.2 Scoring rules (V1, from mock-scorer, spec-aligned)

- **Likert / contextual_self_report:** integer 1–5; reverse `= 6 − raw` when `reverse_scored`.
- **Cognitive MCQ / SJT:** `1 if selected_option == keyed_answer else 0`.
- **Forced-choice:** resolve via `forced_choice_pair_map` (A→dim, B→dim); never averaged as Likert.
- **Aggregation:** dimension = mean of scored items; domain = mean of non-hidden/blocked dimensions. **No omnibus score.**
- **Standardization:** provisional linear/lookup, `norm_version='provisional'`, versioned so reports stay reproducible.
- **Standard error → confidence band:** per §7.1 stage 6. V1 uses provisional per-domain SE; real SE comes from the IRT/GGUM engine later (deferred — see roadmap).

### 7.3 Display / validity / release derivation (governance engine)

- `display_state ∈ {visible, visible_with_caution, downgraded, hidden, blocked}` from confidence + permission + block rules:
  - D3/D5 → `blocked`; HIGH→`visible`; MODERATE→`visible_with_caution`; LOW→`downgraded`; UNACCEPTABLE→`hidden`.
- `validity_state ∈ {VALID, PASS_WITH_LIMITS, VALID_BUT_UNINTERPRETABLE, INCOMPLETE, INVALID}` from completion ratio + QC severity + count of low-confidence dimensions.
- `release_state ∈ {Released, Released with Caution, Partial Release, Blocked output section, Assessment incomplete, Invalid for interpretation}` from validity + section availability.
- **Eligibility gate:** `Eligible(O) = Validation × Confidence × Permission` evaluated per output; failing outputs are downgraded/hidden/blocked, never silently dropped (a `release_reason_code` is recorded).

### 7.4 Determinism, versioning, audit

Every run stamps `scoring_version`, `synthesis_weight_version`, `norm_version`, `bank_version`. Same inputs + same versions → identical output (no randomness in the real engine; the mock's deterministic seeding is replaced by real computation). Stage 7 emits `score.suppressed` audit events for every blocked/hidden output. **If the audit write fails, the scoring run fails (SEV-1).**

---

## 8. Reporting engine plan

Implements `AutomatedReportingStandard.md`. Reporting is **deterministic** and **audience-partitioned** — it does not decide visibility, it *renders* the governance engine's decisions.

### 8.1 Inputs → outputs

Input: governed `ScoredResult` (+ optional `domain6_run`, `role_fit_run`).
Output (`reports` row): `release_state`, `visible_sections[]`, `blocked_sections[]`, `downgraded_dimension_ids[]`, `hidden_dimension_ids[]`, `admin_view` (`AdminReportView`), `candidate_view` (`CandidateReportView`), version tags.

### 8.2 Two audiences (only two roles → two views)

| | **admin_view** (detailed) | **candidate_view** (candidate-safe) |
|---|---|---|
| Domains | all scored domains incl. blocked cards (D5 shown as blocked) | only HIGH/MODERATE `display_state` dimensions |
| Strengths | `strengths` (Critical Success Factors) | top behavioral_descriptors only |
| Risks | `watch_points` incl. disqualifying labels | none (no raw risk surfaced) |
| QC / governance | `qc_flags`, `governance_notes`, confidence summary | none |
| Blocked sections | listed with reason + rule | supportive `blocked_section_notices` only |
| Hiring recommendation | derived from release+validity | never |
| Domain 6 | CAI/DII + secondaries (no DRI) | summary/dev-framed only (V1) |

### 8.3 Deterministic visibility (the only source of "what shows")

`VisibleScore_d = I(V_d ∧ C_d ∧ P_d ∧ U_d)` — validation, confidence, permission, use-appropriateness. The reporting engine reads `display_state`/`release_state` already computed by §7 and **partitions** content into the two views. Blocked content is *never written* into `candidate_view` (constraint #6).

### 8.4 Section prerequisites (enforced)

- Percentiles → require norming/scale-linking → **blocked at V1** (no validated norms).
- Role-fit section → blueprint `validated` + confidence + permission → **blocked at V1** except validated blueprints (Phase 2).
- Response-quality section → admin audience only.
- D3, D5 → blocked everywhere operationally; D6 **DRI → permanently blocked, never computed**.

### 8.5 Domain 6 section

Computed by `engines/domain6` from standardized D1–D5 + `ContextProfile`:
- **CAI** `= 100 − 100·(Σ Wd·|Pd−Rd| / (Σ Wd·100)) − Σ Gd` → bands 80–100 strong … 0–34 poor.
- **DII** `= 0.30·DDI + 0.20·AFI + 0.15·SII + 0.15·ECSI − 0.20·PDRI`.
- Secondaries AFI/ECFI/SII/DDI/PDRI/ECSI per the framework's weighted composites (stored as **versioned formula config**, not hard-coded).
- **Confidence:** High / Moderate / Provisional; **can never exceed the weakest source domain's confidence**; pilot/provisional inputs (D5 weights) force ≤ Moderate.
- **DRI is excluded entirely** — not stored, not computed, not rendered.

---

## 9. PDF export backend plan

Replaces the frontend "mock PDF export" with real server-generated documents.

### 9.1 Approach

- **Renderer:** Puppeteer rendering a **server-side governed HTML template** (preferred — reuses the report layout/styling and supports EN/AR + RTL from the existing i18n). `@react-pdf/renderer` is the fallback if a Chromium dependency is undesirable in the deploy target.
- **Source of truth:** the PDF is built from the **same `admin_view` / `candidate_view`** JSON the web report uses — never from a separate data path. This guarantees the PDF cannot show more than the screen (no governance bypass via export).
- **Audience partition:** `audience=admin` renders `admin_view`; `audience=candidate` renders `candidate_view`. Candidates can only request `audience=candidate` (enforced in handler).

### 9.2 Flow

```
POST /api/reports/:id/export?audience=...     → validate audience vs role
  → enqueue render job (BullMQ)               → returns { export_id, status: 'pending' }
  → worker: load report.{audience}_view
           render HTML template (i18n/RTL aware, version footer)
           Puppeteer → PDF buffer
           upload to S3, compute checksum
           insert report_exports row + audit_event('report.exported')
GET /api/exports/:exportId                     → { status, storage_url (signed, short-TTL) }
```

### 9.3 Governance in the PDF

- Footer stamps `scoring_version`, `synthesis_weight_version`, `policy_version`, `report_id`, `generated_at`.
- Blocked sections render as the same `BlockedSectionNotice` the UI uses (admin) or supportive notice (candidate).
- Watermark/label per `release_state` (e.g., "Released with Caution").
- Signed URLs are short-TTL; PDFs in a private bucket. Every export and every download is audited.

---

## 10. Migration plan — mock store → backend APIs

The frontend was deliberately built so that **all data access funnels through helpers** (`getReportById`, `useStore().createAssignment`, `mockScore`, etc.). Migration replaces the *implementation* of those helpers with `fetch`, keeping call sites unchanged.

### 10.1 Strategy: a data-access seam

Introduce `src/lib/api/` clients with the **same function signatures** as the current mock helpers. Flip a single `NEXT_PUBLIC_DATA_SOURCE = mock | api` flag. This lets the frontend run against mock or backend with no component changes and supports incremental cutover.

```
src/lib/api/bank.ts          ↔  question-bank.ts helpers
src/lib/api/blueprints.ts    ↔  blueprints.ts / assessment-blueprints.ts helpers
src/lib/api/assignments.ts   ↔  store-provider mutations + assignments.ts helpers
src/lib/api/sessions.ts      ↔  (new) session runtime
src/lib/api/scoring.ts       ↔  mock-scorer.ts (mockScore → POST /complete + poll)
src/lib/api/reports.ts       ↔  reports.ts helpers
```

### 10.2 Phased cutover (each phase shippable, reversible via flag)

| Phase | Scope | Backend built | Frontend change | Risk |
|---|---|---|---|---|
| **B0** | Foundation | Postgres + Prisma schema (§2), Auth.js (§4), seed bank (51 items) + existing mock blueprints/assignments/report as seed data | none | low |
| **B1** | Read-only reference | `GET /api/bank`, `/api/blueprints*`, `/api/assessment-blueprints*` | `src/lib/api/bank.ts`, `blueprints.ts` behind flag | low — pure reads, shapes identical |
| **B2** | Assignments | `GET/POST /api/assignments(/bulk)`, `PATCH invitation`, `/api/candidates` | swap `store-provider` to call API; keep optimistic UI | medium — first writes; mirror `CreatedAssignmentRecord` exactly |
| **B3** | Candidate runtime | sessions, consent, responses, complete (enqueue scoring) | `sessions.ts`; assessment pages submit to API | medium |
| **B4** | Real scoring + governance | `engines/scoring` + `engines/governance`; replace `mockScore` | `scoring.ts`: `mockScore()` → complete+poll | high — validate parity vs mock on seed data first |
| **B5** | Reporting | `engines/reporting` builds admin/candidate views; `GET /api/reports*`, `/api/me/report` | `reports.ts` clients; candidate gets `candidate_view` only | high — candidate-safe boundary tests required |
| **B6** | Domain 6 | `engines/domain6`, `/api/contexts`, `/api/domain6` | report shows real CAI/DII (was `--`) | medium |
| **B7** | Agent (real) | Claude tool-use agent replacing scripted transcript | agent pages call `/api/agent/*` | high — constrain tools to preserve metadata + block D3/D5 |
| **B8** | PDF export | render service + `/api/reports/:id/export`, `/api/exports/:id` | replace mock export button with enqueue+poll | medium |
| **B9** | Hardening | audit fail-closed, rate limits, RLS/ownership tests, calibration hooks | — | — |

### 10.3 Parity guardrails

- **Contract tests:** for each migrated helper, assert the API response validates against the same Zod schema derived from `nexus.ts`. A shape mismatch fails CI.
- **Scoring parity (B4):** run `mockScore` and the real engine on the seeded `sess-001` responses; dimension scores, `validity_state`, and `release_state` must match within tolerance before flipping the flag for scoring.
- **Candidate-safe assertion (B5):** automated test that `GET /api/me/report` JSON contains **no** `admin_view`, no `watch_points`, no `qc_flags`, no blocked-domain dimensions. This is a release-blocking test.
- **Reversibility:** every phase is behind `NEXT_PUBLIC_DATA_SOURCE`; a regression flips back to `mock` for that client module without redeploying the backend.

### 10.4 Seed data

The existing mock files become the database seed: 51 bank items, `bp-001/bp-002`, `abp-001/abp-002`, `asgn-001/asgn-002`, `score-001`, `rpt-001`, transcripts `conv-001/002`. This keeps every current screen working against the real DB on day one of B0/B1 and gives B4/B5 a known-good fixture for parity testing.

---

## Appendix A — Enum → DB type reference

All enums below are defined in `src/lib/types/nexus.ts` and become Postgres enum types:

`MethodFamily`, `ResponseScale`, `BankState`, `UseStatus`, `JobLevelOverlay`, `JobFamily`, `JobLevel`, `GovernanceSeverity` (`blocking|caution|info`), `BlueprintApprovalStatus` (`draft|reviewed|approved|validated`), `AssignmentStatus` (`not_started|in_progress|completed|expired`), `InvitationStatus` (`not_sent|sent|opened`), `ConfidenceBand` (`HIGH|MODERATE|LOW|UNACCEPTABLE`), `DisplayState` (`visible|visible_with_caution|downgraded|hidden|blocked`), `ValidityState` (`VALID|PASS_WITH_LIMITS|VALID_BUT_UNINTERPRETABLE|INCOMPLETE|INVALID`), `ReleaseState` (`Released|Released with Caution|Partial Release|Blocked output section|Assessment incomplete|Invalid for interpretation`), `use_case` (`developmental|hiring_support_validated_blueprint`).

## Appendix B — What stays deferred to Phase 2+ (no backend at V1)

Role-fit scoring against validated blueprints, D3 Motivational Drivers, D5 Applied Workplace Behavior (operational use), real IRT/GGUM SE estimation, calibration/DIF live engine, validated norm tables/percentiles, cross-version score comparison, Domain 6 narrative library, manager-rated/scenario role-fit modes. **D6 Derailment Risk Index is permanently blocked — never build it.**
