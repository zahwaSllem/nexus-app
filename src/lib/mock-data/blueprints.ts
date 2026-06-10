import type { RoleBlueprint } from "@/lib/types/nexus";

// ─── Blueprint A — Junior Software Engineer (approved) ───────────────────────

export const BLUEPRINT_A: RoleBlueprint = {
  blueprint_id: "bp-001",
  role_context: {
    role_title: "Junior Software Engineer",
    job_family: "Engineering",
    job_level: "IC",
    industry: "Technology",
    use_case: "hiring_support_validated_blueprint",
    key_responsibilities: [
      "Write and review code across the product stack",
      "Collaborate with product and design on feature delivery",
      "Debug production issues and improve system reliability",
    ],
    decision_authority_level: "low",
    team_scope: "Member of a 6-person product engineering team",
    environmental_notes: "Fast-paced startup; daily standups; high code-review culture; some ambiguity in requirements",
  },
  context_profile: {
    context_id: "ctx-001",
    context_name: "Junior Software Engineer — Startup Engineering",
    job_family: "Engineering",
    job_level: "IC",
    leadership_scope: 0,
    ambiguity_level: 3,
    decision_stakes: 2,
    time_pressure: 4,
    regulatory_constraint: 1,
    autonomy_level: 2,
    stakeholder_complexity: 2,
    interdependence_level: 4,
    innovation_demand: 3,
    execution_precision_demand: 4,
    customer_exposure: 1,
    conflict_load: 2,
    change_velocity: 4,
    failure_cost: 3,
    success_profile_notes: "Success looks like consistent, quality code delivery within sprint cadences, strong collaboration with product and design, and constructive participation in code review culture.",
  },
  included_domains: ["D1", "D2", "D4"],
  selected_dimensions: [
    {
      dimension_id: "D1-CE",
      dimension_name: "Conscientious Execution",
      domain_id: "D1",
      selection_rationale: "Reliable task completion and self-discipline are critical for sprint delivery in a fast-moving engineering team.",
    },
    {
      dimension_id: "D1-EO",
      dimension_name: "Exploratory Openness",
      domain_id: "D1",
      selection_rationale: "IC engineers in a startup must be comfortable with ambiguous requirements and show curiosity and learning appetite.",
    },
    {
      dimension_id: "D1-ES",
      dimension_name: "Emotional Steadiness",
      domain_id: "D1",
      selection_rationale: "High-velocity delivery with frequent scope changes requires composure and pressure stability.",
    },
    {
      dimension_id: "D1-IO",
      dimension_name: "Interpersonal Orientation",
      domain_id: "D1",
      selection_rationale: "Code review culture and cross-functional collaboration require strong interpersonal orientation and conflict restraint.",
    },
    {
      dimension_id: "D2-DC",
      dimension_name: "Decision Complexity",
      domain_id: "D2",
      selection_rationale: "Engineering problem-solving requires prioritization under constraint and uncertainty handling.",
    },
    {
      dimension_id: "D2-LA",
      dimension_name: "Learning Agility",
      domain_id: "D2",
      selection_rationale: "Adaptation speed and feedback integration are direct proxies for developer growth in a new codebase.",
    },
    {
      dimension_id: "D2-NR",
      dimension_name: "Numerical Reasoning",
      domain_id: "D2",
      selection_rationale: "Engineers regularly work with data, metrics, and performance numbers requiring quantitative reasoning.",
    },
    {
      dimension_id: "D4-RC",
      dimension_name: "Resilience Capacity",
      domain_id: "D4",
      selection_rationale: "Code review feedback, production incidents, and debugging failures require bounce-back speed and setback tolerance.",
    },
    {
      dimension_id: "D4-RM",
      dimension_name: "Relationship Management",
      domain_id: "D4",
      selection_rationale: "Cross-functional work with product and design requires constructive conflict handling and trust-building behavior.",
    },
  ],
  governance_warnings: [
    {
      code: "GW-INT-001",
      severity: "caution",
      message: "Integrity Orientation items (D1-IN) are included with use_status: operational_allowed_with_restrictions. These items require stronger response-quality review before being used in consequential hiring decisions.",
      affected_dimension_ids: ["D1-IN"],
      nexus_rule: "PRD Part 2.2 — Integrity Orientation governance note",
    },
    {
      code: "GW-CAL-001",
      severity: "info",
      message: "GGUM calibration minimums (N ≥ 500/item) have not been confirmed for V1. All scores carry scoring_version: 1.0.0-provisional. Percentile reporting is not available until norm groups are established.",
      nexus_rule: "PRD Section 5.10 — GGUM calibration gates",
    },
    {
      code: "GW-VER-001",
      severity: "info",
      message: "All outputs will be tagged with scoring_version: 1.0.0-provisional and synthesis_weight_version: 1.0.0-provisional. Cross-version score comparisons are not permitted.",
      nexus_rule: "PRD Section 5.7 — Score versioning mandate",
    },
  ],
  approval_status: "approved",
  blueprint_quality: {
    evidence_completeness: 0.85,
    construct_clarity: 0.90,
    sme_agreement: 0.80,
    weight_justification: 0.75,
    role_level_specificity: 0.88,
    composite: 0.85 * 0.30 + 0.90 * 0.25 + 0.80 * 0.20 + 0.75 * 0.15 + 0.88 * 0.10,
  },
  agent_conversation_id: "conv-001",
  created_at: "2026-06-08T09:04:00Z",
  approved_at: "2026-06-09T14:00:00Z",
  approved_by: "admin@nexus.io",
};

// ─── Blueprint B — Operations Manager (draft) ─────────────────────────────────

