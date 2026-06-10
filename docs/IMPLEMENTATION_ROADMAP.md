# Nexus — Implementation Roadmap

**Last updated:** 2026-06-10  
**Approved by:** User (this session)

This document is the canonical reference for what to build and in what order.  
See `CURRENT_PHASE.md` for the active phase detail and `TODO.md` for the immediate task list.

---

## Product Architecture Summary

The Nexus product has two roles: **Admin** and **Candidate**.

### Admin journey (canonical)

```
Login
  ↓
/dashboard/agent        ← AI Assessment Agent wizard (PRIMARY FEATURE)
  Step 1: Interview
  Step 2: Role Blueprint review
  Step 3: Assessment Blueprint preview
  Step 4: Governance review
  Step 5: Approval
  ↓
/dashboard/blueprints/[id]       ← Saved blueprint (read-only)
  ↓
/dashboard/assessments/new       ← Assign to candidate
  ↓
/dashboard/reports/[id]          ← View scored report
```

### Candidate journey (canonical)

```
Login
  ↓
/assessment              ← View assigned assessment
  ↓
/assessment/consent      ← Per-use-case informed consent
  ↓
/assessment/[sessionId]  ← Take assessment (all 5 method families)
  ↓
/assessment/complete     ← Submission confirmed
  ↓
/assessment/report       ← Candidate-safe developmental report
```

---

## Core Design Rules (never violate)

1. **AI agent selects everything.** Admin never manually picks questions. Admin only reviews and approves.
2. **Contextualized text ≠ original text.** Every item has `original_text` (immutable from bank) and `contextualized_text` (agent-generated). The metadata (`item_id`, `dimension_id`, `facet_id`, `use_status`, etc.) is NEVER modified.
3. **Domain 6 is not a questionnaire domain.** It is a derived context/fit layer computed after D1–D5 scoring from a 17-field context form. Never include D6 items in a question bank.
4. **No omnibus total-person score.** Dimensions are the primary scored unit. Domain summaries are optional.
5. **Governance gates block output, not just hide it.** D3/D5 items must not reach candidates. D6 DRI is permanently blocked.
6. **Scoring is deterministic.** Every scored output carries `scoring_version` and `synthesis_weight_version` tags. They are currently `1.0.0-provisional`.

---

## Full Route Map

### Admin routes (Sidebar layout)

| Route | Status | Description |
|---|---|---|
| `/dashboard` | Pre-existing, needs update | Admin home — KPIs, recent activity, quick actions |
| `/dashboard/agent` | **NOT BUILT — Phase 2** | AI Assessment Agent wizard — primary feature |
| `/dashboard/blueprints` | NOT BUILT — Phase 3 | Blueprint library (read-only list) |
| `/dashboard/blueprints/[id]` | NOT BUILT — Phase 3 | Role Blueprint detail (read-only) |
| `/dashboard/blueprints/[id]/assessment` | NOT BUILT — Phase 3 | Assessment Blueprint item preview |
| `/dashboard/blueprints/[id]/governance` | NOT BUILT — Phase 3 | Governance warnings (read-only) |
| `/dashboard/assessments` | NOT BUILT — Phase 4 | Assigned assessments list |
| `/dashboard/assessments/new` | NOT BUILT — Phase 4 | Assign assessment form |
| `/dashboard/candidates` | Pre-existing | Candidate roster |
| `/dashboard/candidates/[id]` | Pre-existing, empty | Candidate detail + linked reports |
| `/dashboard/reports` | Pre-existing | Reports list |
| `/dashboard/reports/[id]` | Pre-existing, needs refactor — Phase 6 | Admin report (real scoring structure) |
| `/admin` | Pre-existing | Governance gates + system layer status |
| `/admin/users` | Pre-existing | User management |
| `/admin/settings` | Pre-existing, empty | Platform settings |

### Candidate routes (standalone shell, no Sidebar)

