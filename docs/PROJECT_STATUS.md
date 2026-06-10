# Nexus — Project Status

**Last updated:** 2026-06-10  
**Session:** Implementation Phase 1 complete  
**Platform version:** V1 (pre-launch, mock-scored)

---

## What Nexus Is

Nexus is a governed enterprise workforce assessment platform. It measures human capability across six domains (D1–D6) using a 543-item psychometric question bank, produces dimension-level scored profiles, and generates audience-specific reports for hiring and development decisions.

It is **not a survey tool**. It is a regulated measurement ecosystem with a seven-layer architecture, a governance engine, and deterministic reporting rules.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | Custom (Button, Card, Badge) |
| State | React `useState` — no external state manager |
| Data | In-memory mock data — no database, no API |
| Auth | Mock credentials (no real auth) |
| Routing | Next.js file-based routing |

---

## Repository Structure

```
nexus-app/
├── docs/                          ← Source documents + project docs (this folder)
│   ├── PRD.md                     ← Master PRD v2.0 — single authoritative spec
│   ├── ScoringSpecification.md    ← Operational scoring standard
│   ├── AutomatedReportingStandard.md ← Reporting architecture
│   ├── Domain6Framework.md        ← Domain 6 derived-layer spec
│   ├── QuestionBank.tsv           ← 543-item master question bank
│   ├── PROJECT_STATUS.md          ← This file
│   ├── IMPLEMENTATION_ROADMAP.md  ← Full phase roadmap
│   ├── CURRENT_PHASE.md           ← Active phase detail
│   └── TODO.md                    ← Prioritized task list
│
├── src/
│   ├── lib/
│   │   ├── types/
│   │   │   └── nexus.ts           ← All TypeScript types (Phase 1 ✅)
│   │   ├── mock-data/
│   │   │   ├── question-bank.ts   ← 51 real items from bank (Phase 1 ✅)
│   │   │   ├── agent-transcripts.ts ← 2 scripted interview transcripts (Phase 1 ✅)
│   │   │   ├── blueprints.ts      ← 2 role blueprints (Phase 1 ✅)
│   │   │   ├── assessment-blueprints.ts ← 2 assessment blueprints (Phase 1 ✅)
│   │   │   ├── assignments.ts     ← 2 assignments (Phase 1 ✅)
│   │   │   ├── scored-results.ts  ← 1 scored result (Phase 1 ✅)
│   │   │   └── reports.ts         ← 1 report (Phase 1 ✅)
│   │   ├── scoring/
│   │   │   └── mock-scorer.ts     ← Mock scoring engine (Phase 1 ✅)
│   │   └── utils.ts               ← cn() utility (pre-existing)
│   │
│   ├── app/
│   │   ├── page.tsx               ← Marketing landing page (pre-existing, needs D6 fix)
│   │   ├── login/page.tsx         ← Login with role switcher (pre-existing, needs redirect fix)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx         ← Sidebar layout (pre-existing)
│   │   │   ├── page.tsx           ← Admin overview (pre-existing)
│   │   │   ├── candidates/page.tsx ← Candidate roster (pre-existing)
│   │   │   ├── candidates/[id]/page.tsx ← Candidate detail (pre-existing, empty)
│   │   │   ├── reports/page.tsx   ← Reports list (pre-existing)
│   │   │   └── reports/[id]/page.tsx ← Report detail (pre-existing, hardcoded data)
│   │   ├── admin/
│   │   │   ├── layout.tsx         ← Sidebar layout (pre-existing)
│   │   │   ├── page.tsx           ← Governance status (pre-existing)
│   │   │   ├── users/page.tsx     ← User list (pre-existing)
│   │   │   └── settings/page.tsx  ← Placeholder (pre-existing)
│   │   └── assessment/
│   │       ├── layout.tsx         ← Assessment shell layout (pre-existing)
│   │       ├── page.tsx           ← Candidate portal (pre-existing, hardcoded)
│   │       ├── [sessionId]/page.tsx ← Session runner (pre-existing, 8 hardcoded items)
│   │       └── complete/page.tsx  ← Submission confirmation (pre-existing)
│   │
│   └── components/
│       ├── layout/
│       │   ├── Navbar.tsx         ← Marketing nav (pre-existing)
│       │   └── Sidebar.tsx        ← Admin sidebar (pre-existing)
│       └── ui/
│           ├── Badge.tsx          ← Badge component (pre-existing)
│           ├── Button.tsx         ← Button component (pre-existing)
│           └── Card.tsx           ← Card component (pre-existing)
```

---

## Current Build State

### Phase 1 — Data Foundation ✅ COMPLETE

All 9 data and type files created. Zero TypeScript errors in new code.

