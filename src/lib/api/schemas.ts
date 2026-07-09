// Nexus — API request/response Zod schemas
// ─────────────────────────────────────────────────────────────────────────────
// PLAN/DRAFT ONLY. These schemas are NOT yet wired into any route handler or the
// frontend mock store. They define the validation contract for the future backend
// (see docs/API_CONTRACT.md) and mirror src/lib/types/nexus.ts 1:1.
//
// The block at the bottom of this file contains compile-time assertions proving
// each schema's inferred type stays assignable to its nexus.ts counterpart, so the
// existing frontend types remain the single source of truth and can never drift.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import type * as N from "@/lib/types/nexus";

// ─── Reusable scalars ──────────────────────────────────────────────────────────

const oneToFive = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

const zeroToFour = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

const isoDateString = z.string().datetime({ offset: true }).or(z.string()); // ISO 8601; lenient for seed data

// ─── Enum schemas (mirror nexus.ts string unions) ──────────────────────────────

export const MethodFamilySchema = z.enum([
  "likert",
  "contextual_self_report",
  "forced_choice",
  "cognitive_multiple_choice",
  "sjt",
]);

export const ResponseScaleSchema = z.enum([
  "1-5 Agreement",
  "1-5 Frequency",
  "forced_choice_binary",
  "cognitive_mcq",
  "sjt_single_best",
]);

export const BankStateSchema = z.enum(["production", "pilot", "research"]);

export const UseStatusSchema = z.enum([
  "operational_allowed",
  "operational_allowed_with_restrictions",
  "operational_allowed_restricted_by_level",
  "operational_blocked",
]);

export const JobLevelOverlaySchema = z.enum([
  "all_levels",
  "professional_plus",
  "manager_plus",
  "senior_plus",
]);

export const JobLevelSchema = z.enum([
  "IC",
  "Professional",
  "Manager",
  "Senior Manager",
  "Director",
  "Executive",
]);

export const JobFamilySchema = z.enum([
  "Strategy",
  "Operations",
  "Sales",
  "Product",
  "Engineering",
  "People",
  "Finance",
  "Risk",
  "General Management",
  "Other",
]);

export const UseCaseSchema = z.enum([
  "developmental",
  "hiring_support_validated_blueprint",
]);

export const GovernanceSeveritySchema = z.enum(["blocking", "caution", "info"]);

export const BlueprintApprovalStatusSchema = z.enum([
  "draft",
  "reviewed",
  "approved",
  "validated",
]);

export const AssignmentStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "completed",
  "expired",
]);

export const InvitationStatusSchema = z.enum(["not_sent", "sent", "opened"]);

export const ConfidenceBandSchema = z.enum([
  "HIGH",
  "MODERATE",
  "LOW",
  "UNACCEPTABLE",
]);

export const DisplayStateSchema = z.enum([
  "visible",
  "visible_with_caution",
  "downgraded",
  "hidden",
  "blocked",
]);

export const ValidityStateSchema = z.enum([
  "VALID",
  "PASS_WITH_LIMITS",
  "VALID_BUT_UNINTERPRETABLE",
  "INCOMPLETE",
  "INVALID",
]);

export const ReleaseStateSchema = z.enum([
  "Released",
  "Released with Caution",
  "Partial Release",
  "Blocked output section",
  "Assessment incomplete",
  "Invalid for interpretation",
]);

export const RoleSchema = z.enum(["admin", "candidate"]);

// ─── Bank item ─────────────────────────────────────────────────────────────────