| Route | Status | Description |
|---|---|---|
| `/assessment` | Pre-existing, needs refactor — Phase 5 | Candidate portal (view assigned assessment) |
| `/assessment/consent` | NOT BUILT — Phase 5 | Per-use-case informed consent |
| `/assessment/[sessionId]` | Pre-existing, needs refactor — Phase 5 | Session runner (real items, all method families) |
| `/assessment/complete` | Pre-existing, light refactor — Phase 5 | Submission confirmation |
| `/assessment/report` | NOT BUILT — Phase 5 | Candidate-safe developmental report |

### Public

| Route | Status | Description |
|---|---|---|
| `/` | Pre-existing, needs light fix | Marketing landing page |
| `/login` | Pre-existing, needs redirect fix | Login with role switcher |

---

## Phase Breakdown

---

### Phase 1 — Data Foundation ✅ COMPLETE

**Goal:** All TypeScript types and mock data files created. No UI changes.

**Deliverables:**

| File | Status |
|---|---|
| `src/lib/types/nexus.ts` | ✅ Done |
| `src/lib/mock-data/question-bank.ts` | ✅ Done — 51 real items |
| `src/lib/mock-data/agent-transcripts.ts` | ✅ Done — 2 transcripts |
| `src/lib/mock-data/blueprints.ts` | ✅ Done — bp-001 (approved), bp-002 (draft) |
| `src/lib/mock-data/assessment-blueprints.ts` | ✅ Done — abp-001 (22 items), abp-002 (26 items) |
| `src/lib/mock-data/assignments.ts` | ✅ Done — asgn-001 (pending), asgn-002 (completed) |
| `src/lib/mock-data/scored-results.ts` | ✅ Done — score-001 |
| `src/lib/mock-data/reports.ts` | ✅ Done — rpt-001 |
| `src/lib/scoring/mock-scorer.ts` | ✅ Done |

**TypeScript:** 0 errors in new code. 1 pre-existing error in `assessment/[sessionId]/page.tsx` (Set iteration, not introduced by Phase 1).

---

### Phase 2 — AI Assessment Agent Wizard 🔲 NEXT

**Goal:** Build `/dashboard/agent` as a five-step wizard. This is the core product feature. All agent components are new.

**Route:** `src/app/dashboard/agent/page.tsx`

**Five steps (all internal state on one page):**

| Step | Name | What renders | Data source |
|---|---|---|---|
| 1 | Interview | `AgentChatInterface` | `TRANSCRIPT_A` from `agent-transcripts.ts` |
| 2 | Role Blueprint | `RoleBlueprintReview` | `BLUEPRINT_A` from `blueprints.ts` |
| 3 | Assessment Blueprint | `AssessmentBlueprintPreview` | `ASSESSMENT_BLUEPRINT_A` from `assessment-blueprints.ts` |
| 4 | Governance Review | `GovernanceReviewPanel` | `BLUEPRINT_A.governance_warnings` |
| 5 | Approval | `ApprovalChecklist` | Static checklist + mutation to `approval_status: "approved"` |

**New components to create:**

| Component | Path | Description |
|---|---|---|
| `AgentStepIndicator` | `src/components/agent/AgentStepIndicator.tsx` | 5-step horizontal progress bar |
| `AgentChatBubble` | `src/components/agent/AgentChatBubble.tsx` | Single message bubble (agent left / admin right) |
| `AgentChatInterface` | `src/components/agent/AgentChatInterface.tsx` | Full chat shell with scripted transcript replay |
| `RoleBlueprintReview` | `src/components/agent/RoleBlueprintReview.tsx` | Domain/dimension list + context profile + BQ score |
| `AssessmentBlueprintPreview` | `src/components/agent/AssessmentBlueprintPreview.tsx` | Grouped item list with contextualized + original text |
| `OriginalTextToggle` | `src/components/agent/OriginalTextToggle.tsx` | Expand/collapse original item_text beneath contextualized_text |
| `ItemContextCard` | `src/components/agent/ItemContextCard.tsx` | Single item card in preview |
| `GovernanceReviewPanel` | `src/components/agent/GovernanceReviewPanel.tsx` | Warning list sorted by severity with acknowledge checkboxes |
| `ApprovalChecklist` | `src/components/agent/ApprovalChecklist.tsx` | 3-item checklist + Approve button |