| File | Contents |
|---|---|
| `types/nexus.ts` | 20+ types covering the full Nexus data model |
| `mock-data/question-bank.ts` | 51 real items from QuestionBank.tsv (all 5 method families) |
| `mock-data/agent-transcripts.ts` | 2 scripted AI interview transcripts |
| `mock-data/blueprints.ts` | Blueprint A (approved, IC Eng), Blueprint B (draft, Ops Manager) |
| `mock-data/assessment-blueprints.ts` | Blueprint A: 22 items, Blueprint B: 26 items, fully contextualized |
| `mock-data/assignments.ts` | Assignment 1 (not_started), Assignment 2 (completed) |
| `mock-data/scored-results.ts` | ScoredResult for Sam Rivera (D1/D2/D4, PASS_WITH_LIMITS) |
| `mock-data/reports.ts` | Full Report with admin_view + candidate_view |
| `scoring/mock-scorer.ts` | Deterministic mock scorer following ScoringSpecification.md |

### Pre-existing UI — Scaffolded but not connected to data

All pre-existing pages use hardcoded local constants. None import from `src/lib/`. They are display-only prototypes.

| Page | State | Problem |
|---|---|---|
| `/` | Working | D6 labeled "Roadmap" — incorrect |
| `/login` | Working | Wrong redirects: admin → `/dashboard` (should be `/dashboard/agent`); candidate → `/assessment` (correct) |
| `/dashboard` | Working | Hardcoded KPI data; no Blueprint/Agent links |
| `/dashboard/reports/[id]` | Working | Hardcoded DOMAINS/QUALITY constants; no scoring types |
| `/assessment` | Working | Hardcoded assignment card; no consent step |
| `/assessment/[sessionId]` | Working | 8 hardcoded Likert questions; no method routing |
| `/assessment/complete` | Working | No link to candidate report |
| `/admin` | Working | Correct governance gate display |

### Known TypeScript Issues

| File | Error | Origin |
|---|---|---|
| `src/app/assessment/[sessionId]/page.tsx:93` | `Set<string>` iteration requires `--downlevelIteration` | Pre-existing in original code, not introduced by Phase 1 |

---

## Mock Data Reference

### Question Bank (51 items)

| Domain | Method | Count | Items |
|---|---|---|---|
| D1 | likert | 19 | NEX-GMB-001, 004, 009, 011, 013, 017, 021, 025, 031, 035, 037, 041, 049, 053, 055, 059, 065, 069, 073 |
| D1 | forced_choice | 6 | NEX-GMB-007, 008, 023, 029, 057, 067 |
| D1 | sjt | 2 | NEX-GMB-047, 048 |
| D2 | cognitive_multiple_choice | 12 | NEX-GMB-087, 090, 096, 099, 102, 105, 111, 114, 117, 120, 135, 141 |
| D4 | contextual_self_report | 10 | NEX-GMB-219, 221, 224, 228, 232, 235, 239, 241, 248, 255 |
| D4 | sjt | 2 | NEX-GMB-223, 236 |

D3 and D5 are excluded — both `operational_blocked` at V1.

### Blueprints

| ID | Role | Level | Status | Conversation |
|---|---|---|---|---|
| `bp-001` | Junior Software Engineer | IC | `approved` | `conv-001` |
| `bp-002` | Operations Manager | Manager | `draft` | `conv-002` |

### Assessment Blueprints

| ID | Blueprint | Items | Duration |
|---|---|---|---|
| `abp-001` | `bp-001` | 22 items (D1/D2/D4) | 35 min |
| `abp-002` | `bp-002` | 26 items (D1/D2/D4) | 40 min |

### Assignments

| ID | Candidate | Status | Assessment Blueprint |
|---|---|---|---|
| `asgn-001` | Alex Jordan (`cand-001`, `candidate@nexus.io`) | `not_started` | `abp-001` |
| `asgn-002` | Sam Rivera (`cand-002`, `sam.rivera@example.com`) | `completed` | `abp-001` |

### Scored Results & Reports

| Session | Candidate | Validity | Release State |
|---|---|---|---|
| `sess-001` | Sam Rivera | `PASS_WITH_LIMITS` | `Released with Caution` |

Report `rpt-001` exists for Sam Rivera with full admin and candidate views.

---

## Governance Constants (V1)

- Only 2 use cases permitted: `developmental` and `hiring_support_validated_blueprint`
- D3 (Motivation): deferred to Phase 2 — `operational_blocked`
- D5 (Applied Work): deferred to Phase 2 — `operational_blocked`
- D6 Role Fit: active at V1 only with `blueprint_status: validated` blueprint
- D6 Derailment Risk Index: **BLOCKED ENTIRELY** — never show
- All outputs carry: `scoring_version: "1.0.0-provisional"`, `synthesis_weight_version: "1.0.0-provisional"`
- Audit logging failure must block all operations (SEV-1) — not yet implemented
- Consent is per-use-case, not global — not yet implemented

---

## Mock Credentials

```
Admin:     admin@nexus.io    / admin123
Candidate: candidate@nexus.io / password123
```

Candidate `candidate@nexus.io` maps to `cand-001` (Alex Jordan) — assignment `asgn-001` (not_started).