export const BankItemSchema = z.object({
  item_id: z.string(),
  domain_id: z.string(),
  domain_name: z.string(),
  dimension_id: z.string(),
  dimension_name: z.string(),
  facet_id: z.string(),
  facet_name: z.string(),
  method_family: MethodFamilySchema,
  item_format: z.string(),
  item_text: z.string(),
  option_a: z.string().optional(),
  option_b: z.string().optional(),
  option_c: z.string().optional(),
  option_d: z.string().optional(),
  option_e: z.string().optional(),
  keyed_answer: z.string().optional(),
  response_scale: ResponseScaleSchema,
  primary_domain_id: z.string(),
  primary_dimension_id: z.string(),
  primary_facet_id: z.string(),
  secondary_dimension_ids: z.string().optional(),
  loading_type: z.enum(["direct", "adjacent", "synthesized"]),
  intended_meaning: z.string(),
  prohibited_overlap: z.string().optional(),
  bank_state: BankStateSchema,
  use_status: UseStatusSchema,
  validation_track: z.string(),
  job_level_overlay: JobLevelOverlaySchema,
  reverse_scored: z.boolean(),
});

/// Query filters for GET /api/bank (all optional, ANDed). Enum params reuse the
/// existing method_family / use_status schemas so invalid values are rejected 400.
export const BankQuerySchema = z.object({
  domain_id: z.string().min(1).optional(),
  dimension_id: z.string().min(1).optional(),
  method_family: MethodFamilySchema.optional(),
  use_status: UseStatusSchema.optional(),
});

/// Candidate-safe projection of a bank item for session delivery. Deliberately
/// OMITS keyed_answer, reverse_scored, intended_meaning, scoring/governance fields.
export const SessionItemSchema = z.object({
  item_id: z.string(),
  display_order: z.number().int(),
  contextualized_text: z.string(),
  method_family: MethodFamilySchema,
  response_scale: ResponseScaleSchema,
  option_a: z.string().optional(),
  option_b: z.string().optional(),
  option_c: z.string().optional(),
  option_d: z.string().optional(),
  option_e: z.string().optional(),
});

// ─── Context profile (17-field Domain 6 context form) ──────────────────────────

export const ContextProfileSchema = z.object({
  context_id: z.string(),
  context_name: z.string(),
  job_family: JobFamilySchema,
  job_level: JobLevelSchema,
  leadership_scope: zeroToFour,
  ambiguity_level: oneToFive,
  decision_stakes: oneToFive,
  time_pressure: oneToFive,
  regulatory_constraint: oneToFive,
  autonomy_level: oneToFive,
  stakeholder_complexity: oneToFive,
  interdependence_level: oneToFive,
  innovation_demand: oneToFive,
  execution_precision_demand: oneToFive,
  customer_exposure: oneToFive,
  conflict_load: oneToFive,
  change_velocity: oneToFive,
  failure_cost: oneToFive,
  success_profile_notes: z.string(),
});

// ─── Role context ──────────────────────────────────────────────────────────────

export const RoleContextSchema = z.object({
  role_title: z.string(),
  job_family: JobFamilySchema,
  job_level: JobLevelSchema,
  industry: z.string().optional(),
  use_case: UseCaseSchema,
  key_responsibilities: z.array(z.string()),
  decision_authority_level: z.enum(["low", "moderate", "high"]),
  team_scope: z.string(),
  environmental_notes: z.string(),
});

// ─── Governance warning ────────────────────────────────────────────────────────

export const GovernanceWarningSchema = z.object({
  code: z.string(),
  severity: GovernanceSeveritySchema,
  message: z.string(),
  affected_item_ids: z.array(z.string()).optional(),
  affected_dimension_ids: z.array(z.string()).optional(),
  nexus_rule: z.string().optional(),
});

// ─── Role blueprint ────────────────────────────────────────────────────────────

export const SelectedDimensionSchema = z.object({
  dimension_id: z.string(),
  dimension_name: z.string(),
  domain_id: z.string(),
  selection_rationale: z.string(),
});

export const BlueprintQualityScoreSchema = z.object({
  evidence_completeness: z.number(),
  construct_clarity: z.number(),
  sme_agreement: z.number(),
  weight_justification: z.number(),
  role_level_specificity: z.number(),
  composite: z.number(),
});