**New shared UI components needed for Phase 2:**

| Component | Path | Description |
|---|---|---|
| `GovernanceBadge` | `src/components/ui/GovernanceBadge.tsx` | operational / pilot / research / blocked pill |
| `MethodBadge` | `src/components/ui/MethodBadge.tsx` | likert / contextual / forced-choice / cognitive / sjt pill |

**Also required:**
- Add Agent, Blueprints, Assessments nav items to `Sidebar` (dashboard variant)
- Fix login redirect: admin → `/dashboard/agent` (currently `/dashboard`)

---

### Phase 3 — Blueprint Library (Read-only Views) 🔲

**Goal:** Saved blueprints are accessible after agent wizard completes. All views are read-only.

**New pages:**

| Page | Description |
|---|---|
| `src/app/dashboard/blueprints/page.tsx` | Library list — BlueprintCard per blueprint |
| `src/app/dashboard/blueprints/[id]/page.tsx` | Role Blueprint detail with tabs |
| `src/app/dashboard/blueprints/[id]/assessment/page.tsx` | Assessment Blueprint full item list |
| `src/app/dashboard/blueprints/[id]/governance/page.tsx` | Governance warnings read-only |

**New components:**

| Component | Description |
|---|---|
| `BlueprintCard` | Summary card: role, level, status badge, item count, date |
| `BlueprintStatusStepper` | Draft → Reviewed → Approved → Validated stepper |
| `ContextProfileReadOnly` | 17-field context form in read-only display |
| `BQScoreCard` | Blueprint quality score breakdown (E, C, S, W, R) |

---

### Phase 4 — Assignment Flow 🔲

**Goal:** Admin can assign an approved blueprint to a candidate.

**New pages:**

| Page | Description |
|---|---|
| `src/app/dashboard/assessments/page.tsx` | Table of all assignments with status |
| `src/app/dashboard/assessments/new/page.tsx` | Assignment form |

**New components:**

| Component | Description |
|---|---|
| `AssignmentForm` | Select blueprint (from approved), candidate, use_case, deadline |
| `AssignmentStatusBadge` | not_started / in_progress / completed / expired |

---

### Phase 5 — Candidate Assessment Flow Refactor 🔲

**Goal:** Candidate journey uses real data. Assessment session renders all 5 method families.

**Pages to refactor:**

| Page | Change |
|---|---|
| `src/app/assessment/page.tsx` | Load `ASSIGNMENT_1` for `cand-001`. Show domains from `abp-001`. Consent check gates Start. |
| `src/app/assessment/[sessionId]/page.tsx` | Load `ContextualizedItem[]` from assignment's blueprint. Render via `QuestionRouter`. Store `ItemResponse`. On submit → `mockScore()` → navigate to `/assessment/complete`. Fix pre-existing TS error. |
| `src/app/assessment/complete/page.tsx` | Add "View My Report →" link to `/assessment/report`. |

**New pages:**

| Page | Description |
|---|---|
| `src/app/assessment/consent/page.tsx` | Per-use-case `ConsentCheckbox` items. Confirmation navigates to session. |
| `src/app/assessment/report/page.tsx` | Candidate-safe report using `candidate_view` from Report type. |

**New components:**

| Component | Description |
|---|---|
| `QuestionRouter` | Receives `BankItem` + `contextualized_text`; renders correct sub-component |
| `LikertQuestion` | 1–5 agreement scale — "Strongly Disagree → Strongly Agree" |
| `FrequencyQuestion` | 1–5 frequency scale — "Never → Always" — visually distinct from Likert |
| `ForcedChoiceQuestion` | Two equal-weight option cards, no scale labels |
| `CognitiveQuestion` | A–E MCQ, no correct/incorrect feedback during session |
| `SJTQuestion` | Scenario block + single-best options |
| `SessionProgressBar` | Header: module name, step counter, percentage, dot trail |
| `ConsentCheckbox` | Single labelled checkbox with use-case description |

