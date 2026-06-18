// ─── Method and scale enums ────────────────────────────────────────────────────

export type MethodFamily =
  | "likert"
  | "contextual_self_report"
  | "forced_choice"
  | "cognitive_multiple_choice"
  | "sjt";

export type ResponseScale =
  | "1-5 Agreement"
  | "1-5 Frequency"
  | "forced_choice_binary"
  | "cognitive_mcq"
  | "sjt_single_best";

export type BankState = "production" | "pilot" | "research";

export type UseStatus =
  | "operational_allowed"
  | "operational_allowed_with_restrictions"
  | "operational_allowed_restricted_by_level"
  | "operational_blocked";

export type JobLevelOverlay =
  | "all_levels"
  | "professional_plus"
  | "manager_plus"
  | "senior_plus";

// ─── Bank item ─────────────────────────────────────────────────────────────────
// Mirrors QuestionBank.tsv column schema exactly. Never modified at runtime.

export type BankItem = {
  item_id: string;
  domain_id: string;
  domain_name: string;
  dimension_id: string;
  dimension_name: string;
  facet_id: string;
  facet_name: string;
  method_family: MethodFamily;
  item_format: string;
  item_text: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  option_e?: string;
  keyed_answer?: string;
  response_scale: ResponseScale;
  primary_domain_id: string;
  primary_dimension_id: string;
  primary_facet_id: string;
  secondary_dimension_ids?: string;
  loading_type: "direct" | "adjacent" | "synthesized";
  intended_meaning: string;
  prohibited_overlap?: string;
  bank_state: BankState;
  use_status: UseStatus;
  validation_track: string;
  job_level_overlay: JobLevelOverlay;
  reverse_scored: boolean;
};

// ─── Context profile ────────────────────────────────────────────────────────────
// 17-field structured context form for Domain 6 derivation.

export type JobLevel =
  | "IC"
  | "Professional"
  | "Manager"
  | "Senior Manager"
  | "Director"
  | "Executive";

export type JobFamily =
  | "Strategy"
  | "Operations"
  | "Sales"
  | "Product"
  | "Engineering"
  | "People"
  | "Finance"
  | "Risk"
  | "General Management"
  | "Other";

export type ContextProfile = {
  context_id: string;
  context_name: string;
  job_family: JobFamily;
  job_level: JobLevel;
  leadership_scope: 0 | 1 | 2 | 3 | 4;
  ambiguity_level: 1 | 2 | 3 | 4 | 5;
  decision_stakes: 1 | 2 | 3 | 4 | 5;
  time_pressure: 1 | 2 | 3 | 4 | 5;
  regulatory_constraint: 1 | 2 | 3 | 4 | 5;
  autonomy_level: 1 | 2 | 3 | 4 | 5;
  stakeholder_complexity: 1 | 2 | 3 | 4 | 5;
  interdependence_level: 1 | 2 | 3 | 4 | 5;
  innovation_demand: 1 | 2 | 3 | 4 | 5;
  execution_precision_demand: 1 | 2 | 3 | 4 | 5;
  customer_exposure: 1 | 2 | 3 | 4 | 5;
  conflict_load: 1 | 2 | 3 | 4 | 5;
  change_velocity: 1 | 2 | 3 | 4 | 5;
  failure_cost: 1 | 2 | 3 | 4 | 5;
  success_profile_notes: string;
};

// ─── Role context ──────────────────────────────────────────────────────────────
// What the AI agent extracts from the interview conversation.

export type RoleContext = {
  role_title: string;
  job_family: JobFamily;
  job_level: JobLevel;
  industry?: string;
  use_case: "developmental" | "hiring_support_validated_blueprint";
  key_responsibilities: string[];
  decision_authority_level: "low" | "moderate" | "high";
  team_scope: string;
  environmental_notes: string;
};

// ─── Governance warning ────────────────────────────────────────────────────────

export type GovernanceSeverity = "blocking" | "caution" | "info";

export type GovernanceWarning = {
  code: string;
  severity: GovernanceSeverity;
  message: string;
  affected_item_ids?: string[];
  affected_dimension_ids?: string[];
  nexus_rule?: string;
};