export const RoleBlueprintSchema = z.object({
  blueprint_id: z.string(),
  role_context: RoleContextSchema,
  context_profile: ContextProfileSchema,
  included_domains: z.array(z.string()),
  selected_dimensions: z.array(SelectedDimensionSchema),
  governance_warnings: z.array(GovernanceWarningSchema),
  approval_status: BlueprintApprovalStatusSchema,
  blueprint_quality: BlueprintQualityScoreSchema,
  agent_conversation_id: z.string(),
  created_at: z.string(),
  approved_at: z.string().optional(),
  approved_by: z.string().optional(),
});

// ─── Assessment blueprint ──────────────────────────────────────────────────────

export const ContextualizedItemSchema = z.object({
  item_id: z.string(),
  original_text: z.string(),
  contextualized_text: z.string(),
  contextualization_rationale: z.string(),
  display_order: z.number(),
});

export const DomainCoverageSchema = z.object({
  domain_id: z.string(),
  domain_name: z.string(),
  dimension_ids: z.array(z.string()),
  item_count: z.number(),
});

export const MethodMixSchema = z.object({
  likert: z.number(),
  contextual_self_report: z.number(),
  forced_choice: z.number(),
  cognitive_multiple_choice: z.number(),
  sjt: z.number(),
});

export const AssessmentBlueprintSchema = z.object({
  assessment_blueprint_id: z.string(),
  role_blueprint_id: z.string(),
  contextualized_items: z.array(ContextualizedItemSchema),
  total_items: z.number(),
  estimated_duration_min: z.number(),
  method_mix: MethodMixSchema,
  domain_coverage: z.array(DomainCoverageSchema),
  agent_selection_rationale: z.string(),
  generated_at: z.string(),
});

// ─── Agent transcript ──────────────────────────────────────────────────────────

const RoleContextKeySchema = z.enum([
  "role_title",
  "job_family",
  "job_level",
  "industry",
  "use_case",
  "key_responsibilities",
  "decision_authority_level",
  "team_scope",
  "environmental_notes",
]);

export const AgentTurnSchema = z.object({
  id: z.string(),
  role: z.enum(["agent", "admin"]),
  content: z.string(),
  timestamp: z.string(),
  extracted_field: RoleContextKeySchema.optional(),
  is_generating: z.boolean().optional(),
});

// ─── Assessment assignment ─────────────────────────────────────────────────────

export const AssessmentAssignmentSchema = z.object({
  assignment_id: z.string(),
  blueprint_id: z.string(),
  assessment_blueprint_id: z.string(),
  candidate_id: z.string(),
  candidate_name: z.string(),
  candidate_email: z.string(),
  job_title: z.string().optional(),
  use_case: UseCaseSchema,
  status: AssignmentStatusSchema,
  consent_confirmed: z.boolean(),
  consent_date: z.string().optional(),
  deadline: z.string(),
  assigned_at: z.string(),
  assigned_by: z.string(),
  session_id: z.string().optional(),
  completed_at: z.string().optional(),
  invitation_link: z.string().optional(),
  invitation_status: InvitationStatusSchema.optional(),
});

// ─── Item responses (discriminated union by method_family) ─────────────────────

export const LikertResponseSchema = z.object({
  item_id: z.string(),
  method_family: z.literal("likert"),
  value: oneToFive,
  latency_ms: z.number(),
});

export const FrequencyResponseSchema = z.object({
  item_id: z.string(),
  method_family: z.literal("contextual_self_report"),
  value: oneToFive,
  latency_ms: z.number(),
});

export const ForcedChoiceResponseSchema = z.object({
  item_id: z.string(),
  method_family: z.literal("forced_choice"),
  selected_option: z.enum(["A", "B"]),
  latency_ms: z.number(),
});

export const CognitiveResponseSchema = z.object({
  item_id: z.string(),
  method_family: z.literal("cognitive_multiple_choice"),
  selected_option: z.enum(["A", "B", "C", "D", "E"]),
  latency_ms: z.number(),
});

export const SJTResponseSchema = z.object({
  item_id: z.string(),
  method_family: z.literal("sjt"),
  selected_option: z.enum(["A", "B", "C", "D", "E"]),
  latency_ms: z.number(),
});

