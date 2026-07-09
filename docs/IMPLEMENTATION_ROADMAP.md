# Nexus — Implementation Roadmap

**Last updated:** 2026-07-09

This document is the canonical reference for what has been built and what's left, in
priority order. See `CURRENT_PHASE.md` for the active phase's narrative detail and
`TODO.md` for the actionable task list. See `INTEGRATION_STATUS.md` for the exhaustive
page-by-page mock/API matrix.

---

## Product Architecture Summary

The Nexus product has two roles: **Admin** and **Candidate**.

### Admin journey (canonical)

```
Login
  ↓
/dashboard/agent        ← AI Assessment Agent wizard (built, still scripted/mock — no live agent backend)
  Step 1: Interview
  Step 2: Role Blueprint review
  Step 3: Assessment Blueprint preview
  Step 4: Governance review
  Step 5: Approval
  ↓
/dashboard/blueprints/[id]       ← Saved blueprint (built, migrated to live API)
  ↓
/dashboard/assessments/new       ← Assign to candidate (built, still mock — API client unused)
  ↓
/dashboard/reports/[id]          ← View scored report (built, still mock — next migration task)
```

### Candidate journey (canonical)

```
Login
  ↓
/assessment              ← View assigned assessment (still a hardcoded prototype)
  ↓
/assessment/consent      ← Per-use-case informed consent (NEVER BUILT — no page exists)
  ↓
/assessment/[sessionId]  ← Take assessment (still a hardcoded prototype; sessions API unused)
  ↓
/assessment/complete     ← Submission confirmed (built, static)
  ↓
/assessment/report       ← Candidate-safe developmental report (built as /candidate/report/[id] instead — still mock)
```

---

## Core Design Rules (never violate) — verified against current code

1. **AI agent selects everything.** Admin never manually picks questions. Admin only reviews and approves. *(Still true — no UI lets an admin hand-pick bank items.)*
2. **Contextualized text ≠ original text.** Every item has `original_text` (immutable from bank) and `contextualized_text` (agent-generated). *(Enforced in the schema — `ContextualizedItem.original_text` is a verbatim copy, `QuestionBankItem` rows are never mutated at runtime.)*
3. **Domain 6 is not a questionnaire domain.** It is a derived context/fit layer computed after D1–D5 scoring from a 17-field context form. *(True in the schema and scoring engine; still mislabeled "Roadmap" on the public homepage — tracked in `TODO.md`.)*
4. **No omnibus total-person score.** Dimensions are the primary scored unit. *(Verified — no such field/computation exists anywhere in `mock-scorer.ts` or the Prisma schema.)*
5. **Governance gates block output, not just hide it.** D3/D5 items must not reach candidates. D6 is not yet computed at all. *(Enforced server-side: `mock-scorer.ts` skips D3/D5 entirely; `src/lib/server/reports.ts` removes blocked/hidden dimension data before building `candidate_view` — not a client-side hide.)*
6. **Scoring is deterministic.** Every scored output carries `scoring_version` and `synthesis_weight_version`. *(True — both default to `"1.0.0-provisional"` in the Prisma schema and are set on every `ScoringRun`/`Report`.)*

---

## Full Route Map

### Admin routes (Sidebar layout)

| Route | Status |
|---|---|
| `/dashboard` | Built, mock data (KPIs/analytics) |
| `/dashboard/agent` | Built, mock/scripted (no live agent backend) |
| `/dashboard/blueprints` | Built, **migrated to live API** |
| `/dashboard/blueprints/[id]` | Built, **migrated to live API** |
| `/dashboard/assessments` | Built, **migrated to live API** |
| `/dashboard/assessments/new` | Built, mock (create API unused) |
| `/dashboard/assessments/bulk` | Built, mock (bulk-create API unused) |
| `/dashboard/candidates` | Built, mock store only (no adapter exists) |
| `/dashboard/candidates/[id]` | Built, mock store only (no adapter exists) |
| `/dashboard/reports` | Built, **migrated to live API** (most recent migration) |
| `/dashboard/reports/[id]` | Built, mock (next migration task) |
| `/admin` | Built, static/placeholder, no data layer |
| `/admin/users` | Built, static/placeholder, no data layer |
| `/admin/settings` | Built, static/placeholder, no data layer |

### Candidate routes (standalone shell, no Sidebar)

| Route | Status |
|---|---|
| `/assessment` | Built, hardcoded prototype (never wired to mock store or API) |
| `/assessment/consent` | **Never built** — no consent UI exists anywhere despite the schema supporting it |
| `/assessment/[sessionId]` | Built, hardcoded prototype; `sessions-client.ts` fully unused |
| `/assessment/complete` | Built, static |
| `/candidate/dashboard` | Built, mock data |
| `/candidate/results/[id]` | Built, mock data |
| `/candidate/report/[id]` | Built, mock data (serves the "candidate-safe report" role originally planned as `/assessment/report`) |

### Public

