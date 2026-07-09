# Nexus — Frontend/Backend Integration Status

**Last updated:** 2026-07-09
**Purpose:** Single source of truth for which pages talk to the real backend vs. the
in-browser mock store. Update this file every time a page is migrated — `CURRENT_PHASE.md`
and `TODO.md` link here instead of duplicating the table.

---

## The three data layers

Nexus frontend code can source data from three different places, layered oldest to newest:

1. **`src/lib/mock-data/*`** — static TypeScript constants (`BLUEPRINTS`, `QUESTION_BANK`,
   `REPORT_1`, etc.). The original prototype data source. Still imported directly by pages
   that haven't been touched by the integration effort.
2. **`src/lib/providers/store-provider.tsx`** — a React Context that seeds its initial state
   from `mock-data` and then holds runtime mutations (e.g. an assignment created via the
   "New Assessment" form) in memory for the session. Several admin pages read this via
   `useStore()` instead of importing `mock-data` directly, but it is still 100% client-side
   and resets on refresh.
3. **`src/lib/api/*-client.ts` + `src/lib/data/*-data.ts`** — the real backend path. A
   typed `apiFetch` wrapper (`src/lib/api/client.ts`) plus one client module per resource
   (bank, blueprints, assignments, sessions, scoring, reports, exports), and a thin
   per-page **data adapter** (`src/lib/data/*-data.ts`) that branches on `isApiMode()` and
   returns either live API data or the old mock/store data, so a page's rendering code
   doesn't need to know which mode it's in.

**Toggle:** `NEXT_PUBLIC_DATA_SOURCE` (`mock` | `api`), read via `isApiMode()`/`isMockMode()`
in `src/lib/api/config.ts`.
- `.env.example` default: `"mock"`.
- `.env` (this environment, active now): `"api"` — the app is currently running against the
  real Neon Postgres backend for every page that has been migrated.

## Canonical migration pattern

`src/lib/data/reports-data.ts` + `src/app/dashboard/reports/page.tsx` is the reference
implementation for migrating a page:

1. Add an adapter file under `src/lib/data/` that exports a `load<Thing>()` async function
   calling the relevant `*-client.ts` function(s).
2. In the page, branch on `isApiMode()`: call the adapter + `useState`/`useEffect` for the
   API path, keep the existing mock/store read for the mock path, and normalize both into
   one row shape so the JSX renders identically either way.
3. Surface `ApiError` messages in a loading/error state; don't let a failed fetch crash the
   page.

## API client layer — resource → endpoint map

All 7 client modules exist and are fully typed (`src/lib/api/*-client.ts`); not all are
wired into a page yet (see matrix below).

| Client | Functions | Endpoints |
|---|---|---|
| `bank-client.ts` | `listBankItems`, `getBankItem` | `GET /api/bank`, `GET /api/bank/:itemId` |
| `blueprints-client.ts` | `listBlueprints`, `getBlueprint`, `getAssessmentBlueprint`, `getBlueprintGovernance`, `approveBlueprint` | `GET/POST /api/blueprints*` |
| `assignments-client.ts` | `listAssignments`, `getAssignment`, `createAssignment`, `createAssignmentsBulk`, `updateAssignment` | `GET/POST/PATCH /api/assignments*` |
| `sessions-client.ts` | `startSession`, `getSession`, `getSessionQuestions`, `saveAnswers`, `submitSession` | `POST/GET/PATCH /api/sessions*` |
| `scoring-client.ts` | `runScoring`, `getScoringRun`, `getSessionScoring` | `POST/GET /api/scoring*` |
| `reports-client.ts` | `generateReport`, `listReports`, `getReport`, `getReportsByCandidate`, `getReportByScoringRun`, `getMyReport` | `GET/POST /api/reports*`, `GET /api/me/report` |
| `exports-client.ts` | `createExport`, `getExport` | `POST /api/reports/:id/export`, `GET /api/exports/:id` |

## Data adapter layer (`src/lib/data/`)

