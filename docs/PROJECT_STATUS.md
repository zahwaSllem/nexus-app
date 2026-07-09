# Nexus — Project Status

**Last updated:** 2026-07-09
**Session:** Backend build complete; frontend integration in progress
**Platform version:** V1 (pre-launch)

---

## What Nexus Is

Nexus is a governed enterprise workforce assessment platform. It measures human capability across six domains (D1–D6) using a psychometric question bank, produces dimension-level scored profiles, and generates audience-specific reports for hiring and development decisions.

It is **not a survey tool**. It is a regulated measurement ecosystem with a governed data model, an audit-logged backend, and deterministic reporting rules.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict, 0 `tsc --noEmit` errors) |
| Styling | Tailwind CSS |
| Components | Custom (Button, Card, Badge) + Radix primitives |
| Database | PostgreSQL (Neon, serverless) via Prisma ORM 6 |
| Auth | Auth.js (NextAuth v5), Credentials provider, scrypt-hashed passwords, JWT sessions, role-gated middleware |
| API | Next.js Route Handlers under `src/app/api/**`, Zod-validated request/response schemas, OpenAPI spec generated at `/api/openapi.json` (`/api/docs` for Swagger UI) |
| Frontend data | Dual-mode: `NEXT_PUBLIC_DATA_SOURCE` toggles each migrated page between the real API and the legacy in-browser mock store — see `INTEGRATION_STATUS.md` |
| Client-only state (pre-migration pages) | React Context (`store-provider.tsx`) seeded from `src/lib/mock-data/*`, resets on refresh |

---

## Repository Structure

```
nexus-app/
├── docs/                              ← Source documents + project docs
│   ├── PRD.md                         ← Master PRD v2.0 — governance/scoring spec (unchanged, still authoritative)
│   ├── ScoringSpecification.md        ← Operational scoring standard
│   ├── AutomatedReportingStandard.md  ← Reporting architecture
│   ├── Domain6Framework.md            ← Domain 6 derived-layer spec
│   ├── UI_REDESIGN_CHECKPOINT.md      ← Separate visual-design stream (not functional status)
│   ├── PROJECT_STATUS.md              ← This file
│   ├── IMPLEMENTATION_ROADMAP.md      ← Full phase roadmap
│   ├── CURRENT_PHASE.md               ← Active phase detail
│   ├── TODO.md                        ← Prioritized task list
│   ├── INTEGRATION_STATUS.md          ← Page-by-page mock ↔ API migration matrix (new)
│   ├── API_CONTRACT.md                ← STALE — written pre-backend, describes a "no live handlers" draft that no longer matches reality
│   └── BACKEND_ARCHITECTURE.md        ← STALE — written pre-backend as a build plan, not a description of what was built
│
├── prisma/
│   ├── schema.prisma                  ← 15 models, full governance-aware schema
│   ├── migrations/20260705102934_init/← Initial migration (live)
│   └── seed.ts                        ← Seeds admin/candidate users + demo data
│
├── src/
│   ├── auth.ts / auth.config.ts       ← Auth.js config (Node + Edge split)
│   ├── middleware.ts                  ← Role-based route protection
│   │
│   ├── lib/
│   │   ├── types/nexus.ts             ← Domain TypeScript types
│   │   ├── mock-data/                 ← Legacy static prototype data (still used by unmigrated pages)
│   │   ├── scoring/mock-scorer.ts     ← Deterministic V1 scoring engine (spec-compliant, not real IRT/GGUM)
│   │   ├── server/reports.ts          ← Report view builder (admin_view/candidate_view partitioning)
│   │   ├── server/exports.ts          ← Export record creation (provisional, no PDF binary yet)
│   │   ├── api/                       ← Frontend API client layer (7 resource clients) + config/guard/schemas/openapi
│   │   ├── data/                      ← Per-page data adapters (mock ↔ API branching) — 3 exist so far
│   │   └── providers/store-provider.tsx ← Legacy client-side mock store
│   │
│   ├── app/
│   │   ├── api/                       ← 28 route handlers: bank, blueprints, assignments, sessions, scoring, reports, exports, auth, me, docs
│   │   ├── page.tsx                   ← Marketing landing page (D6 card still mislabeled "Roadmap")
│   │   ├── login/page.tsx             ← Real Auth.js sign-in, correct role-based redirect
│   │   ├── dashboard/                 ← Admin shell: agent, blueprints, assessments, candidates, reports
│   │   ├── admin/                     ← Governance/users/settings (no data layer yet)
│   │   ├── candidate/                 ← Candidate dashboard/results/report (still mock)
│   │   └── assessment/                ← Candidate assessment-taking flow (still fully hardcoded, pre-mock-store)
│   │
│   └── components/                    ← ui/, layout/, agent/, dashboard/, report/
```

---

## Current Build State

### Backend — ✅ COMPLETE (V1 provisional)

Built across several "up" commits plus two named sprints (`Sprint 7 — Reports APIs`,
`Export API Live Smoke Test Results`) between 2026-06-23 and 2026-07-09. Verified directly
against `prisma/schema.prisma` and all 28 `src/app/api/**/route.ts` handlers:

| Area | Status | Notes |
|---|---|---|
| Database | ✅ | Prisma schema (15 models) + 1 migration, live on Neon Postgres |
| Auth | ✅ | Auth.js v5, Credentials provider backed by real `users` table (scrypt hashes), JWT session carries `role_type`, middleware enforces `/dashboard*`+`/admin*` = admin, `/candidate*`+`/assessment*` = candidate |
| Bank API | ✅ | `GET /api/bank`, `GET /api/bank/:itemId` — admin-only, never exposes `keyed_answer`/`reverse_scored` |
| Blueprints API | ✅ | List/get/assessment/governance/approve — approval blocked (422) while any `blocking`-severity governance warning is open |
| Assignments API | ✅ | List (paginated/filtered)/get/create/bulk-create/update — atomic transactions, audit-logged |
| Sessions API | ✅ | start/get/questions/answers(PATCH)/submit — ownership-checked, candidate-safe item serialization (no keyed answers), locked after submit |
| Scoring API | ✅ | `POST /api/scoring/run` executes `mock-scorer.ts` and persists a `ScoringRun`; admin-only reads |
| Reports API | ✅ | generate/list/get/by-candidate/by-scoring-run + `GET /api/me/report` (candidate-safe) |
| Exports API | ✅ | `POST /api/reports/:id/export`, `GET /api/exports/:id` — V1 provisional: JSON payload + checksum, **no real PDF binary yet** |
| Audit logging | ✅ | Append-only `audit_events` table; every mutating endpoint writes an audit row in the same transaction (fail-closed — if the audit write fails, the whole operation fails) |
| OpenAPI docs | ✅ | Generated spec at `/api/openapi.json`, Swagger UI at `/api/docs` |

### Frontend — 🔶 IN PROGRESS (Frontend Integration Foundation)

The UI for every route in the roadmap already exists (built in earlier phases against mock
data). The current effort is migrating each page from the mock store to the real backend,
one resource at a time, via a typed API client layer + per-page data adapters. See
**`INTEGRATION_STATUS.md`** for the full page-by-page matrix. Summary:

- **Migrated (dual-mode, live when `NEXT_PUBLIC_DATA_SOURCE=api`):** blueprint list/detail,
  assignments list, reports list (most recent, 2026-07-09).
- **Still mock-only, has runtime data:** admin home, report detail, assignment
  creation (new/bulk), agent wizard, candidates list/detail, all candidate-facing pages.
- **Still fully hardcoded (never even wired to the mock store):** the entire candidate
  assessment-taking flow (`/assessment`, `/assessment/[sessionId]`, `/assessment/complete`)
  and the missing per-use-case consent step.
- **Backend capability with zero UI caller yet:** `sessions-client.ts`, `scoring-client.ts`,
  `exports-client.ts` are fully implemented and unused.

### TypeScript status

`npx tsc --noEmit` — **0 errors** repo-wide. The previously tracked `Set<string>` iteration
error in `assessment/[sessionId]/page.tsx` no longer reproduces under the current
`tsconfig.json` (`lib: ["esnext"]`); it can be removed from known-issues tracking.

---

## Known Issues

| Issue | File | Notes |
|---|---|---|
| D6 domain card still says "Roadmap" | `src/app/page.tsx` (line ~54) | Should describe D6 as a derived context/fit layer, not a questionnaire domain — never fixed despite being tracked since the earliest docs |
| No consent step anywhere in the app | n/a | `Assignment.consent_confirmed` exists in the Prisma schema and API layer; no page ever sets it |
| Candidate assessment session is a static prototype | `src/app/assessment/[sessionId]/page.tsx` | Hardcoded question list, not wired to `sessions-client.ts` or even the mock store |
| Export button is UI-only | `src/components/report/ReportExportButton.tsx` | No call to `exports-client.ts` |
| `docs/API_CONTRACT.md` / `docs/BACKEND_ARCHITECTURE.md` are stale | `docs/` | Both still say "no backend code written yet" / "contract draft only" — false; flagged here, not rewritten as part of this pass |

---

## Governance Constants (V1) — unchanged, verified against code

- Only 2 use cases permitted: `developmental` and `hiring_support_validated_blueprint` (`UseCase` enum, `prisma/schema.prisma`)
- D3 (Motivation) and D5 (Applied Work): `operational_blocked`. Enforced in `src/lib/scoring/mock-scorer.ts` (`BLOCKED_DOMAINS = new Set(["D3", "D5"])`) — items from these domains are never scored and their dimensions always resolve to `display_state: "blocked"`.
- D6: no scoring engine exists yet (context profile is captured on the Role Blueprint but no CAI/DII computation exists). Reports show an explicit "under development, not yet available in V1" notice.
- No omnibus/total-person score anywhere in the schema or scoring engine — dimensions and domains are the only scored units.
- Every `ScoringRun`/`Report` carries `scoring_version` and `synthesis_weight_version`, both currently `"1.0.0-provisional"`.
- Audit logging failure blocks the originating operation (fail-closed, SEV-1) — implemented, not just planned, via same-transaction `prisma.auditEvent.create` calls.
- Candidate-safe views (`candidate_view` on `Report`, `GET /api/me/report`, session question payloads) never include `qc_flags`, `keyed_answer`, `admin_view`, or blocked/downgraded dimension data — enforced server-side at build/serialization time, not hidden client-side.

---

## Mock Credentials

```
Admin:     admin@nexus.io    / admin123
Candidate: candidate@nexus.io / password123
```

These are now real seeded rows in the `users` table (`prisma/seed.ts`, scrypt-hashed), verified through Auth.js's Credentials provider — not hardcoded frontend constants as in the pre-backend build.