| Route | Status |
|---|---|
| `/` | Built. D6 card still says "Roadmap" — known cleanup item |
| `/login` | Built, real Auth.js `signIn()` with correct role-based redirect (admin → `/dashboard/agent`, candidate → `/candidate/dashboard`) |

---

## Completed Milestones

### ✅ Milestone 1 — Data Foundation & Full Product UI (2026-06-10 – 2026-06-23)

All TypeScript types, mock data, and every page/component in the route map above were
built against the mock store: the AI Assessment Agent wizard (5-step), Blueprint Library,
Assignment flow, candidate assessment/results/report pages, and the admin Report refactor.
This is the UI layer that the current integration effort is now wiring to real data. Also
delivered in this window: sidebar navigation (Agent/Blueprints/Assessments links) and the
original login redirect fix — both later superseded by the real Auth.js rebuild.

### ✅ Milestone 2 — Backend Build (2026-06-23 – 2026-07-09)

Full governed backend built from scratch: Prisma schema (15 models) + migration, Auth.js
v5 with scrypt-hashed credentials and role-based middleware, and all 28 API route handlers
across bank, blueprints (+ approval workflow), assignments (+ bulk), sessions (+ answer
autosave), scoring, reports (`Sprint 7 — Reports APIs`), and exports
(`Export API Live Smoke Test Results`) — each with same-transaction, fail-closed audit
logging. See `PROJECT_STATUS.md` for the full endpoint inventory. D3/D5 blocking and
candidate-view partitioning are enforced server-side, not just documented.

### ✅ Milestone 3 — Frontend Integration Foundation, wave 1 (2026-07-09, ongoing)

The typed API client layer (`src/lib/api/*-client.ts`, 7 resources) and the data-adapter
migration pattern were established, then applied to the first four pages: blueprint
list/detail, assignments list, and reports list (the latter being the most recent
completed migration). Full detail in `CURRENT_PHASE.md`.

---

## Remaining Work, in priority order

### 🔲 Next — Admin report detail
Migrate `dashboard/reports/[id]/page.tsx` off `REPORT_1`/`SCORED_RESULT_1` mocks using the
already-implemented, already-unused `getReport()` client call. See `TODO.md` §1.

### 🔲 Candidate-facing reporting pages
`candidate/dashboard`, `candidate/results/[id]`, `candidate/report/[id]` — all three can
use the already-implemented, already-unused `getMyReport()` client call. `TODO.md` §2.

### 🔲 Admin home KPIs
`dashboard/page.tsx` — needs a new aggregating adapter, not a single existing client call.
`TODO.md` §3.

### 🔲 Assignment creation flows
`dashboard/assessments/new` and `dashboard/assessments/bulk` — wire the already-implemented
`createAssignment()`/`createAssignmentsBulk()` calls. `TODO.md` §4.

### 🔲 Candidates admin pages
`dashboard/candidates` + `[id]` — no adapter exists yet at all; may need a new backend
aggregation, not just a frontend wire-up. `TODO.md` §5.

### 🔲 Candidate assessment-taking flow (largest remaining gap)
Not a "migration" — `/assessment`, `/assessment/[sessionId]`, `/assessment/complete` are
hardcoded prototypes that were never wired to any data layer, mock or real. Needs: real
assignment loading, a consent step (never built at any fidelity), full wiring of
`sessions-client.ts` (start/questions/answers/submit — 100% unused today), and a scoring
trigger via `scoring-client.ts` (also 100% unused). `TODO.md` §6.

### 🔲 Report export wiring
`ReportExportButton.tsx` is UI-only; wire to `exports-client.ts`. Note the backend export
endpoint itself is provisional (JSON + checksum, no real PDF yet) — a separate, later
backend task. `TODO.md` §7.

### 🔲 Admin panel
`/admin`, `/admin/users`, `/admin/settings` — static placeholders, lowest priority.
`TODO.md` §8.

---

## What Is Deferred Beyond Frontend Integration (Backend / Phase 2+)

| Item | Status |
|---|---|
| Real AI agent (calling an LLM against the bank at runtime) | Not started — `/dashboard/agent` is a scripted transcript replay |
| Dynamic contextualization engine (LLM rewrites item_text) | Not started — pre-written mock text |
| Real PDF generation for exports | Not started — export API returns a JSON payload + checksum, not a binary |
| GGUM / IRT real scoring | Not started — `mock-scorer.ts` is deterministic and spec-compliant but not a real psychometric model |
| Norm tables and standardization | Not started — provisional 0–100 linear transform only |
| Domain 6 CAI/DII engine | Not started — context profile fields exist on `RoleBlueprint`, no computation |
| Role-fit scoring against validated blueprints | Not started |
| Calibration / DIF register | Not started |
| Cross-version score comparison | Not started — version tags present, comparison logic does not exist |
| D3 Motivational Drivers activation | Deferred — dimension reduction analysis required before unblocking |
| D5 Applied Workplace Behavior activation | Deferred — synthesis validation required before unblocking |
| D6 Derailment Risk Index | **Permanently blocked** — independent ethics + criterion validity review required; not a build task |
