# Nexus — TODO

**Last updated:** 2026-06-15  
**Active phase:** Results + Reporting Flow — COMPLETE ✅  
**Previous phases:** Phase 1 ✅, Phase 2 (Agent Wizard) ✅, Results Flow ✅

Tasks are ordered by dependency. Complete them in sequence unless marked as independent.

---

## Phase 2 Tasks (start here)

### 2.0 — Sidebar + Login (do first, small, unblocks navigation)

- [ ] **`src/components/layout/Sidebar.tsx`** — Add 3 nav items to `dashboardNav` array:
  - `{ href: "/dashboard/agent", label: "Agent", icon: <brain/spark icon> }` — insert as first item
  - `{ href: "/dashboard/blueprints", label: "Blueprints", icon: <document icon> }`
  - `{ href: "/dashboard/assessments", label: "Assessments", icon: <checklist icon> }`
  - Agent nav item should be visually distinguished (e.g., blue pill badge or highlighted state)

- [ ] **`src/app/login/page.tsx`** — Fix admin redirect on line ~37:
  - Change: `router.push(role === "admin" ? "/dashboard" : "/assessment")`
  - To: `router.push(role === "admin" ? "/dashboard/agent" : "/assessment")`

### 2.1 — Shared UI components (no dependencies)

- [ ] **`src/components/ui/GovernanceBadge.tsx`** — Pill badge for `use_status` values:
  - `operational_allowed` → green
  - `operational_allowed_with_restrictions` → amber
  - `operational_allowed_restricted_by_level` → blue
  - `operational_blocked` → red
  - `pilot` → violet
  - `research` → slate

- [ ] **`src/components/ui/MethodBadge.tsx`** — Pill badge for `method_family` values:
  - `likert` → blue
  - `contextual_self_report` → indigo
  - `forced_choice` → violet
  - `cognitive_multiple_choice` → amber
  - `sjt` → orange

### 2.2 — Agent components (build in this order)

- [ ] **`src/components/agent/AgentStepIndicator.tsx`**
  - Props: `currentStep: 1 | 2 | 3 | 4 | 5`
  - 5 steps: Interview · Role Blueprint · Assessment Blueprint · Governance · Approval
  - Completed steps show green check; active step shows blue; upcoming steps show slate
  - Horizontal layout, responsive

- [ ] **`src/components/agent/AgentChatBubble.tsx`**
  - Props: `turn: AgentTurn`
  - Agent (role="agent"): left-aligned, dark slate bubble, small "N" avatar
  - Admin (role="admin"): right-aligned, dark blue bubble
  - If `turn.extracted_field` present: show small chip below message, e.g., "✓ role_title captured"
  - If `turn.is_generating`: show animated typing dots instead of content

- [ ] **`src/components/agent/AgentChatInterface.tsx`**
  - Props: `transcript: AgentTranscript`, `onComplete: () => void`
  - Renders scrollable message list of `AgentTurn[]`
  - Starts with empty turns array; replays transcript turn-by-turn as admin submits
  - Admin input: text input + Send button
  - When admin sends a message: add admin turn immediately, then after 1.5s add next agent turn from transcript
  - After the final agent turn in transcript: show "Generate Blueprint →" button instead of input
  - "Generate Blueprint" calls `onComplete()`

- [ ] **`src/components/agent/RoleBlueprintReview.tsx`**
  - Props: `blueprint: RoleBlueprint`
  - Sections: Role summary · Responsibilities · Selected dimensions (by domain) · Context profile · BQ score
  - Context profile: render all 17 `ContextProfile` fields as labeled read-only pairs
  - BQ score card: E/C/S/W/R bars + composite with formula `0.30E + 0.25C + 0.20S + 0.15W + 0.10R`
  - Each selected dimension shows `selection_rationale` in small italic text
  - Include `BlueprintStatusStepper` at top: Draft → Reviewed → Approved → Validated

- [ ] **`src/components/agent/OriginalTextToggle.tsx`**
  - Props: `originalText: string`
  - Shows "Show original bank item text ↓" collapsed by default
  - On click: expands to show `originalText` in a bordered box labeled "Original (preserved verbatim)"

