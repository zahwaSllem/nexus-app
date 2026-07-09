# Nexus — TODO

**Last updated:** 2026-07-09
**Active effort:** Frontend Integration Foundation — migrating pages from the mock store to the live backend (see `CURRENT_PHASE.md`, `INTEGRATION_STATUS.md`)

Ordered by priority. Complete top to bottom unless marked independent.

---

## 1. Admin report detail (next task)

- [ ] **`src/app/dashboard/reports/[id]/page.tsx`** — replace `REPORT_1`/`SCORED_RESULT_1`
  mock imports with a dual-mode load. Add `loadReportDetail(id)` (new file or extend
  `src/lib/data/reports-data.ts`) calling `getReport(id)` from `reports-client.ts`
  (`GET /api/reports/:reportId`). Follow the `reports-data.ts` / `dashboard/reports/page.tsx`
  pattern: `isApiMode()` branch, loading/error state via `ApiError`, mock path kept as
  fallback.

## 2. Candidate-facing reporting pages (independent of each other)

- [ ] **`src/app/candidate/dashboard/page.tsx`** — replace `ASSIGNMENT_1`/`ASSIGNMENT_3`/
  `SCORED_RESULT_1` mock imports.
- [ ] **`src/app/candidate/results/[id]/page.tsx`** — replace `SCORED_RESULT_1`/`REPORT_1`.
- [ ] **`src/app/candidate/report/[id]/page.tsx`** — replace `REPORT_1`.
- All three should use `getMyReport()` (`GET /api/me/report`, candidate-safe DTO) from
  `reports-client.ts` — implemented, currently unused.

## 3. Admin home KPIs

- [ ] **`src/app/dashboard/page.tsx`** — replace `mock-data/reports` + `mock-data/scored-results`
  imports feeding `AssessmentFunnel`, `StatusDistribution`, `ReleaseStateBreakdown`,
  `DomainAnalytics`, `ActivityTimeline`. Likely needs a new aggregating adapter rather than
  a single existing client call.

## 4. Assignment creation flows

- [ ] **`src/app/dashboard/assessments/new/page.tsx`** — wire the blueprint picker off
  `mock-data/blueprints` and submit via `createAssignment()` (`assignments-client.ts`,
  `POST /api/assignments`) instead of only writing to the local store.
- [ ] **`src/app/dashboard/assessments/bulk/page.tsx`** — same, via `createAssignmentsBulk()`
  (`POST /api/assignments/bulk`).

## 5. Candidates admin pages (no adapter exists yet — build from scratch)

- [ ] **`src/app/dashboard/candidates/page.tsx`** and **`[id]/page.tsx`** — currently read
  `useStore()` directly with no API path at all (UI literally says "Mock mode: new
  assignments reset on refresh"). No dedicated candidates endpoint exists in the backend;
  derive candidate rows from `GET /api/assignments` (as the reports/assignments adapters
  already do for their own KPI cards) or confirm whether a `/api/candidates` endpoint should
  be added to the backend first.

## 6. Candidate assessment-taking flow (largest remaining gap — not a migration, a build)

- [ ] **`src/app/assessment/page.tsx`** — currently fully hardcoded (candidate name,
  assessment metadata, domain list are all local constants); not even wired to the mock
  store. Needs to load the candidate's real assignment.
- [ ] **`src/app/assessment/[sessionId]/page.tsx`** — currently a hardcoded ~8-question
  prototype. Wire to `sessions-client.ts`: `startSession`, `getSessionQuestions`,
  `saveAnswers` (partial-save, PATCH), `submitSession`. All four functions exist and are
  completely unused anywhere in the app today.
- [ ] **`src/app/assessment/complete/page.tsx`** — static confirmation page; link to the
  real report once generated.
- [ ] **Build a consent step.** No page anywhere sets `Assignment.consent_confirmed`, even
  though the field exists in the Prisma schema and is part of the governance model
  (consent is per-use-case, not global — see `PRD.md` §15). This UI does not exist yet at
  any fidelity, mock or real.
- [ ] **Trigger scoring.** `scoring-client.ts` (`runScoring`, `getScoringRun`,
  `getSessionScoring`) is implemented and has zero callers. Decide whether scoring runs
  automatically on submit or is a separate admin action, then wire it.

## 7. Report export wiring

- [ ] **`src/components/report/ReportExportButton.tsx`** — currently renders UI only, no
  network call. Wire to `exports-client.ts` (`createExport`, `getExport`). Note the backend
  itself is provisional here too — it returns a JSON payload + checksum, not a real PDF
  binary (Phase 2+ backend work, out of scope for this frontend task).

## 8. Admin panel (no data layer of any kind)

- [ ] `src/app/admin/page.tsx`, `src/app/admin/users/page.tsx`, `src/app/admin/settings/page.tsx`
  — all static/placeholder today. Lowest priority; not blocking the primary admin/candidate
  journeys.

---

## Cleanup (small, independent, can be done anytime)

- [ ] **`src/app/page.tsx`** — D6 domain card still labeled "Roadmap" (~line 54). Should read
  as a derived context/fit layer computed from D1–D5 scores + a context form, not a
  questionnaire domain. Tracked since the earliest project docs; never fixed.
- [ ] Decide the long-term status of `src/app/dashboard/agent/page.tsx` — it's a fully
  scripted transcript replay (`TRANSCRIPT_A`) with no live-agent backend. If it's staying a
  scripted demo permanently, note that explicitly somewhere; if a real agent endpoint is
  planned, it isn't started.

---

## Documentation follow-ups (not code, flagged for awareness)

- `docs/API_CONTRACT.md` still states "Contract draft only — no live handlers" — false, 28
  handlers are live. Not rewritten as part of this pass; flagged for a future doc pass.
- `docs/BACKEND_ARCHITECTURE.md` still states "Plan only — no backend code written yet" —
  false, the full backend described in `PROJECT_STATUS.md` exists. Same as above.

---

## Governance / architecture constraints (do not violate — unchanged)

1. AI agent selects assessment content; admin only reviews/approves.
2. `original_text` (bank, immutable) vs `contextualized_text` (agent-generated) — never
   conflate or mutate bank item metadata.
3. Domain 6 is a derived layer, never a questionnaire domain — no D6 items in any bank query.
4. No omnibus/total-person score — dimensions are the primary scored unit.
5. D3 and D5 are `operational_blocked` — enforced in `mock-scorer.ts`; must never reach a
   candidate view. Deferred to Phase 2+.
6. Every scored/report output carries `scoring_version` + `synthesis_weight_version`
   (currently `"1.0.0-provisional"`).