// ─── Role blueprint ────────────────────────────────────────────────────────────
// Agent-generated output from the interview. Admin reviews and approves.

export type BlueprintApprovalStatus =
  | "draft"
  | "reviewed"
  | "approved"
  | "validated";

export type SelectedDimension = {
  dimension_id: string;
  dimension_name: string;
  domain_id: string;
  selection_rationale: string;
};

export type BlueprintQualityScore = {
  evidence_completeness: number;   // E: 0–1
  construct_clarity: number;        // C: 0–1
  sme_agreement: number;            // S: 0–1
  weight_justification: number;     // W: 0–1
  role_level_specificity: number;   // R: 0–1
  composite: number;                // BQ = 0.30E + 0.25C + 0.20S + 0.15W + 0.10R
};

export type RoleBlueprint = {
  blueprint_id: string;
  role_context: RoleContext;
  context_profile: ContextProfile;
  included_domains: string[];
  selected_dimensions: SelectedDimension[];
  governance_warnings: GovernanceWarning[];
  approval_status: BlueprintApprovalStatus;
  blueprint_quality: BlueprintQualityScore;
  agent_conversation_id: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
};

// ─── Assessment blueprint ──────────────────────────────────────────────────────
// Agent-generated item selection with contextualized wording.

export type ContextualizedItem = {
  item_id: string;                     // immutable link to BankItem — never modified
  original_text: string;               // verbatim copy from BankItem.item_text
  contextualized_text: string;         // agent-generated for this role/context
  contextualization_rationale: string; // one sentence: why this item was selected
  display_order: number;
};

export type DomainCoverage = {
  domain_id: string;
  domain_name: string;
  dimension_ids: string[];
  item_count: number;
};

export type AssessmentBlueprint = {
  assessment_blueprint_id: string;
  role_blueprint_id: string;
  contextualized_items: ContextualizedItem[];
  total_items: number;
  estimated_duration_min: number;
  method_mix: {
    likert: number;
    contextual_self_report: number;
    forced_choice: number;
    cognitive_multiple_choice: number;
    sjt: number;
  };
  domain_coverage: DomainCoverage[];
  agent_selection_rationale: string;
  generated_at: string;
};

// ─── Agent transcript ──────────────────────────────────────────────────────────

export type AgentTurn = {
  id: string;
  role: "agent" | "admin";
  content: string;
  timestamp: string;
  extracted_field?: keyof RoleContext;
  is_generating?: boolean;
};

export type AgentTranscript = {
  conversation_id: string;
  turns: AgentTurn[];
  extracted_context: RoleContext;
  completed: boolean;
};

// ─── Assessment assignment ─────────────────────────────────────────────────────

export type AssignmentStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "expired";

// Mock invitation lifecycle (no email backend — tracked in-memory only)
export type InvitationStatus = "not_sent" | "sent" | "opened";

export type AssessmentAssignment = {
  assignment_id: string;
  blueprint_id: string;
  assessment_blueprint_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  job_title?: string;
  use_case: "developmental" | "hiring_support_validated_blueprint";
  status: AssignmentStatus;
  consent_confirmed: boolean;
  consent_date?: string;
  deadline: string;
  assigned_at: string;
  assigned_by: string;
  session_id?: string;
  completed_at?: string;
  invitation_link?: string;
  invitation_status?: InvitationStatus;
};

// ─── Item responses ────────────────────────────────────────────────────────────
// Method-aware response union. Each variant is typed to its method family.

export type LikertResponse = {
  item_id: string;
  method_family: "likert";
  value: 1 | 2 | 3 | 4 | 5;
  latency_ms: number;
};

export type FrequencyResponse = {
  item_id: string;
  method_family: "contextual_self_report";
  value: 1 | 2 | 3 | 4 | 5;
  latency_ms: number;
};

export type ForcedChoiceResponse = {
  item_id: string;
  method_family: "forced_choice";
  selected_option: "A" | "B";
  latency_ms: number;
};

export type CognitiveResponse = {
  item_id: string;
  method_family: "cognitive_multiple_choice";
  selected_option: "A" | "B" | "C" | "D" | "E";
  latency_ms: number;
};