- [ ] **`src/components/agent/ItemContextCard.tsx`**
  - Props: `item: ContextualizedItem`, `bankItem: BankItem`
  - Displays: `item_id` badge, dimension + facet labels, `MethodBadge`, `GovernanceBadge`
  - `contextualized_text` — large, prominent (candidate-facing text)
  - `OriginalTextToggle` — collapsed by default
  - `contextualization_rationale` — small italic
  - `reverse_scored` indicator if `bankItem.reverse_scored === true`
  - `display_order` number in upper right corner

- [ ] **`src/components/agent/AssessmentBlueprintPreview.tsx`**
  - Props: `blueprint: AssessmentBlueprint`, `bankItems: BankItem[]`
  - Summary bar at top: total items, estimated duration, method mix counts
  - Domain coverage badges: D1 (N items) · D2 (N items) · D4 (N items)
  - Agent selection rationale paragraph
  - Item list grouped by domain → dimension header → list of `ItemContextCard`
  - For each `ContextualizedItem`, resolve `BankItem` from `bankItems` by `item_id`

- [ ] **`src/components/agent/GovernanceReviewPanel.tsx`**
  - Props: `warnings: GovernanceWarning[]`, `onAllAcknowledged: () => void`
  - Sort warnings: blocking first → caution → info
  - Count summary header: "X blocking · Y caution · Z info"
  - Each warning card: severity icon + color, `code` monospace, `message`, `nexus_rule`, optional affected items/dimensions
  - `blocking` warnings: red border, no checkbox, shows "Resolve before approval" label
  - `caution` and `info` warnings: amber/blue border, acknowledge checkbox
  - Calls `onAllAcknowledged()` when all non-blocking warnings are checked
  - If any `blocking` warnings exist: show red banner "Cannot approve until blocking issues are resolved"

- [ ] **`src/components/agent/ApprovalChecklist.tsx`**
  - Props: `blueprintId: string`, `useCaseLabel: string`, `onApprove: () => void`
  - Three checkbox items (see CURRENT_PHASE.md Step 5 for text)
  - "Approve Blueprint" button disabled until all checked
  - On approve: show success state (green check, blueprint ID, timestamp, two CTAs)
  - Success CTAs: "Assign Assessment →" (`/dashboard/assessments/new`) and "View in Library →" (`/dashboard/blueprints`)

### 2.3 — Agent page (depends on 2.1 + 2.2)

- [ ] **`src/app/dashboard/agent/page.tsx`**
  - Internal state: `step: 1 | 2 | 3 | 4 | 5`, `allAcknowledged: boolean`, `approved: boolean`
  - Renders `AgentStepIndicator` at top
  - Renders correct component for current step (see CURRENT_PHASE.md)
  - Back button on steps 2–4 (not step 1, not step 5 after approval)
  - Data imports: `TRANSCRIPT_A`, `BLUEPRINT_A`, `ASSESSMENT_BLUEPRINT_A`, `QUESTION_BANK`
  - Step 4 advance: gated on `allAcknowledged` state
  - Step 5 approve: calls `onApprove` → sets `approved: true` → shows success

---

## Phase 3 Tasks (after Phase 2 complete)

- [ ] `src/app/dashboard/blueprints/page.tsx` — Blueprint library list
- [ ] `src/app/dashboard/blueprints/[id]/page.tsx` — Role Blueprint detail
- [ ] `src/app/dashboard/blueprints/[id]/assessment/page.tsx` — Assessment Blueprint review
- [ ] `src/app/dashboard/blueprints/[id]/governance/page.tsx` — Governance warnings read-only
- [ ] `src/components/agent/BlueprintCard.tsx` — Summary card component
- [ ] `src/components/agent/BlueprintStatusStepper.tsx` — 4-stage stepper (also needed in 2.2)

> Note: `BlueprintStatusStepper` is referenced in Phase 2 (`RoleBlueprintReview`). Build it during Phase 2.

---

## Phase 4 Tasks (after Phase 3 complete)

- [ ] `src/app/dashboard/assessments/page.tsx` — Assignments list
- [ ] `src/app/dashboard/assessments/new/page.tsx` — Assignment form
- [ ] `src/components/admin/AssignmentForm.tsx` — Form component

---

## Phase 5 Tasks (after Phase 4 complete)

