# Nexus — Current Phase

**Phase:** 2 — AI Assessment Agent Wizard  
**Status:** COMPLETE ✅  
**Last updated:** 2026-06-10  
**Prerequisite:** Phase 1 complete ✅

---

## Objective

Build `/dashboard/agent` — the AI Assessment Agent wizard. This is the primary feature of the Nexus admin product. It is a five-step multi-state page that conducts a conversational interview, generates a Role Blueprint and Assessment Blueprint, reviews governance warnings, and captures admin approval.

The agent does all selection. The admin only reads and approves.

---

## Primary Route

```
/dashboard/agent
src/app/dashboard/agent/page.tsx   ← NEW FILE
```

This is a single-page wizard with internal `step` state (`1 | 2 | 3 | 4 | 5`). No sub-routes. No modal.

---

## Step Specification

### Step 1 — Interview

**Purpose:** Agent conducts a structured conversational interview to gather role context.

**Renders:** `AgentChatInterface`

**Behavior:**
- On mount: agent sends its first message immediately (from transcript)
- When admin submits a message: agent "types" (brief loading indicator), then delivers next scripted response from transcript
- Interview transcript to use: `TRANSCRIPT_A` from `src/lib/mock-data/agent-transcripts.ts`
- After the final transcript turn, a "Generate Blueprint" button appears
- Clicking it advances to Step 2

**Data flow:**
- Input: `TRANSCRIPT_A` (`conv-001`) from `agent-transcripts.ts`
- State: `turns: AgentTurn[]` built up turn-by-turn from the scripted transcript

**Design notes:**
- Agent messages: left-aligned, blue/dark background
- Admin messages: right-aligned, slate background
- "Typing" state: animated dots, ~1.5s before next agent message appears
- Show extracted field chip (e.g., `role_title extracted`) on admin turns where `extracted_field` is set

---

### Step 2 — Role Blueprint Review

**Purpose:** Admin reviews the agent-generated Role Blueprint. Read-only. No edit controls.

**Renders:** `RoleBlueprintReview`

**Content to display:**
1. Role summary: `role_title`, `job_level`, `job_family`, `industry`, `use_case`
2. Key responsibilities list
3. Selected domains (badges for D1, D2, D4) with exclusion note for D3/D5
4. Selected dimensions — grouped by domain, each with its `selection_rationale`
5. Context profile — 17 fields displayed as read-only labeled values (see `ContextProfile` type)
6. Blueprint Quality Score card — BQ formula breakdown: E, C, S, W, R components + composite
7. `BlueprintStatusStepper` showing current status (`draft` → `reviewed`)

**Data flow:**
- Input: `BLUEPRINT_A` from `src/lib/mock-data/blueprints.ts`

**Navigation:**
- Back: returns to Step 1
- "Confirm Blueprint, Continue" → Step 3

---

### Step 3 — Assessment Blueprint Preview

**Purpose:** Admin reviews the agent-selected items with contextualized wording. Read-only.

**Renders:** `AssessmentBlueprintPreview`

**Content to display:**
1. Summary bar: total items, estimated duration, method mix counts
2. Domain coverage summary (D1 / D2 / D4 item counts)
3. Item list grouped by domain → dimension
4. Each item as `ItemContextCard`:
   - `item_id` badge (e.g., `NEX-GMB-001`)
   - Domain + Dimension + Facet labels
   - `MethodBadge` (likert / contextual / forced-choice / cognitive / sjt)
   - `GovernanceBadge` (`use_status` value)
   - `contextualized_text` — displayed prominently (this is what the candidate sees)
   - `OriginalTextToggle` — collapses/expands `original_text` from bank
   - `contextualization_rationale` — small italic text
   - If `reverse_scored: true` — show a small "reverse-scored" indicator
5. Agent selection rationale paragraph at the top of the list

**Data flow:**
- Items come from `ASSESSMENT_BLUEPRINT_A.contextualized_items` (`abp-001`)
- For each item, resolve full `BankItem` from `QUESTION_BANK` by `item_id` to get method/facet/governance metadata

**Critical rule:** `original_text` must be collapsible, not hidden. The admin must be able to see that the contextualized text faithfully represents the original item. The label must say "Original bank item text (preserved)" or similar.

**Navigation:**
- Back: returns to Step 2
- "Preview complete, continue" → Step 4

---

### Step 4 — Governance Review

**Purpose:** System-generated governance warnings are presented for admin acknowledgment before approval.

**Renders:** `GovernanceReviewPanel`

**Content to display:**
1. Warning count summary by severity (blocking / caution / info)
2. Sorted list: blocking → caution → info
3. Each warning card shows:
   - Severity icon + color (blocking = red, caution = amber, info = blue)
   - `code` in monospace
   - `message` (full text)
   - `nexus_rule` citation
   - `affected_item_ids` or `affected_dimension_ids` if present
   - Acknowledge checkbox for `caution` and `info` items
4. Blocking warnings: red "Cannot approve — resolve before continuing" state. Advance button disabled.

**Data flow:**
- Input: `BLUEPRINT_A.governance_warnings` (3 warnings: 1 caution, 2 info — no blockers, so approval is possible)

