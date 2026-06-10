import type { Report } from "@/lib/types/nexus";
import { SCORED_RESULT_1 } from "./scored-results";

// ─── Report 1 — Sam Rivera (Junior Software Engineer, Hiring Support) ─────────
// Follows AutomatedReportingStandard.md:
// - release_state comes from scored result
// - admin_view has full dimension data + strengths/watchpoints
// - candidate_view shows only HIGH/MODERATE dimensions; LOW → downgraded; D5 → blocked notice
// - D4-SA is LOW confidence → display_state: "downgraded" → not in candidate visible set
// - D5 is governance-blocked → shown as blocked_section_notice on candidate report
// - All version tags present per PRD Section 5.7

export const REPORT_1: Report = {
  report_id: "rpt-001",
  scoring_run_id: "score-001",
  blueprint_id: "bp-001",
  assessment_blueprint_id: "abp-001",
  use_case: "hiring_support_validated_blueprint",
  policy_version: "1.0.0",
  scoring_version: "1.0.0-provisional",
  synthesis_weight_version: "1.0.0-provisional",
  release_state: "Released with Caution",
  visible_sections: [
    "domain_profile_D1",
    "domain_profile_D2",
    "domain_profile_D4",
    "response_quality",
    "governance_notice",
  ],
  blocked_sections: [
    "domain_profile_D5",
    "domain6_context_indices",
    "percentile_bands",
  ],
  downgraded_dimension_ids: ["D4-SA"],
  hidden_dimension_ids: [],

  admin_view: {
    candidate_id: "cand-002",
    candidate_name: "Sam Rivera",
    candidate_email: "sam.rivera@example.com",
    job_title: "Junior Software Engineer",
    job_level: "IC",
    organization: "Nexus Platform Demo",
    domain_scores: SCORED_RESULT_1.domain_scores,
    qc_flags: SCORED_RESULT_1.qc_flags,
    governance_notes: [
      "D1-IN (Integrity Orientation) is displayed with MODERATE confidence and a caution label. This dimension carries use_status: operational_allowed_with_restrictions. It may support developmental interpretation but should not be used as a standalone hiring signal.",
      "D4-SA (Self-Awareness) is below the minimum confidence threshold for standard display (SE = 0.38 > 0.35). It appears as downgraded in this report.",
      "D5 (Workplace Effectiveness) is excluded from this report per V1 governance gate. D5 is deferred to Phase 2 and blocked for all high-stakes operational use.",
      "All scores carry scoring_version: 1.0.0-provisional and synthesis_weight_version: 1.0.0-provisional. Calibration N minimums have not been confirmed. Percentile reporting is not available at this stage.",
      "Context-Derived Indices (Domain 6 CAI, DII) require the Domain 6 engine, which is deferred to Phase 2. The context profile for this role is stored and available for future computation.",
    ],
    strengths: [
      {
        dimension_id: "D1-IO",
        dimension_name: "Interpersonal Orientation",
        score: 78,
        label: "Strong interpersonal orientation — consistently respectful, empathetic, and conflict-aware. Well-suited for collaborative code review culture.",
      },
      {
        dimension_id: "D1-CE",
        dimension_name: "Conscientious Execution",
        score: 76,
        label: "High conscientious execution — reliable task completion and strong self-discipline under sprint demands.",
      },
      {
        dimension_id: "D4-RM",
        dimension_name: "Relationship Management",
        score: 76,
        label: "Effective relationship management — proactive in trust-building and constructive conflict resolution.",
      },
    ],
    watch_points: [
      {
        dimension_id: "D2-NR",
        dimension_name: "Numerical Reasoning",
        score: 56,
        note: "Numerical reasoning is the weakest cognitive dimension. May benefit from structured support when working with data-heavy features or metrics dashboards. Recommend probing during technical interview.",
      },
      {
        dimension_id: "D4-SA",
        dimension_name: "Self-Awareness",
        score: 64,
        note: "Self-Awareness scored below the confidence threshold for reliable interpretation (SE = 0.38). Score is flagged as low confidence — treat as exploratory only. Do not use this dimension in hiring decision.",
      },
    ],
    blueprint_status: "approved",
    use_case: "hiring_support_validated_blueprint",
    confidence_summary: "D1 dimensions are HIGH confidence with the exception of D1-IN (MODERATE). D2 and D4 dimensions are MODERATE confidence. D4-SA is LOW confidence and downgraded. Overall release state: Released with Caution. One minor QC flag: reverse_consistency_watch (low severity, D1).",
  },

  candidate_view: {
    domain_scores: SCORED_RESULT_1.domain_scores.map((domain) => ({
      ...domain,
      dimensions: domain.dimensions.filter(
        (dim) => dim.display_state === "visible" || dim.display_state === "visible_with_caution"
      ),
    })),
    behavioral_descriptors: [
      {
        dimension_id: "D1-CE",
        dimension_name: "Conscientious Execution",
        text: "You tend to follow through on commitments and maintain focus under time pressure. Others can rely on you to deliver on what you've agreed to.",
      },
      {
        dimension_id: "D1-EO",
        dimension_name: "Exploratory Openness",
        text: "You show a genuine curiosity about learning and exploring new approaches. You're comfortable sitting with ambiguity while working toward a solution.",
      },
      {
        dimension_id: "D1-ES",
        dimension_name: "Emotional Steadiness",
        text: "You generally maintain composure when unexpected challenges arise. Under significant pressure, you tend to stay steady rather than reactive.",
      },
      {
        dimension_id: "D1-IO",
        dimension_name: "Interpersonal Orientation",
        text: "You are attentive to how your words and actions affect others, and you navigate disagreements with care and professionalism.",
      },
      {
        dimension_id: "D4-RC",
        dimension_name: "Resilience Capacity",
        text: "You show the ability to continue working through setbacks and recover from difficulties without a prolonged dip in performance.",
      },
      {
        dimension_id: "D4-RM",
        dimension_name: "Relationship Management",
        text: "You build trust through openness and follow-through, and you tend to address tension in relationships directly and constructively.",
      },
    ],
    development_suggestions: [
      "Consider seeking out projects that involve numerical analysis or metrics to build comfort with data-driven decision making.",
      "When disagreements arise in code reviews or team discussions, practise articulating your reasoning clearly — this will strengthen your influence and communication impact over time.",
      "Look for low-stakes opportunities to experiment with unfamiliar tools or frameworks to further develop your learning agility.",
    ],
    blocked_section_notices: [
      {
        section: "Workplace Effectiveness (D5)",
        reason: "This section is not yet available in V1. Domain 5 (Applied Workplace Behavior) is a synthesis layer that requires validation of foundational domains before it can be reported. It will be available in Phase 2.",
        governance_rule: "PRD Part 2.6 — D5 deferred to Phase 2",
      },
      {
        section: "Fit and Readiness Indices (D6)",
        reason: "Context-derived indices such as Contextual Alignment and Decision Influence require the Domain 6 engine, which is under development. These indices are not yet available in V1.",
        governance_rule: "PRD Part 2.7 — D6 most indices deferred to Phase 2",
      },
      {
        section: "Percentile Bands",
        reason: "Percentile reporting requires validated norm groups, which have not yet been established for V1. Scores are provisional and reported on a 0–100 scale only.",
        governance_rule: "PRD Section 5.5 — Percentile release gates",
      },
    ],
  },
  generated_at: "2026-06-08T10:17:30Z",
};

export const REPORTS = [REPORT_1];

export function getReportById(reportId: string): Report | undefined {
  return REPORTS.find((r) => r.report_id === reportId);
}

export function getReportByScoringRun(scoringRunId: string): Report | undefined {
  return REPORTS.find((r) => r.scoring_run_id === scoringRunId);
}