export const ItemResponseSchema = z.discriminatedUnion("method_family", [
  LikertResponseSchema,
  FrequencyResponseSchema,
  ForcedChoiceResponseSchema,
  CognitiveResponseSchema,
  SJTResponseSchema,
]);

// ─── QC flags ─────────────────────────────────────────────────────────────────

export const QCFlagSchema = z.object({
  flag_code: z.string(),
  severity: z.enum(["low", "moderate", "high"]),
  description: z.string(),
  affected_domain: z.string().optional(),
});

// ─── Scoring outputs ───────────────────────────────────────────────────────────

export const DimensionScoreSchema = z.object({
  dimension_id: z.string(),
  dimension_name: z.string(),
  domain_id: z.string(),
  raw_score: z.number(),
  standardized_score: z.number(),
  standard_error: z.number(),
  confidence: ConfidenceBandSchema,
  display_state: DisplayStateSchema,
  item_count: z.number(),
  reverse_items_applied: z.number(),
});

export const DomainScoreSchema = z.object({
  domain_id: z.string(),
  domain_name: z.string(),
  standardized_score: z.number(),
  confidence: ConfidenceBandSchema,
  dimensions: z.array(DimensionScoreSchema),
});

export const ScoredResultSchema = z.object({
  scoring_run_id: z.string(),
  session_id: z.string(),
  bank_version: z.literal("final"),
  norm_version: z.literal("provisional"),
  scoring_version: z.literal("1.0.0-provisional"),
  synthesis_weight_version: z.literal("1.0.0-provisional"),
  validity_state: ValidityStateSchema,
  release_state: ReleaseStateSchema,
  domain_scores: z.array(DomainScoreSchema),
  qc_flags: z.array(QCFlagSchema),
  completion_ratio: z.number(),
  scored_at: z.string(),
});

// ─── Report outputs (audience-partitioned) ─────────────────────────────────────

export const StrengthPointSchema = z.object({
  dimension_id: z.string(),
  dimension_name: z.string(),
  score: z.number(),
  label: z.string(),
});

export const WatchPointSchema = z.object({
  dimension_id: z.string(),
  dimension_name: z.string(),
  score: z.number(),
  note: z.string(),
});

export const BehavioralDescriptorSchema = z.object({
  dimension_id: z.string(),
  dimension_name: z.string(),
  text: z.string(),
});

export const BlockedSectionReasonSchema = z.object({
  section: z.string(),
  reason: z.string(),
  governance_rule: z.string(),
});

/// ADMIN ONLY — full detail incl. qc_flags, watch_points, governance_notes.
export const AdminReportViewSchema = z.object({
  candidate_id: z.string(),
  candidate_name: z.string(),
  candidate_email: z.string(),
  job_title: z.string(),
  job_level: JobLevelSchema,
  organization: z.string(),
  domain_scores: z.array(DomainScoreSchema),
  qc_flags: z.array(QCFlagSchema),
  governance_notes: z.array(z.string()),
  strengths: z.array(StrengthPointSchema),
  watch_points: z.array(WatchPointSchema),
  confidence_summary: z.string(),
  blueprint_status: BlueprintApprovalStatusSchema,
  use_case: UseCaseSchema,
});

/// CANDIDATE-SAFE — no governance internals, no watch_points, no qc_flags.
/// Only HIGH/MODERATE display_state dimensions reach this view.
export const CandidateReportViewSchema = z.object({
  domain_scores: z.array(DomainScoreSchema),
  behavioral_descriptors: z.array(BehavioralDescriptorSchema),
  development_suggestions: z.array(z.string()),
  blocked_section_notices: z.array(BlockedSectionReasonSchema),
});

