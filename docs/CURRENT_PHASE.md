# Nexus — Current Phase

**Phase:** Frontend Integration Foundation
**Status:** IN PROGRESS
**Last updated:** 2026-07-09
**Prerequisite:** Backend build complete (Prisma/Postgres, Auth.js, all 28 API routes, scoring, reports, exports, audit logging — see `PROJECT_STATUS.md`)

---

## Objective

The backend is done and the entire product UI already exists (built in earlier phases
against mock data — see `IMPLEMENTATION_ROADMAP.md` for that history). This phase migrates
each page off the client-side mock store and onto the real backend, **one resource at a
time**, without breaking pages that haven't been migrated yet.

The mechanism (established in the foundation commit and repeated for every migrated page):

1. A typed fetch client per backend resource — `src/lib/api/*-client.ts` (all 7 exist:
   bank, blueprints, assignments, sessions, scoring, reports, exports).
2. A page-level data adapter — `src/lib/data/*-data.ts` — that branches on `isApiMode()`
   and returns a normalized shape whether it hit the API or the mock store.
3. `NEXT_PUBLIC_DATA_SOURCE` env toggle (`mock` default in `.env.example`; `api` in this
   environment's `.env`, so the app is live against Neon Postgres right now for migrated
   pages).

Full page-by-page status lives in **`INTEGRATION_STATUS.md`** — this file tracks the
narrative of the phase, not the exhaustive table.

---

## Completed in this phase (chronological)

| Commit | What |
|---|---|
| `a0f929b` — Frontend-Integration-Foundation | Built the entire `src/lib/api/` client layer (7 clients + `client.ts`/`config.ts`) and `.env.example` toggle. Nothing wired into a page yet. |
| `3072c6d` | First two pages migrated: `dashboard/blueprints/page.tsx` + `dashboard/blueprints/[id]/page.tsx` (via new `blueprints-data.ts`), and `dashboard/assessments/page.tsx` (via new `assignments-data.ts`). |
| `8b10391` | `.env` flipped to `NEXT_PUBLIC_DATA_SOURCE="api"` — the running app started reading live data for the migrated pages. |
| `d7fb7dc` — **latest completed milestone** | `dashboard/reports/page.tsx` migrated via new `reports-data.ts` (calls `GET /api/reports` + `GET /api/assignments` + `GET /api/blueprints` for KPI cards and lookups). |

---

## Next task (logical continuation)

**Migrate `src/app/dashboard/reports/[id]/page.tsx` (admin report detail).**

Why this is next: it's the direct sibling of the just-migrated reports list, the backend
endpoint already exists and is unused (`getReport(reportId)` in `reports-client.ts` →
`GET /api/reports/:reportId`), and the page currently imports `REPORT_1`/`SCORED_RESULT_1`
straight from `mock-data` with no adapter at all. Follow the `reports-data.ts` pattern: add
a `loadReportDetail(id)` function (new adapter or extend `reports-data.ts`), branch the page
on `isApiMode()`, keep the mock path as fallback.

## After that, in priority order

1. **Candidate-facing reporting pages** — `candidate/results/[id]/page.tsx`,
   `candidate/report/[id]/page.tsx`, `candidate/dashboard/page.tsx`. All three are fully
   mock; `getMyReport()` (`GET /api/me/report`, candidate-safe) is implemented and unused.
2. **`dashboard/page.tsx`** (admin home KPIs/analytics) — still reads `mock-data/reports` +
   `mock-data/scored-results` directly.
3. **Assignment creation** — `dashboard/assessments/new/page.tsx` and
   `dashboard/assessments/bulk/page.tsx`. Both read `mock-data/blueprints` for the picker and
   write only to the in-memory store. `createAssignment()`/`createAssignmentsBulk()` clients
   exist and are unused.
4. **`dashboard/candidates/page.tsx` + `[id]/page.tsx`** — currently have *no* adapter at
   all, not even a partial one; they read `useStore()` directly and the UI literally says
   "Mock mode: new assignments reset on refresh." No candidates-specific backend endpoint
   exists yet either — likely needs to be derived from `/api/assignments` the way the
   reports/assignments pages derive their KPIs.
5. **Candidate assessment-taking flow** — the largest remaining gap, not really a
   "migration" so much as a from-scratch build: `assessment/page.tsx`,
   `assessment/[sessionId]/page.tsx`, and `assessment/complete/page.tsx` are still fully
   hardcoded prototypes that were never even wired to the mock store. `sessions-client.ts`
   and `scoring-client.ts` are fully implemented and completely unused. There is also no
   consent-collection UI anywhere despite `Assignment.consent_confirmed` existing in the
   schema and API.
6. **Wire `exports-client.ts`** into `ReportExportButton.tsx`, which currently renders but
   makes no API call.
7. **Admin panel** (`/admin`, `/admin/users`, `/admin/settings`) — no data layer of any kind
   yet; still static/placeholder.

---

## Out of scope for this phase

- Any change to `prisma/schema.prisma` or API route behavior — backend is considered done
  for V1 provisional scope.
- The parallel UI/visual redesign stream tracked in `UI_REDESIGN_CHECKPOINT.md` — separate
  effort, do not conflate.
- D3/D5 activation, D6 scoring engine, real IRT/GGUM scoring, real PDF export generation —
  all Phase-2-and-later backend work, not frontend wiring.
