# Nexus — API Contract

**Status:** Contract draft only — no live handlers, no frontend wiring, mock store still in place.
**Last updated:** 2026-06-18
**Companion files:** `prisma/schema.prisma` (persistence), `src/lib/api/schemas.ts` (Zod validation), `docs/BACKEND_ARCHITECTURE.md` (rationale).

This document is the request/response contract for the future Nexus backend. Every payload references a Zod schema in `src/lib/api/schemas.ts`, which in turn is proven (at compile time) to match the frontend types in `src/lib/types/nexus.ts`. The contract is the single agreement the frontend and backend will both honor when the mock store is later swapped out.

---

## Conventions

- **Base path:** `/api`. JSON in/out. UTF-8.
- **Auth:** session cookie (Auth.js). Two roles only: `admin`, `candidate`.
- **Role tags:** `[A]` admin-only · `[C]` candidate-only (own resources) · `[A/C]` both (ownership-scoped) · `[Pub]` public.
- **Validation:** every request body is parsed with its Zod schema before reaching engine code. A parse failure → `400` with `{ error, issues }`.
- **Errors:** `400` invalid body · `401` unauthenticated · `403` wrong role · `404` not found / not owned (candidates get `404`, never `403`, to prevent enumeration) · `409` state conflict · `422` governance block · `500` server.
- **Governance status codes:** a request that is well-formed but blocked by a governance gate (e.g. approving a blueprint with unresolved `blocking` warnings) returns `422` with a `release_reason_codes` / `nexus_rule` explanation.
- **Determinism:** all scored/derived responses carry `scoring_version`, `synthesis_weight_version`, and (reports) `policy_version`.

---

## 1. Auth

| Method | Path | Role | Request schema | Response |
|---|---|---|---|---|
| POST | `/api/auth/login` | Pub | `LoginRequestSchema` | `{ role: "admin"\|"candidate", redirect }` (admin→`/dashboard/agent`, candidate→`/assessment`) |
| POST | `/api/auth/logout` | A/C | — | `204` |
| GET | `/api/auth/session` | A/C | — | `{ user_id, role, email }` |

---

## 2. Question bank `[A]`

The bank is admin-only. Candidates never receive raw bank items (which carry `keyed_answer`, `reverse_scored`, scoring metadata).

| Method | Path | Request | Response | Replaces |
|---|---|---|---|---|
| GET | `/api/bank?domain=&dimension=&method=&use_status=` | — | `BankItemSchema[]` | `getBankItemsBy*` |
| GET | `/api/bank/:itemId` | — | `BankItemSchema` | `getBankItemById` |

---

## 3. Agent (blueprint creation) `[A]`

Drives `/dashboard/agent`. The agent rephrases item wording but **cannot mutate bank metadata** — enforced in tool/engine code.

| Method | Path | Request | Response |
|---|---|---|---|
| POST | `/api/agent/conversations` | — | `{ agent_conversation_id }` |
| POST | `/api/agent/conversations/:id/messages` | `AgentMessageRequestSchema` | `AgentTurnSchema` (next agent turn) |
| POST | `/api/agent/conversations/:id/generate-blueprint` | — | `{ blueprint: RoleBlueprintSchema, assessment_blueprint: AssessmentBlueprintSchema }` |
| GET | `/api/agent/conversations/:id` | — | `{ agent_conversation_id, status, turns: AgentTurnSchema[] }` |

---

## 4. Blueprints `[A]`

| Method | Path | Request | Response | Replaces |
|---|---|---|---|---|
| GET | `/api/blueprints?approved=true` | — | `RoleBlueprintSchema[]` | `getApprovedBlueprints` |
| GET | `/api/blueprints/:id` | — | `RoleBlueprintSchema` | `getBlueprintById` |
| POST | `/api/blueprints/:id/approve` | `ApproveBlueprintRequestSchema` | `RoleBlueprintSchema` (status updated) · `422` if blocking warnings remain | — |
| GET | `/api/blueprints/:id/assessment` | — | `AssessmentBlueprintSchema` | `getAssessmentBlueprintByRoleBlueprint` |
| GET | `/api/assessment-blueprints/:id` | — | `AssessmentBlueprintSchema` | `getAssessmentBlueprintById` |
| GET | `/api/blueprints/:id/governance` | — | `GovernanceWarningSchema[]` | — |