**Behavior:**
- Admin must check all `caution` and `info` acknowledgement checkboxes to enable the Advance button
- For this mock: no `blocking` warnings on `bp-001`, so admin can proceed after acknowledging 3 items

**Navigation:**
- Back: returns to Step 3
- "Governance review complete, approve" → Step 5 (enabled only when all warnings acknowledged)

---

### Step 5 — Approval

**Purpose:** Admin completes the formal approval. Blueprint status moves to `approved`. Confirmation and next-step CTAs displayed.

**Renders:** `ApprovalChecklist`

**Content:**
1. Three mandatory checklist items:
   - "I confirm calibration status is acknowledged (scores will carry scoring_version: 1.0.0-provisional)"
   - "I confirm this blueprint is for the approved use case: hiring_support_validated_blueprint"
   - "I confirm that per-use-case consent will be collected from candidates before assessment begins"
2. "Approve Blueprint" button — disabled until all three are checked
3. On click: show success state with blueprint ID (`bp-001`), approval timestamp, approver email
4. Two CTAs in success state:
   - "Assign Assessment →" → links to `/dashboard/assessments/new`
   - "View in Blueprint Library →" → links to `/dashboard/blueprints`

**Data flow:**
- Writes approval to local state (no real persistence)
- Shows `approved_by: "admin@nexus.io"` and `approved_at: <current datetime>`

---

## New Files to Create

### Page

```
src/app/dashboard/agent/page.tsx
```

This is the only new page for Phase 2. It manages step state internally.

### Components

All new components go in `src/components/agent/`.

```
src/components/agent/
  AgentStepIndicator.tsx   ← 5-step horizontal progress indicator
  AgentChatBubble.tsx      ← Single message bubble
  AgentChatInterface.tsx   ← Full chat shell with transcript replay
  RoleBlueprintReview.tsx  ← Role Blueprint read-only display
  AssessmentBlueprintPreview.tsx ← Grouped contextualized item list
  OriginalTextToggle.tsx   ← Expand/collapse for original_text
  ItemContextCard.tsx      ← Single item card
  GovernanceReviewPanel.tsx ← Warning list + acknowledge checkboxes
  ApprovalChecklist.tsx    ← 3-item checklist + Approve button
```

New shared UI components needed:

```
src/components/ui/
  GovernanceBadge.tsx      ← operational / pilot / research / blocked pill
  MethodBadge.tsx          ← likert / contextual / forced-choice / cognitive / sjt pill
```

---

## Sidebar Update Required

The dashboard `Sidebar` (`src/components/layout/Sidebar.tsx`) must be updated to add:

1. **Agent** — `/dashboard/agent` — listed first under Workspace, visually highlighted (this is the primary CTA)
2. **Blueprints** — `/dashboard/blueprints`
3. **Assessments** — `/dashboard/assessments`

Existing items (Overview, Candidates, Reports) remain.

---

## Login Redirect Fix Required

In `src/app/login/page.tsx`, line ~37:

```typescript
// Current (wrong):
router.push(role === "admin" ? "/dashboard" : "/assessment");

// Should be:
router.push(role === "admin" ? "/dashboard/agent" : "/assessment");
```

---

## Data Imports for Phase 2

```typescript
// Page-level imports
import { TRANSCRIPT_A } from "@/lib/mock-data/agent-transcripts";
import { BLUEPRINT_A } from "@/lib/mock-data/blueprints";
import { ASSESSMENT_BLUEPRINT_A } from "@/lib/mock-data/assessment-blueprints";
import { QUESTION_BANK, getBankItemById } from "@/lib/mock-data/question-bank";
import type { AgentTurn, RoleBlueprint, AssessmentBlueprint, GovernanceWarning } from "@/lib/types/nexus";
```

---

## Design Language

The agent wizard uses the same dark theme as the rest of the admin area (`bg-slate-900`, `border-slate-700`, `text-white`). Keep consistency with the existing Sidebar layout shell.

- Step indicator: horizontal, top of page, below Sidebar header area
- Active step: blue (`bg-blue-600`)
- Completed step: green check (`bg-emerald-500`)
- Upcoming step: slate (`bg-slate-700`)

---

## Acceptance Criteria for Phase 2

- [ ] `/dashboard/agent` loads without error
- [ ] Step 1: all scripted agent turns replay correctly when admin submits messages
- [ ] Step 1: "Generate Blueprint" button appears after final interview turn
- [ ] Step 2: all 9 selected dimensions displayed with rationale
- [ ] Step 2: 17-field context profile displayed in read-only form
- [ ] Step 2: BQ score card shows correct composite (0.845 for `bp-001`)
- [ ] Step 3: all 22 items from `abp-001` displayed grouped by domain → dimension
- [ ] Step 3: each item shows `contextualized_text` prominently and `original_text` in toggle
- [ ] Step 3: `MethodBadge` and `GovernanceBadge` correct per item
- [ ] Step 4: 3 warnings from `bp-001` displayed (1 caution, 2 info)
- [ ] Step 4: Advance button disabled until all 3 acknowledged
- [ ] Step 5: Approve button disabled until all 3 checklist items checked
- [ ] Step 5: Success state shows blueprint ID, CTAs link correctly
- [ ] Login redirect: admin now lands at `/dashboard/agent`
- [ ] Sidebar: Agent, Blueprints, Assessments items present