export type SJTResponse = {
  item_id: string;
  method_family: "sjt";
  selected_option: "A" | "B" | "C" | "D" | "E";
  latency_ms: number;
};

export type ItemResponse =
  | LikertResponse
  | FrequencyResponse
  | ForcedChoiceResponse
  | CognitiveResponse
  | SJTResponse;

// ─── QC flags ─────────────────────────────────────────────────────────────────

export type QCFlag = {
  flag_code: string;
  severity: "low" | "moderate" | "high";
  description: string;
  affected_domain?: string;
};

// ─── Scoring outputs ───────────────────────────────────────────────────────────
// Follows ScoringSpecification.md structure.

export type ConfidenceBand = "HIGH" | "MODERATE" | "LOW" | "UNACCEPTABLE";

export type DisplayState =
  | "visible"
  | "visible_with_caution"
  | "downgraded"
  | "hidden"
  | "blocked";

export type DimensionScore = {
  dimension_id: string;
  dimension_name: string;
  domain_id: string;
  raw_score: number;
  standardized_score: number;    // 0–100 linear provisional transform
  standard_error: number;        // SE used for confidence band classification
  confidence: ConfidenceBand;
  display_state: DisplayState;
  item_count: number;
  reverse_items_applied: number;
};

export type DomainScore = {
  domain_id: string;
  domain_name: string;
  standardized_score: number;
  confidence: ConfidenceBand;
  dimensions: DimensionScore[];
};

// Validity states follow PRD Part 6 exactly
export type ValidityState =
  | "VALID"
  | "PASS_WITH_LIMITS"
  | "VALID_BUT_UNINTERPRETABLE"
  | "INCOMPLETE"
  | "INVALID";

export type ReleaseState =
  | "Released"
  | "Released with Caution"
  | "Partial Release"
  | "Blocked output section"
  | "Assessment incomplete"
  | "Invalid for interpretation";

export type ScoredResult = {
  scoring_run_id: string;
  session_id: string;
  bank_version: "final";
  norm_version: "provisional";
  scoring_version: "1.0.0-provisional";
  synthesis_weight_version: "1.0.0-provisional";
  validity_state: ValidityState;
  release_state: ReleaseState;
  domain_scores: DomainScore[];
  qc_flags: QCFlag[];
  completion_ratio: number;
  scored_at: string;
};

// ─── Report outputs ────────────────────────────────────────────────────────────
// Follows AutomatedReportingStandard.md structure.

export type StrengthPoint = {
  dimension_id: string;
  dimension_name: string;
  score: number;
  label: string;
};

export type WatchPoint = {
  dimension_id: string;
  dimension_name: string;
  score: number;
  note: string;
};

export type BehavioralDescriptor = {
  dimension_id: string;
  dimension_name: string;
  text: string;
};

export type BlockedSectionReason = {
  section: string;
  reason: string;
  governance_rule: string;
};

export type AdminReportView = {
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  job_level: JobLevel;
  organization: string;
  domain_scores: DomainScore[];
  qc_flags: QCFlag[];
  governance_notes: string[];
  strengths: StrengthPoint[];
  watch_points: WatchPoint[];
  confidence_summary: string;
  blueprint_status: BlueprintApprovalStatus;
  use_case: "developmental" | "hiring_support_validated_blueprint";
};

export type CandidateReportView = {
  domain_scores: DomainScore[];    // only HIGH/MODERATE display_state visible
  behavioral_descriptors: BehavioralDescriptor[];
  development_suggestions: string[];
  blocked_section_notices: BlockedSectionReason[];
};

export type Report = {
  report_id: string;
  scoring_run_id: string;
  blueprint_id: string;
  assessment_blueprint_id: string;
  use_case: "developmental" | "hiring_support_validated_blueprint";
  policy_version: "1.0.0";
  scoring_version: "1.0.0-provisional";
  synthesis_weight_version: "1.0.0-provisional";
  release_state: ReleaseState;
  visible_sections: string[];
  blocked_sections: string[];
  downgraded_dimension_ids: string[];
  hidden_dimension_ids: string[];
  admin_view: AdminReportView;
  candidate_view: CandidateReportView;
  generated_at: string;
};