> **Approval gate:** `POST .../approve` rejects with `422` unless every `severity: "blocking"` warning is resolved. The transition writes `approved_at` / `approved_by` and emits a `blueprint.approved` audit event.

---

## 5. Assignments `[A]`

| Method | Path | Request | Response | Replaces |
|---|---|---|---|---|
| GET | `/api/assignments?status=&candidateId=` | — | `AssessmentAssignmentSchema[]` | `getPending/Completed/ForCandidate` |
| GET | `/api/assignments/:id` | — | `AssessmentAssignmentSchema` | `getAssignmentById` |
| POST | `/api/assignments` | `CreateAssignmentRequestSchema` | `CreatedAssignmentRecordSchema` | `createAssignment` |
| POST | `/api/assignments/bulk` | `CreateBulkAssignmentRequestSchema` | `CreatedAssignmentRecordSchema[]` | `createAssignmentsBulk` |
| PATCH | `/api/assignments/:id/invitation` | `SetInvitationStatusRequestSchema` | `AssessmentAssignmentSchema` | `setInvitationStatus` |
| GET | `/api/candidates` | — | `StoredCandidate[]` | store `candidates` |
| GET | `/api/candidates/:id` | — | candidate + linked assignments/reports | — |

> Bulk create deduplicates by `candidateEmail` (existing candidate → new assignment, no duplicate candidate row), mirroring the current mock store.

---

## 6. Candidate runtime

| Method | Path | Role | Request | Response |
|---|---|---|---|---|
| GET | `/api/me/assignment` | [C] | — | `AssessmentAssignmentSchema` (own) |
| POST | `/api/sessions` | [C] | `{ assignment_id }` | `{ session_id }` · `409` if consent not confirmed |
| GET | `/api/sessions/:id` | [C] | — | `SessionResponseSchema` — **candidate-safe items only** |
| POST | `/api/sessions/:id/consent` | [C] | `ConsentRequestSchema` | `204` (writes consent + audit) |
| POST | `/api/sessions/:id/responses` | [C] | `SubmitResponsesRequestSchema` | `{ saved: number }` |
| POST | `/api/sessions/:id/complete` | [C] | — | `{ scoring_run_id }` (enqueues scoring) |
| GET | `/api/sessions/:id/status` | [C] | — | `{ state, scoring_run_id? }` |

> **Candidate-safe delivery (critical):** `GET /api/sessions/:id` returns `SessionItemSchema[]` — `item_id`, `display_order`, `contextualized_text`, `method_family`, `response_scale`, and visible options only. It **never** includes `keyed_answer`, `reverse_scored`, `intended_meaning`, or scoring keys. Enforced server-side.

---

## 7. Scoring / Domain 6 / role-fit `[A]`

| Method | Path | Request | Response | Replaces |
|---|---|---|---|---|
| GET | `/api/scoring/:scoringRunId` | — | `ScoredResultSchema` | `getScoredResultById` |
| GET | `/api/sessions/:sessionId/scoring` | — | `ScoredResultSchema` | `getScoredResultBySession` |
| POST | `/api/contexts` | `CreateContextRequestSchema` | `ContextProfileSchema` | — |
| POST | `/api/domain6` | `ComputeDomain6RequestSchema` | `{ domain6_run_id, primary_indices, secondary_indices, confidence }` | — |
| GET | `/api/domain6/:runId` | — | Domain 6 result (**DRI never present**) | — |
| POST | `/api/role-fit` | `{ scoring_run_id, role_blueprint_id }` | role-fit result | **Phase 2** (validated blueprint only) |

> **Domain 6 is derived.** It is computed from the standardized D1–D5 profile + a stored `ContextProfile` (the 17-field form). It is never a questionnaire domain and has no bank items. The **Derailment Risk Index is permanently blocked** — never computed, stored, or returned.

---

## 8. Reports & exports