export const BLUEPRINT_B: RoleBlueprint = {
  blueprint_id: "bp-002",
  role_context: {
    role_title: "Operations Manager",
    job_family: "Operations",
    job_level: "Manager",
    industry: "Logistics",
    use_case: "developmental",
    key_responsibilities: [
      "Oversee daily warehouse and dispatch operations",
      "Manage a team of 12 frontline staff",
      "Improve process efficiency and reduce operational errors",
    ],
    decision_authority_level: "moderate",
    team_scope: "Direct management of 12 staff; reports to Head of Operations",
    environmental_notes: "High-volume logistics; regulated; time-pressured; complex stakeholder environment",
  },
  context_profile: {
    context_id: "ctx-002",
    context_name: "Operations Manager — Logistics",
    job_family: "Operations",
    job_level: "Manager",
    leadership_scope: 2,
    ambiguity_level: 3,
    decision_stakes: 4,
    time_pressure: 5,
    regulatory_constraint: 4,
    autonomy_level: 3,
    stakeholder_complexity: 4,
    interdependence_level: 5,
    innovation_demand: 2,
    execution_precision_demand: 5,
    customer_exposure: 3,
    conflict_load: 4,
    change_velocity: 3,
    failure_cost: 4,
    success_profile_notes: "Success looks like zero safety incidents, consistent on-time dispatch rates, high team retention, and a culture of accountability across the warehouse floor.",
  },
  included_domains: ["D1", "D2", "D4"],
  selected_dimensions: [
    {
      dimension_id: "D1-CE",
      dimension_name: "Conscientious Execution",
      domain_id: "D1",
      selection_rationale: "Execution precision and standards maintenance are non-negotiable in a regulated logistics operation.",
    },
    {
      dimension_id: "D1-ES",
      dimension_name: "Emotional Steadiness",
      domain_id: "D1",
      selection_rationale: "Managing time-critical dispatch with 12 direct reports under pressure requires composure and stress tolerance.",
    },
    {
      dimension_id: "D1-IN",
      dimension_name: "Integrity Orientation",
      domain_id: "D1",
      selection_rationale: "Regulatory environment and health and safety compliance require strong rule regard and accountability.",
    },
    {
      dimension_id: "D1-IO",
      dimension_name: "Interpersonal Orientation",
      domain_id: "D1",
      selection_rationale: "Leading 12 frontline staff requires cooperation, empathy, and conflict restraint.",
    },
    {
      dimension_id: "D2-DC",
      dimension_name: "Decision Complexity",
      domain_id: "D2",
      selection_rationale: "Daily operational decisions under time pressure require prioritization and uncertainty handling capability.",
    },
    {
      dimension_id: "D2-VR",
      dimension_name: "Verbal Reasoning",
      domain_id: "D2",
      selection_rationale: "Stakeholder communication across suppliers, drivers, and leadership requires language precision and argument evaluation.",
    },
    {
      dimension_id: "D4-RC",
      dimension_name: "Resilience Capacity",
      domain_id: "D4",
      selection_rationale: "Peak-period pressure and operational failures require high endurance and rapid bounce-back.",
    },
    {
      dimension_id: "D4-RM",
      dimension_name: "Relationship Management",
      domain_id: "D4",
      selection_rationale: "Managing complex stakeholder dynamics with suppliers, drivers, and executives requires trust building and conflict handling.",
    },
    {
      dimension_id: "D4-SO",
      dimension_name: "Social Awareness",
      domain_id: "D4",
      selection_rationale: "Spotting team stress signals and reading stakeholder dynamics is critical in a high-conflict-load environment.",
    },
  ],
  governance_warnings: [
    {
      code: "GW-INT-001",
      severity: "caution",
      message: "Integrity Orientation items (D1-IN) are included with use_status: operational_allowed_with_restrictions. Governance note: these items require stronger response-quality review. Developmental use is permitted.",
      affected_dimension_ids: ["D1-IN"],
      nexus_rule: "PRD Part 2.2 — Integrity Orientation governance note",
    },
    {
      code: "GW-D3-001",
      severity: "info",
      message: "D3 (Motivational Drivers) was not included — it is deferred to Phase 2 pending dimension reduction analysis. Influence Drive and Achievement Drive are not measurable at V1.",
      nexus_rule: "PRD Part 2.4 — Domain 3 deferred to Phase 2",
    },
    {
      code: "GW-D5-001",
      severity: "info",
      message: "D5 Leadership Expression was excluded. It requires multi-method evidence (SJT, 360, behavioral observation) before use in any developmental or selection context.",
      nexus_rule: "PRD Part 2.6 — D5 deferred to Phase 2",
    },
    {
      code: "GW-CAL-001",
      severity: "info",
      message: "GGUM calibration minimums have not been confirmed for V1. All scores carry scoring_version: 1.0.0-provisional.",
      nexus_rule: "PRD Section 5.10 — GGUM calibration gates",
    },
  ],
  approval_status: "draft",
  blueprint_quality: {
    evidence_completeness: 0.78,
    construct_clarity: 0.85,
    sme_agreement: 0.70,
    weight_justification: 0.65,
    role_level_specificity: 0.82,
    composite: 0.78 * 0.30 + 0.85 * 0.25 + 0.70 * 0.20 + 0.65 * 0.15 + 0.82 * 0.10,
  },
  agent_conversation_id: "conv-002",
  created_at: "2026-06-10T10:04:00Z",
};

export const BLUEPRINTS = [BLUEPRINT_A, BLUEPRINT_B];

export function getBlueprintById(id: string): RoleBlueprint | undefined {
  return BLUEPRINTS.find((bp) => bp.blueprint_id === id);
}

export function getApprovedBlueprints(): RoleBlueprint[] {
  return BLUEPRINTS.filter(
    (bp) => bp.approval_status === "approved" || bp.approval_status === "validated"
  );
}
