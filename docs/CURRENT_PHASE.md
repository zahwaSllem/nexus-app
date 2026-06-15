# Nexus — Current Phase

**Phase:** Results + Reporting Flow  
**Status:** COMPLETE ✅  
**Last updated:** 2026-06-15  
**Prerequisite:** Phase 1 ✅, Phase 2 ✅ (Agent Wizard), Phase 3–5 scaffolded

---

## Objective

Build the complete Results and Reporting Flow for both the Candidate journey and the Admin journey.

---

## Deliverables — All Complete

### New / Modified Files

| File | Action | Description |
|---|---|---|
| `src/lib/mock-data/reports.ts` | Modified | Added `getReportByCandidateId()` helper |
| `src/app/dashboard/reports/page.tsx` | Modified | Fixed report link to use real report ID via `getReportByCandidateId` |
| `src/app/dashboard/reports/[id]/page.tsx` | Refactored | Full rewrite using real `Report` + `ScoredResult` types |
| `src/app/candidate/results/[id]/page.tsx` | Modified | Added Capability Highlights, Coverage Note, Role Fit sections |
| `src/app/candidate/report/[id]/page.tsx` | Modified | Added Strengths, Learning Recommendations, Role Fit Explanation |

---

## Results Flow — Complete Picture

### Assessment Completion → Results

```
Assessment Complete (/assessment/complete)
  → View My Results  → /candidate/results/[id]
  → View My Report   → /candidate/report/[id]
```

### Admin Reports Flow

```
Admin Reports List (/dashboard/reports)
  → Open Report  → /dashboard/reports/[id]  ← rpt-001 for Sam Rivera
```

---

## Candidate Results Page (`/candidate/results/[id]`)

Shows:
- **Release State** — amber/red/green banner (assessment-level validity)
- **Domain Scores** — composite per domain with confidence indicator
- **Dimension Scores** — bars per dimension with caution labels
- **Capability Highlights** — top 3 visible dimensions by score (Critical Success Factors)
- **Assessment Coverage Note** — downgraded dimensions explained supportively
- **Role Fit Analysis** — blocked V1 notice (Phase 2)
- **Development Suggestions** — from `candidate_view`
- **CTA** → View Full Report

---

## Candidate Report Page (`/candidate/report/[id]`)

Language: developmental, supportive, first-person.

Shows:
- **Your Strengths** — top 3 behavioral descriptors sorted by score
- **Your Profile** — domain analysis with all visible dimensions + descriptors
- **Learning Recommendations** — development suggestions from `candidate_view`
- **Role Fit** — explanation of what role fit will show (Phase 2)
- **Coming in a Future Report** — blocked section notices (D5, D6, Percentile)
- **Back to Results** CTA

---

## Admin Report Page (`/dashboard/reports/[id]`)

Language: decision-support, authoritative, data-precise.

Shows:
- **Release State Banner** — colored by release state + validity state
- **Report Header** — candidate name, title, level, use case
- **Sidebar**: Candidate card, Response Quality + QC flags, Blocked sections, Version tags
- **Confidence Summary** — from `admin_view.confidence_summary`
- **Critical Success Factors** — from `admin_view.strengths`
- **Risk Indicators & Watch Points** — from `admin_view.watch_points` (with Disqualifying label on downgraded)
- **Domain Breakdown** — all 3 scored domains + D5 blocked card, all dimensions with confidence badges
- **Role Fit Indices** — blocked V1 notice
- **Hiring Recommendation** — derived from release_state + validity_state
- **Governance Notes** — from `admin_view.governance_notes`
- **Footer** — version tags, report ID, generated date

---

## Data Alignment

| Concept | Source |
|---|---|
| Release State | `ScoredResult.release_state` |
| Validity State | `ScoredResult.validity_state` |
| Domain Scores | `ScoredResult.domain_scores` / `AdminReportView.domain_scores` |
| Critical Success Factors | `AdminReportView.strengths` |
| Disqualifying Traits | `AdminReportView.watch_points` where dimension is in `downgraded_dimension_ids` |
| Risk Indicators | `AdminReportView.watch_points` |
| Governance Notes | `AdminReportView.governance_notes` |
| Behavioral Descriptors (Candidate) | `CandidateReportView.behavioral_descriptors` |
| Learning Recommendations | `CandidateReportView.development_suggestions` |
| Role Fit | Domain 6 — blocked V1, Phase 2 |
| QC Flags | `ScoredResult.qc_flags` |
| Blocked Sections | `Report.blocked_sections` |

---

## TypeScript Status

All new and modified files compile with 0 errors.  
Pre-existing TS error in `assessment/[sessionId]/page.tsx:93` remains (Set iteration) — tracked in Phase 5.
