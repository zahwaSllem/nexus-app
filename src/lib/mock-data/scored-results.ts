import type { ScoredResult } from "@/lib/types/nexus";

// ─── Scored result for Sam Rivera (Assignment 2, Session sess-001) ─────────────
// Follows ScoringSpecification.md structure:
// - SE ≤ 0.25 → HIGH confidence
// - SE 0.25–0.35 → MODERATE confidence
// - SE 0.35–0.45 → LOW confidence
// - SE > 0.45 → UNACCEPTABLE (hidden)
//
// Display state follows AutomatedReportingStandard.md:
// - HIGH + validated + permitted = "visible"
// - MODERATE = "visible_with_caution"
// - LOW = "downgraded"
// - operational_allowed_with_restrictions + MODERATE = "visible_with_caution"
//
// Standardized scores are on 0–100 linear provisional scale.
// D5 is not scored — governance blocked.
// D3 is not scored — deferred to Phase 2.

export const SCORED_RESULT_1: ScoredResult = {
  scoring_run_id: "score-001",
  session_id: "sess-001",
  bank_version: "final",
  norm_version: "provisional",
  scoring_version: "1.0.0-provisional",
  synthesis_weight_version: "1.0.0-provisional",
  validity_state: "PASS_WITH_LIMITS",
  release_state: "Released with Caution",
  completion_ratio: 0.96,
  scored_at: "2026-06-08T10:17:00Z",

  qc_flags: [
    {
      flag_code: "reverse_consistency_watch",
      severity: "low",
      description: "Minor inconsistency detected between NEX-GMB-001 (reverse-scored) and NEX-GMB-004. Response pattern is within acceptable range but flagged for monitoring.",
      affected_domain: "D1",
    },
  ],

  domain_scores: [
    {
      domain_id: "D1",
      domain_name: "Personality Architecture",
      standardized_score: 72.4,
      confidence: "HIGH",
      dimensions: [
        {
          dimension_id: "D1-CE",
          dimension_name: "Conscientious Execution",
          domain_id: "D1",
          raw_score: 3.8,
          standardized_score: 76.0,
          standard_error: 0.21,
          confidence: "HIGH",
          display_state: "visible",
          item_count: 4,
          reverse_items_applied: 1,
        },
        {
          dimension_id: "D1-EO",
          dimension_name: "Exploratory Openness",
          domain_id: "D1",
          raw_score: 3.5,
          standardized_score: 70.0,
          standard_error: 0.24,
          confidence: "HIGH",
          display_state: "visible",
          item_count: 3,
          reverse_items_applied: 1,
        },
        {
          dimension_id: "D1-ES",
          dimension_name: "Emotional Steadiness",
          domain_id: "D1",
          raw_score: 3.6,
          standardized_score: 72.0,
          standard_error: 0.22,
          confidence: "HIGH",
          display_state: "visible",
          item_count: 3,
          reverse_items_applied: 1,
        },
        {
          dimension_id: "D1-IN",
          dimension_name: "Integrity Orientation",
          domain_id: "D1",
          raw_score: 3.7,
          standardized_score: 74.0,
          standard_error: 0.28,
          confidence: "MODERATE",
          display_state: "visible_with_caution",
          item_count: 3,
          reverse_items_applied: 1,
        },
        {
          dimension_id: "D1-IO",
          dimension_name: "Interpersonal Orientation",
          domain_id: "D1",
          raw_score: 3.9,
          standardized_score: 78.0,
          standard_error: 0.20,
          confidence: "HIGH",
          display_state: "visible",
          item_count: 3,
          reverse_items_applied: 0,
        },
      ],
    },
    {
      domain_id: "D2",
      domain_name: "Cognitive Architecture",
      standardized_score: 68.0,
      confidence: "MODERATE",
      dimensions: [
        {
          dimension_id: "D2-DC",
          dimension_name: "Decision Complexity",
          domain_id: "D2",
          raw_score: 0.67,
          standardized_score: 67.0,
          standard_error: 0.30,
          confidence: "MODERATE",
          display_state: "visible_with_caution",
          item_count: 3,
          reverse_items_applied: 0,
        },
        {
          dimension_id: "D2-LA",
          dimension_name: "Learning Agility",
          domain_id: "D2",
          raw_score: 0.75,
          standardized_score: 75.0,
          standard_error: 0.27,
          confidence: "MODERATE",
          display_state: "visible_with_caution",
          item_count: 3,
          reverse_items_applied: 0,
        },
        {
          dimension_id: "D2-NR",
          dimension_name: "Numerical Reasoning",
          domain_id: "D2",
          raw_score: 0.56,
          standardized_score: 56.0,
          standard_error: 0.33,
          confidence: "MODERATE",
          display_state: "visible_with_caution",
          item_count: 3,
          reverse_items_applied: 0,
        },
      ],
    },
    {
      domain_id: "D4",
      domain_name: "Interpersonal and Emotional Functioning",
      standardized_score: 70.5,
      confidence: "MODERATE",
      dimensions: [
        {
          dimension_id: "D4-RC",
          dimension_name: "Resilience Capacity",
          domain_id: "D4",
          raw_score: 3.6,
          standardized_score: 72.0,
          standard_error: 0.26,
          confidence: "MODERATE",
          display_state: "visible_with_caution",
          item_count: 4,
          reverse_items_applied: 1,
        },
        {
          dimension_id: "D4-RM",
          dimension_name: "Relationship Management",
          domain_id: "D4",
          raw_score: 3.8,
          standardized_score: 76.0,
          standard_error: 0.23,
          confidence: "HIGH",
          display_state: "visible",
          item_count: 3,
          reverse_items_applied: 0,
        },
        {
          dimension_id: "D4-SA",
          dimension_name: "Self-Awareness",
          domain_id: "D4",
          raw_score: 3.2,
          standardized_score: 64.0,
          standard_error: 0.38,
          confidence: "LOW",
          display_state: "downgraded",
          item_count: 2,
          reverse_items_applied: 1,
        },
      ],
    },
  ],
};

export const SCORED_RESULTS = [SCORED_RESULT_1];

export function getScoredResultBySession(sessionId: string): ScoredResult | undefined {
  return SCORED_RESULTS.find((r) => r.session_id === sessionId);
}

export function getScoredResultById(scoringRunId: string): ScoredResult | undefined {
  return SCORED_RESULTS.find((r) => r.scoring_run_id === scoringRunId);
}