- [ ] Refactor `src/app/assessment/page.tsx` — load `ASSIGNMENT_1` for `cand-001`
- [ ] Create `src/app/assessment/consent/page.tsx` — per-use-case consent
- [ ] Refactor `src/app/assessment/[sessionId]/page.tsx` — load real items, `QuestionRouter`, `mockScore`
- [ ] Fix pre-existing TS error in `[sessionId]/page.tsx:93` (Set iteration target)
- [ ] Light refactor `src/app/assessment/complete/page.tsx` — add report link
- [ ] Create `src/app/assessment/report/page.tsx` — candidate-safe report

**Assessment session components (all needed for Phase 5):**
- [ ] `src/components/assessment/QuestionRouter.tsx`
- [ ] `src/components/assessment/LikertQuestion.tsx`
- [ ] `src/components/assessment/FrequencyQuestion.tsx`
- [ ] `src/components/assessment/ForcedChoiceQuestion.tsx`
- [ ] `src/components/assessment/CognitiveQuestion.tsx`
- [ ] `src/components/assessment/SJTQuestion.tsx`
- [ ] `src/components/assessment/SessionProgressBar.tsx`
- [ ] `src/components/assessment/ConsentCheckbox.tsx`

---

## Phase 6 Tasks (after Phase 5 complete)

- [ ] Refactor `src/app/dashboard/reports/[id]/page.tsx` — replace hardcoded data with typed `Report`

**Report components (all needed for Phase 6):**
- [ ] `src/components/report/ReleaseStateBanner.tsx`
- [ ] `src/components/report/AudienceReportTabs.tsx`
- [ ] `src/components/report/DomainScoreCard.tsx`
- [ ] `src/components/report/DimensionRow.tsx`
- [ ] `src/components/ui/ConfidenceBadge.tsx`
- [ ] `src/components/ui/ScoreBar.tsx`
- [ ] `src/components/report/ReportGovernanceSidebar.tsx`
- [ ] `src/components/report/BlockedSectionNotice.tsx`
- [ ] `src/components/report/D6ContextSummary.tsx`
- [ ] `src/components/report/VersionTags.tsx`

---

## Phase 7 Tasks (cleanup, can be done anytime after Phase 2)

- [ ] `src/app/page.tsx` — Fix D6 card description: remove "Roadmap" text, replace with "Derived context/fit layer — computed from D1–D5 scores plus a 17-field context form. Not a questionnaire domain."
- [ ] `src/app/dashboard/page.tsx` — Add "New Assessment (Agent →)" as primary CTA linking to `/dashboard/agent`
- [ ] `src/app/dashboard/candidates/[id]/page.tsx` — Add linked assessments and reports
- [ ] Verify all governance badge labels are consistent across pages

---

## Known Issues

| Issue | File | Priority |
|---|---|---|
| Pre-existing TS error: `Set<string>` iteration | `src/app/assessment/[sessionId]/page.tsx:93` | Fix in Phase 5 |
| Admin redirect goes to `/dashboard` not `/dashboard/agent` | `src/app/login/page.tsx:37` | Fix in Phase 2.0 |
| D6 labeled "Roadmap" on homepage domain card | `src/app/page.tsx` | Fix in Phase 7 |
| Report at `/dashboard/reports/[id]` uses hardcoded DOMAINS array | `src/app/dashboard/reports/[id]/page.tsx` | Fix in Phase 6 |
| Assessment session uses 8 hardcoded Likert items | `src/app/assessment/[sessionId]/page.tsx` | Fix in Phase 5 |
| No consent step before assessment | n/a | Add in Phase 5 |
| `assessment/complete` has no link to candidate report | `src/app/assessment/complete/page.tsx` | Fix in Phase 5 |

---

## Questions to Resolve Before or During Phase 2

1. **Agent typing delay:** Should the 1.5s scripted response delay be configurable or hardcoded?
2. **Back navigation in wizard:** Should stepping back to Step 1 (Interview) reset the chat, or preserve it?
3. **Blueprint editing:** If admin wants to regenerate after reviewing Step 2, do they re-run the interview or just go back?
4. **Multiple blueprints in wizard:** Does the wizard always use `TRANSCRIPT_A` and `BLUEPRINT_A`, or should it allow toggling between `A` and `B` for demo purposes?
5. **Approval persistence:** When admin approves in Step 5, should the approval persist across page reloads (localStorage) or reset on refresh?