---

### Phase 6 — Admin Report Refactor 🔲

**Goal:** `/dashboard/reports/[id]` uses real `Report` and `ScoredResult` types.

**Pages to refactor:**

| Page | Change |
|---|---|
| `src/app/dashboard/reports/[id]/page.tsx` | Replace hardcoded DOMAINS/QUALITY with typed Report data. Add all new report components. |

**New components:**

| Component | Description |
|---|---|
| `ReleaseStateBanner` | Full-width banner: release state + reason codes |
| `AudienceReportTabs` | Admin view / Candidate view tab switcher |
| `DomainScoreCard` | Domain header, composite bar, DimensionRow list, narrative |
| `DimensionRow` | Single dimension: ScoreBar + ConfidenceBadge + display_state handling |
| `ConfidenceBadge` | HIGH (green) / MODERATE (blue) / LOW (amber) / UNACCEPTABLE (red) |
| `ScoreBar` | Horizontal bar with confidence-driven color |
| `ReportGovernanceSidebar` | Validity state, QC flags, hidden/blocked lists, version tags |
| `BlockedSectionNotice` | Replacement card for suppressed sections |
| `D6ContextSummary` | Context profile read-only + "D6 is derived — not a questionnaire domain" notice |
| `VersionTags` | Footer: `scoring_version` + `synthesis_weight_version` |

---

### Phase 7 — Cleanup 🔲

**Goal:** Correct all labeling, redirects, and framing issues identified during build.

| Task | File |
|---|---|
| Fix admin login redirect: `/dashboard` → `/dashboard/agent` | `src/app/login/page.tsx` |
| Fix D6 domain card description on homepage | `src/app/page.tsx` |
| Update dashboard KPIs to include blueprint/assignment counts | `src/app/dashboard/page.tsx` |
| Add Agent + Blueprints + Assessments to dashboard Sidebar | `src/components/layout/Sidebar.tsx` |
| Fix pre-existing TS error: `Set<string>` iteration | `src/app/assessment/[sessionId]/page.tsx` |
| Add "View My Report" link to complete page | `src/app/assessment/complete/page.tsx` |
| Update `/dashboard/candidates/[id]` to show linked assessments | `src/app/dashboard/candidates/[id]/page.tsx` |

---

## What Is Permanently Deferred (Backend / Phase 2+)

| Item | Status |
|---|---|
| Real AI agent (Claude API calling QuestionBank.tsv) | Backend — scripted mock in frontend |
| Dynamic contextualization engine (LLM rewrites item_text) | Backend — pre-written mock text in frontend |
| Full 543-item bank parsing (TSV at runtime) | Backend — 51-item subset in frontend |
| GGUM / IRT real scoring | Backend — deterministic mock scorer |
| Persistent database / auth | Backend — localStorage only |
| Audit logging service | Backend — placeholder in UI |
| Real governance rule engine | Backend — pre-computed warnings in mock |
| Norm tables and standardization | Backend — provisional 0–100 linear transform |
| Domain 6 CAI/DII engine | Backend (Phase 2+) — context profile stored, indices show `--` |
| Role-fit scoring against validated blueprints | Backend (Phase 2+) |
| Calibration / DIF register | Backend — placeholder section in admin |
| Blueprint QC formula (live computation) | Backend — hardcoded component scores |
| Cross-version score comparison | Backend — version tags present, comparison blocked |
| D3 Motivational Drivers | Phase 2+ — dimension reduction analysis required |
| D5 Applied Workplace Behavior | Phase 2+ — synthesis validation required |
| D6 Derailment Risk Index | **PERMANENTLY BLOCKED** — independent ethics + criterion validity required |