| Adapter | Loads | Backs | Used by |
|---|---|---|---|
| `blueprints-data.ts` | Blueprint list + detail (+ assessment blueprint + bank item lookups) | `bank-client`, `blueprints-client` | `dashboard/blueprints/page.tsx`, `dashboard/blueprints/[id]/page.tsx` |
| `assignments-data.ts` | Assignment list + blueprint lookup for KPI/columns | `assignments-client`, `blueprints-client` | `dashboard/assessments/page.tsx` |
| `reports-data.ts` | Report list + assignment/blueprint lookups for KPI/columns | `reports-client`, `assignments-client`, `blueprints-client` | `dashboard/reports/page.tsx` |

No adapter yet exists for report *detail*, candidate views, sessions, scoring, or exports —
those clients are implemented and unused.

## Page-by-page status

### Migrated — dual-mode (live API when `NEXT_PUBLIC_DATA_SOURCE=api`)

| Page | Adapter |
|---|---|
| `src/app/dashboard/blueprints/page.tsx` | `blueprints-data.ts` |
| `src/app/dashboard/blueprints/[id]/page.tsx` | `blueprints-data.ts` |
| `src/app/dashboard/assessments/page.tsx` | `assignments-data.ts` |
| `src/app/dashboard/reports/page.tsx` | `reports-data.ts` (most recently migrated — 2026-07-09) |

### Still mock-only — has runtime data, just not from the API

| Page | Source | Notes |
|---|---|---|
| `src/app/dashboard/page.tsx` | `mock-data/reports`, `mock-data/scored-results` | Admin home KPIs/analytics |
| `src/app/dashboard/reports/[id]/page.tsx` | `mock-data/reports`, `mock-data/scored-results` | Report detail — `getReport()` client exists, unused |
| `src/app/dashboard/assessments/new/page.tsx` | `mock-data/blueprints` | `createAssignment()` client exists, unused |
| `src/app/dashboard/assessments/bulk/page.tsx` | `mock-data/blueprints` | `createAssignmentsBulk()` client exists, unused |
| `src/app/dashboard/agent/page.tsx` | `mock-data/agent-transcripts`, `blueprints`, `assessment-blueprints`, `question-bank` | Scripted transcript replay; no live-agent backend exists at all |
| `src/app/dashboard/candidates/page.tsx` | `useStore()` (mock store) | UI copy literally says "Mock mode: new assignments reset on refresh" |
| `src/app/dashboard/candidates/[id]/page.tsx` | `useStore()` (mock store) | Same |
| `src/app/candidate/dashboard/page.tsx` | `mock-data/assignments`, `mock-data/scored-results` | `getMyReport()` client exists, unused |
| `src/app/candidate/results/[id]/page.tsx` | `mock-data/scored-results`, `mock-data/reports` | Same |
| `src/app/candidate/report/[id]/page.tsx` | `mock-data/reports` | Same |

### Still mock-only — hardcoded local constants (never wired even to the mock store)

| Page | Notes |
|---|---|
| `src/app/assessment/page.tsx` | Candidate assessment portal — hardcoded candidate/assessment/domain constants |
| `src/app/assessment/[sessionId]/page.tsx` | Session runner — hardcoded question list; `sessions-client.ts` fully unused |
| `src/app/assessment/complete/page.tsx` | Static confirmation page |
| No consent page exists anywhere | `Assignment.consent_confirmed` exists in the Prisma schema; no UI ever sets it |

### No data layer of any kind (static/UI-only)

`src/app/admin/page.tsx`, `src/app/admin/users/page.tsx`, `src/app/admin/settings/page.tsx`,
`src/app/login/page.tsx` (real Auth.js `signIn()`, not mock — see `PROJECT_STATUS.md`),
`src/app/logout/page.tsx`, `src/app/page.tsx` (public marketing page).

### Backend capability with zero UI caller

- `scoring-client.ts` (`runScoring`, `getScoringRun`, `getSessionScoring`) — no page triggers
  scoring or displays a scoring run directly.
- `exports-client.ts` (`createExport`, `getExport`) — `ReportExportButton.tsx` is a UI-only
  stub with no API call.
- `sessions-client.ts` — entirely unused; the real candidate assessment flow does not exist
  yet (see hardcoded pages above).

---

## Keeping this doc current

Whenever a page moves from mock to dual-mode API, move its row from "Still mock-only" to
"Migrated" above and update the "most recently migrated" note in `CURRENT_PHASE.md`.