| Method | Path | Role | Request | Response | Replaces |
|---|---|---|---|---|---|
| GET | `/api/reports` | [A] | — | `ReportSchema[]` (summaries) | reports list |
| GET | `/api/reports/:id` | [A] | — | `ReportSchema` (admin_view + candidate_view) | `getReportById` |
| GET | `/api/reports/by-candidate/:candidateId` | [A] | — | `ReportSchema` | `getReportByCandidateId` |
| GET | `/api/reports/by-scoring-run/:runId` | [A] | — | `ReportSchema` | `getReportByScoringRun` |
| GET | `/api/me/report` | [C] | — | `CandidateReportViewSchema` **only** | — |
| POST | `/api/reports/:id/export` | A/C | `CreateExportRequestSchema` | `{ export_id, status: "pending" }` | — |
| GET | `/api/exports/:exportId` | A/C | — | `ExportStatusResponseSchema` | — |

> **Audience partition (critical):** `GET /api/me/report` serializes `candidate_view` exclusively. The `admin_view` object — `qc_flags`, `watch_points`, `governance_notes`, blocked-domain dimensions — is **never** sent to a candidate. Blocked content is absent at build time, not hidden by the client. A candidate may request export only with `audience: "candidate"`; `audience: "admin"` from a candidate → `403`.

---

## 9. Admin governance views `[A]`

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/api/admin/governance` | — | governance gate states + 7-layer status (drives `/admin`) |
| GET | `/api/admin/users` | — | user list |

---

## 10. Schema → endpoint index

| Zod schema (`src/lib/api/schemas.ts`) | Used by |
|---|---|
| `LoginRequestSchema` | §1 login |
| `BankItemSchema` | §2 bank |
| `SessionItemSchema` / `SessionResponseSchema` | §6 candidate-safe item delivery |
| `AgentMessageRequestSchema`, `AgentTurnSchema` | §3 agent |
| `RoleBlueprintSchema`, `ApproveBlueprintRequestSchema`, `GovernanceWarningSchema` | §4 blueprints |
| `AssessmentBlueprintSchema`, `ContextualizedItemSchema` | §3–4 |
| `CreateAssignmentRequestSchema`, `CreateBulkAssignmentRequestSchema`, `SetInvitationStatusRequestSchema`, `AssessmentAssignmentSchema`, `CreatedAssignmentRecordSchema` | §5 assignments |
| `ConsentRequestSchema`, `SubmitResponsesRequestSchema`, `ItemResponseSchema` | §6 runtime |
| `ScoredResultSchema`, `DimensionScoreSchema`, `DomainScoreSchema`, `QCFlagSchema` | §7 scoring |
| `ContextProfileSchema`, `CreateContextRequestSchema`, `ComputeDomain6RequestSchema` | §7 Domain 6 |
| `ReportSchema`, `AdminReportViewSchema`, `CandidateReportViewSchema` | §8 reports |
| `CreateExportRequestSchema`, `ExportStatusResponseSchema` | §8 exports |

---

## Governance invariants enforced by this contract

1. **Two roles only.** No endpoint introduces a third role.
2. **Metadata immutability.** No endpoint accepts edits to bank item metadata. The agent writes `contextualized_text` only.
3. **Domain 6 derived-only.** No bank/form endpoint ever carries D6 items; D6 is computed post-scoring from a context profile.
4. **Candidate-safe boundary.** `/api/me/report` and candidate exports use `candidate_view` only; sessions use the candidate-safe item projection.
5. **Governance gates block.** Approval and report endpoints return `422` (not silent success) when a gate fails, with a rule reference.
6. **DRI permanently blocked.** No endpoint computes or returns the Derailment Risk Index.
7. **Auditability.** Approval, submission, scoring suppression, report release, and export each emit an append-only `AuditEvent`; a failed audit write fails the operation (SEV-1).

---

## Not in this step (still deferred)

No route handlers, no Auth.js setup, no Prisma client generation/migration, no frontend `fetch` calls, no mock-store replacement. This step delivers only the **persistence schema**, the **validation schemas**, and **this contract**. Implementation follows the phased B0–B9 plan in `docs/BACKEND_ARCHITECTURE.md §10`.