export const ReportSchema = z.object({
  report_id: z.string(),
  scoring_run_id: z.string(),
  blueprint_id: z.string(),
  assessment_blueprint_id: z.string(),
  use_case: UseCaseSchema,
  policy_version: z.literal("1.0.0"),
  scoring_version: z.literal("1.0.0-provisional"),
  synthesis_weight_version: z.literal("1.0.0-provisional"),
  release_state: ReleaseStateSchema,
  visible_sections: z.array(z.string()),
  blocked_sections: z.array(z.string()),
  downgraded_dimension_ids: z.array(z.string()),
  hidden_dimension_ids: z.array(z.string()),
  admin_view: AdminReportViewSchema,
  candidate_view: CandidateReportViewSchema,
  generated_at: z.string(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST SCHEMAS — validate inbound payloads at the (future) handler boundary.
// ═══════════════════════════════════════════════════════════════════════════════

// Auth
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Agent
export const AgentMessageRequestSchema = z.object({
  content: z.string().min(1),
});

// Blueprints
export const ApproveBlueprintRequestSchema = z.object({
  approved_by: z.string().email(),
  // Acknowledgement that no blocking governance warnings remain.
  acknowledged_warnings: z.array(z.string()).default([]),
  target_status: z.enum(["approved", "validated"]).default("approved"),
});

// Assignments — mirrors store-provider CreateAssignmentParams
export const CreateAssignmentRequestSchema = z.object({
  blueprintId: z.string(),
  assessmentBlueprintId: z.string(),
  candidateName: z.string().min(1),
  candidateEmail: z.string().email(),
  deadline: z.string(),
  useCase: UseCaseSchema,
  includedDomains: z.array(z.string()),
  jobTitle: z.string().optional(),
});

// Assignments (bulk) — mirrors store-provider CreateBulkParams
export const BulkCandidateInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  jobTitle: z.string().optional(),
});

export const CreateBulkAssignmentRequestSchema = z.object({
  blueprintId: z.string(),
  assessmentBlueprintId: z.string(),
  deadline: z.string(),
  useCase: UseCaseSchema,
  includedDomains: z.array(z.string()),
  candidates: z.array(BulkCandidateInputSchema).min(1),
});

export const SetInvitationStatusRequestSchema = z.object({
  invitation_status: InvitationStatusSchema,
});

/// Query filters + pagination for GET /api/assignments. All optional; filters are
/// ANDed. page/page_size are coerced from the query string and bounded.
export const AssignmentQuerySchema = z.object({
  status: AssignmentStatusSchema.optional(),
  blueprint_id: z.string().min(1).optional(),
  candidate_email: z.string().email().optional(),
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
});

/// PATCH /api/assignments/:id — ONLY these three mutable fields may change.
/// (No candidate/blueprint reassignment, no consent/session mutation here.)
/// At least one field must be present.
export const UpdateAssignmentRequestSchema = z
  .object({
    deadline: z.string().min(1).optional(),
    invitation_status: InvitationStatusSchema.optional(),
    status: AssignmentStatusSchema.optional(),
  })
  .refine(
    (d) =>
      d.deadline !== undefined ||
      d.invitation_status !== undefined ||
      d.status !== undefined,
    { message: "Provide at least one of: deadline, invitation_status, status." },
  );

// Session runtime
export const ConsentRequestSchema = z.object({
  use_case: UseCaseSchema,
  consent_text_version: z.string(),
});

/// POST /api/sessions/start — begin a session for one of the candidate's own
/// assignments.
export const StartSessionRequestSchema = z.object({
  assignment_id: z.string().min(1),
});

export const SubmitResponsesRequestSchema = z.object({
  responses: z.array(ItemResponseSchema).min(1),
});

// Scoring
/// POST /api/scoring/run — run V1 provisional scoring for a submitted session.
export const RunScoringRequestSchema = z.object({
  session_id: z.string().min(1),
});

// Reports
/// POST /api/reports/generate — build a report from a scoring run.
export const GenerateReportRequestSchema = z.object({
  scoring_run_id: z.string().min(1),
});

/// GET /api/me/report — the candidate-safe report payload. Deliberately OMITS
/// admin_view, qc_flags, governance notes and all admin-only internals. use_case
/// is also omitted — candidates must not see hiring-context metadata.
export const CandidateReportResponseSchema = z.object({
  report_id: z.string(),
  release_state: ReleaseStateSchema,
  candidate_view: CandidateReportViewSchema,
  generated_at: z.string(),
});

/// Session metadata (NO items, NO scoring, NO keyed answers). Returned by
/// start / get / submit.
export const SessionMetadataSchema = z.object({
  session_id: z.string(),
  assignment_id: z.string(),
  assessment_blueprint_id: z.string(),
  candidate_id: z.string(),
  state: z.enum(["created", "in_progress", "submitted", "scored", "expired"]),
  started_at: z.string().optional(),
  submitted_at: z.string().optional(),
  current_index: z.number().int(),
  total_items: z.number().int(),
  answered_count: z.number().int(),
});

// Domain 6
export const CreateContextRequestSchema = ContextProfileSchema.omit({
  context_id: true,
});

export const ComputeDomain6RequestSchema = z.object({
  scoring_run_id: z.string(),
  context_id: z.string(),
});

// Report export
export const CreateExportRequestSchema = z.object({
  audience: RoleSchema, // "admin" | "candidate"
});

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE SCHEMAS — shape of representative outbound payloads.
// ═══════════════════════════════════════════════════════════════════════════════

export const SessionResponseSchema = z.object({
  session_id: z.string(),
  state: z.enum(["created", "in_progress", "submitted", "scored", "expired"]),
  assessment_blueprint_id: z.string(),
  current_index: z.number().int(),
  items: z.array(SessionItemSchema), // candidate-safe items only
});

export const CreatedAssignmentRecordSchema = z.object({
  assignmentId: z.string(),
  candidateId: z.string(),
  candidateName: z.string(),
  candidateEmail: z.string(),
  jobTitle: z.string().optional(),
  invitationLink: z.string(),
  invitationStatus: InvitationStatusSchema,
});

export const ExportStatusResponseSchema = z.object({
  export_id: z.string(),
  report_id: z.string().optional(),
  status: z.enum(["pending", "ready", "failed"]),
  audience: RoleSchema,
  storage_url: z.string().optional(),
  checksum: z.string().optional(),
  generated_at: z.string().optional(),
  // V1: exports are a provisional stub (no real PDF bytes). This flag makes that
  // explicit on the wire so clients don't treat storage_url as a live download.
  provisional: z.boolean().optional(),
  format: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// INFERRED TYPES — exported for use by the future API clients and handlers.
// ═══════════════════════════════════════════════════════════════════════════════

export type BankItemDTO = z.infer<typeof BankItemSchema>;
export type SessionItemDTO = z.infer<typeof SessionItemSchema>;
export type ContextProfileDTO = z.infer<typeof ContextProfileSchema>;
export type RoleContextDTO = z.infer<typeof RoleContextSchema>;
export type RoleBlueprintDTO = z.infer<typeof RoleBlueprintSchema>;
export type AssessmentBlueprintDTO = z.infer<typeof AssessmentBlueprintSchema>;
export type AssessmentAssignmentDTO = z.infer<typeof AssessmentAssignmentSchema>;
export type ItemResponseDTO = z.infer<typeof ItemResponseSchema>;
export type ScoredResultDTO = z.infer<typeof ScoredResultSchema>;
export type ReportDTO = z.infer<typeof ReportSchema>;
export type AdminReportViewDTO = z.infer<typeof AdminReportViewSchema>;
export type CandidateReportViewDTO = z.infer<typeof CandidateReportViewSchema>;

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type CreateAssignmentRequest = z.infer<typeof CreateAssignmentRequestSchema>;
export type CreateBulkAssignmentRequest = z.infer<typeof CreateBulkAssignmentRequestSchema>;
export type AssignmentQuery = z.infer<typeof AssignmentQuerySchema>;
export type UpdateAssignmentRequest = z.infer<typeof UpdateAssignmentRequestSchema>;
export type SubmitResponsesRequest = z.infer<typeof SubmitResponsesRequestSchema>;
export type StartSessionRequest = z.infer<typeof StartSessionRequestSchema>;
export type SessionMetadataDTO = z.infer<typeof SessionMetadataSchema>;
export type RunScoringRequest = z.infer<typeof RunScoringRequestSchema>;
export type GenerateReportRequest = z.infer<typeof GenerateReportRequestSchema>;
export type CandidateReportResponseDTO = z.infer<typeof CandidateReportResponseSchema>;
export type ConsentRequest = z.infer<typeof ConsentRequestSchema>;
export type ApproveBlueprintRequest = z.infer<typeof ApproveBlueprintRequestSchema>;
export type CreateContextRequest = z.infer<typeof CreateContextRequestSchema>;
export type CreateExportRequest = z.infer<typeof CreateExportRequestSchema>;
export type ExportStatusResponseDTO = z.infer<typeof ExportStatusResponseSchema>;
export type CreatedAssignmentRecord = z.infer<typeof CreatedAssignmentRecordSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// COMPILE-TIME CONTRACT GUARD
// Proves each schema's inferred type is assignable to its nexus.ts counterpart.
// If nexus.ts changes and a schema drifts, the build fails here — keeping the
// frontend types authoritative. No runtime effect.
// ═══════════════════════════════════════════════════════════════════════════════

type AssignableTo<Actual extends Expected, Expected> = true;
type Guard =
  | AssignableTo<z.infer<typeof BankItemSchema>, N.BankItem>
  | AssignableTo<z.infer<typeof ContextProfileSchema>, N.ContextProfile>
  | AssignableTo<z.infer<typeof RoleContextSchema>, N.RoleContext>
  | AssignableTo<z.infer<typeof GovernanceWarningSchema>, N.GovernanceWarning>
  | AssignableTo<z.infer<typeof SelectedDimensionSchema>, N.SelectedDimension>
  | AssignableTo<z.infer<typeof BlueprintQualityScoreSchema>, N.BlueprintQualityScore>
  | AssignableTo<z.infer<typeof RoleBlueprintSchema>, N.RoleBlueprint>
  | AssignableTo<z.infer<typeof ContextualizedItemSchema>, N.ContextualizedItem>
  | AssignableTo<z.infer<typeof DomainCoverageSchema>, N.DomainCoverage>
  | AssignableTo<z.infer<typeof AssessmentBlueprintSchema>, N.AssessmentBlueprint>
  | AssignableTo<z.infer<typeof AgentTurnSchema>, N.AgentTurn>
  | AssignableTo<z.infer<typeof AssessmentAssignmentSchema>, N.AssessmentAssignment>
  | AssignableTo<z.infer<typeof ItemResponseSchema>, N.ItemResponse>
  | AssignableTo<z.infer<typeof QCFlagSchema>, N.QCFlag>
  | AssignableTo<z.infer<typeof DimensionScoreSchema>, N.DimensionScore>
  | AssignableTo<z.infer<typeof DomainScoreSchema>, N.DomainScore>
  | AssignableTo<z.infer<typeof ScoredResultSchema>, N.ScoredResult>
  | AssignableTo<z.infer<typeof StrengthPointSchema>, N.StrengthPoint>
  | AssignableTo<z.infer<typeof WatchPointSchema>, N.WatchPoint>
  | AssignableTo<z.infer<typeof BehavioralDescriptorSchema>, N.BehavioralDescriptor>
  | AssignableTo<z.infer<typeof BlockedSectionReasonSchema>, N.BlockedSectionReason>
  | AssignableTo<z.infer<typeof AdminReportViewSchema>, N.AdminReportView>
  | AssignableTo<z.infer<typeof CandidateReportViewSchema>, N.CandidateReportView>
  | AssignableTo<z.infer<typeof ReportSchema>, N.Report>;

// Reference the guard so it is checked (no runtime cost).
export const __contractGuard: Guard = true;
