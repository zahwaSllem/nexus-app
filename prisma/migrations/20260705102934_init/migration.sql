-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'candidate');

-- CreateEnum
CREATE TYPE "MethodFamily" AS ENUM ('likert', 'contextual_self_report', 'forced_choice', 'cognitive_multiple_choice', 'sjt');

-- CreateEnum
CREATE TYPE "ResponseScale" AS ENUM ('1-5 Agreement', '1-5 Frequency', 'forced_choice_binary', 'cognitive_mcq', 'sjt_single_best');

-- CreateEnum
CREATE TYPE "BankState" AS ENUM ('production', 'pilot', 'research');

-- CreateEnum
CREATE TYPE "UseStatus" AS ENUM ('operational_allowed', 'operational_allowed_with_restrictions', 'operational_allowed_restricted_by_level', 'operational_blocked');

-- CreateEnum
CREATE TYPE "JobLevelOverlay" AS ENUM ('all_levels', 'professional_plus', 'manager_plus', 'senior_plus');

-- CreateEnum
CREATE TYPE "LoadingType" AS ENUM ('direct', 'adjacent', 'synthesized');

-- CreateEnum
CREATE TYPE "JobLevel" AS ENUM ('IC', 'Professional', 'Manager', 'Senior Manager', 'Director', 'Executive');

-- CreateEnum
CREATE TYPE "JobFamily" AS ENUM ('Strategy', 'Operations', 'Sales', 'Product', 'Engineering', 'People', 'Finance', 'Risk', 'General Management', 'Other');

-- CreateEnum
CREATE TYPE "UseCase" AS ENUM ('developmental', 'hiring_support_validated_blueprint');

-- CreateEnum
CREATE TYPE "BlueprintApprovalStatus" AS ENUM ('draft', 'reviewed', 'approved', 'validated');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('not_started', 'in_progress', 'completed', 'expired');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('not_sent', 'sent', 'opened');

-- CreateEnum
CREATE TYPE "SessionState" AS ENUM ('created', 'in_progress', 'submitted', 'scored', 'expired');

-- CreateEnum
CREATE TYPE "ValidityState" AS ENUM ('VALID', 'PASS_WITH_LIMITS', 'VALID_BUT_UNINTERPRETABLE', 'INCOMPLETE', 'INVALID');

-- CreateEnum
CREATE TYPE "ReleaseState" AS ENUM ('Released', 'Released with Caution', 'Partial Release', 'Blocked output section', 'Assessment incomplete', 'Invalid for interpretation');

-- CreateEnum
CREATE TYPE "AgentConversationStatus" AS ENUM ('in_progress', 'completed');

-- CreateEnum
CREATE TYPE "ReportAudience" AS ENUM ('admin', 'candidate');

-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role_type" "Role" NOT NULL,
    "display_name" TEXT,
    "organization" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "candidate_id" TEXT NOT NULL,
    "user_id" TEXT,
    "candidate_name" TEXT NOT NULL,
    "candidate_email" TEXT NOT NULL,
    "job_title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("candidate_id")
);

-- CreateTable
CREATE TABLE "question_bank_items" (
    "item_id" TEXT NOT NULL,
    "bank_version" TEXT NOT NULL DEFAULT 'final',
    "domain_id" TEXT NOT NULL,
    "domain_name" TEXT NOT NULL,
    "dimension_id" TEXT NOT NULL,
    "dimension_name" TEXT NOT NULL,
    "facet_id" TEXT NOT NULL,
    "facet_name" TEXT NOT NULL,
    "method_family" "MethodFamily" NOT NULL,
    "item_format" TEXT NOT NULL,
    "item_text" TEXT NOT NULL,
    "option_a" TEXT,
    "option_b" TEXT,
    "option_c" TEXT,
    "option_d" TEXT,
    "option_e" TEXT,
    "keyed_answer" TEXT,
    "response_scale" "ResponseScale" NOT NULL,
    "primary_domain_id" TEXT NOT NULL,
    "primary_dimension_id" TEXT NOT NULL,
    "primary_facet_id" TEXT NOT NULL,
    "secondary_dimension_ids" TEXT,
    "loading_type" "LoadingType" NOT NULL,
    "intended_meaning" TEXT NOT NULL,
    "prohibited_overlap" TEXT,
    "bank_state" "BankState" NOT NULL,
    "use_status" "UseStatus" NOT NULL,
    "validation_track" TEXT NOT NULL,
    "job_level_overlay" "JobLevelOverlay" NOT NULL,
    "reverse_scored" BOOLEAN NOT NULL,

    CONSTRAINT "question_bank_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "role_blueprints" (
    "blueprint_id" TEXT NOT NULL,
    "role_context" JSONB NOT NULL,
    "context_profile" JSONB NOT NULL,
    "included_domains" TEXT[],
    "selected_dimensions" JSONB NOT NULL,
    "governance_warnings" JSONB NOT NULL,
    "approval_status" "BlueprintApprovalStatus" NOT NULL DEFAULT 'draft',
    "blueprint_quality" JSONB NOT NULL,
    "agent_conversation_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,

    CONSTRAINT "role_blueprints_pkey" PRIMARY KEY ("blueprint_id")
);

-- CreateTable
CREATE TABLE "assessment_blueprints" (
    "assessment_blueprint_id" TEXT NOT NULL,
    "role_blueprint_id" TEXT NOT NULL,
    "total_items" INTEGER NOT NULL,
    "estimated_duration_min" INTEGER NOT NULL,
    "method_mix" JSONB NOT NULL,
    "domain_coverage" JSONB NOT NULL,
    "agent_selection_rationale" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_blueprints_pkey" PRIMARY KEY ("assessment_blueprint_id")
);

-- CreateTable
CREATE TABLE "contextualized_items" (
    "id" TEXT NOT NULL,
    "assessment_blueprint_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "original_text" TEXT NOT NULL,
    "contextualized_text" TEXT NOT NULL,
    "contextualization_rationale" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL,

    CONSTRAINT "contextualized_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "assignment_id" TEXT NOT NULL,
    "blueprint_id" TEXT NOT NULL,
    "assessment_blueprint_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "candidate_name" TEXT NOT NULL,
    "candidate_email" TEXT NOT NULL,
    "job_title" TEXT,
    "use_case" "UseCase" NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'not_started',
    "consent_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "consent_date" TIMESTAMP(3),
    "deadline" TIMESTAMP(3) NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by" TEXT NOT NULL,
    "session_id" TEXT,
    "completed_at" TIMESTAMP(3),
    "invitation_link" TEXT,
    "invitation_status" "InvitationStatus",

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("assignment_id")
);

-- CreateTable
CREATE TABLE "assessment_sessions" (
    "session_id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "assessment_blueprint_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "state" "SessionState" NOT NULL DEFAULT 'created',
    "started_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "current_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "assessment_sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "responses" (
    "response_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "method_family" "MethodFamily" NOT NULL,
    "value" INTEGER,
    "selected_option" TEXT,
    "latency_ms" INTEGER NOT NULL,
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "responses_pkey" PRIMARY KEY ("response_id")
);

-- CreateTable
CREATE TABLE "scoring_runs" (
    "scoring_run_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "bank_version" TEXT NOT NULL DEFAULT 'final',
    "norm_version" TEXT NOT NULL DEFAULT 'provisional',
    "scoring_version" TEXT NOT NULL DEFAULT '1.0.0-provisional',
    "synthesis_weight_version" TEXT NOT NULL DEFAULT '1.0.0-provisional',
    "validity_state" "ValidityState" NOT NULL,
    "release_state" "ReleaseState" NOT NULL,
    "domain_scores" JSONB NOT NULL,
    "qc_flags" JSONB NOT NULL,
    "completion_ratio" DOUBLE PRECISION NOT NULL,
    "scored_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scoring_runs_pkey" PRIMARY KEY ("scoring_run_id")
);

-- CreateTable
CREATE TABLE "reports" (
    "report_id" TEXT NOT NULL,
    "scoring_run_id" TEXT NOT NULL,
    "blueprint_id" TEXT NOT NULL,
    "assessment_blueprint_id" TEXT NOT NULL,
    "use_case" "UseCase" NOT NULL,
    "policy_version" TEXT NOT NULL DEFAULT '1.0.0',
    "scoring_version" TEXT NOT NULL DEFAULT '1.0.0-provisional',
    "synthesis_weight_version" TEXT NOT NULL DEFAULT '1.0.0-provisional',
    "release_state" "ReleaseState" NOT NULL,
    "visible_sections" TEXT[],
    "blocked_sections" TEXT[],
    "downgraded_dimension_ids" TEXT[],
    "hidden_dimension_ids" TEXT[],
    "admin_view" JSONB NOT NULL,
    "candidate_view" JSONB NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("report_id")
);

-- CreateTable
CREATE TABLE "report_exports" (
    "export_id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "audience" "ReportAudience" NOT NULL,
    "storage_url" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "policy_version" TEXT NOT NULL DEFAULT '1.0.0',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generated_by" TEXT NOT NULL,

    CONSTRAINT "report_exports_pkey" PRIMARY KEY ("export_id")
);

-- CreateTable
CREATE TABLE "agent_conversations" (
    "agent_conversation_id" TEXT NOT NULL,
    "admin_user_id" TEXT NOT NULL,
    "status" "AgentConversationStatus" NOT NULL DEFAULT 'in_progress',
    "turns" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "agent_conversations_pkey" PRIMARY KEY ("agent_conversation_id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "event_id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "actor_role" "Role",
    "event_type" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "policy_version" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_user_id_key" ON "candidates"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_candidate_email_key" ON "candidates"("candidate_email");

-- CreateIndex
CREATE INDEX "question_bank_items_domain_id_idx" ON "question_bank_items"("domain_id");

-- CreateIndex
CREATE INDEX "question_bank_items_dimension_id_idx" ON "question_bank_items"("dimension_id");

-- CreateIndex
CREATE INDEX "question_bank_items_method_family_idx" ON "question_bank_items"("method_family");

-- CreateIndex
CREATE INDEX "question_bank_items_use_status_idx" ON "question_bank_items"("use_status");

-- CreateIndex
CREATE INDEX "role_blueprints_approval_status_idx" ON "role_blueprints"("approval_status");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_blueprints_role_blueprint_id_key" ON "assessment_blueprints"("role_blueprint_id");

-- CreateIndex
CREATE INDEX "contextualized_items_assessment_blueprint_id_idx" ON "contextualized_items"("assessment_blueprint_id");

-- CreateIndex
CREATE UNIQUE INDEX "contextualized_items_assessment_blueprint_id_item_id_key" ON "contextualized_items"("assessment_blueprint_id", "item_id");

-- CreateIndex
CREATE UNIQUE INDEX "assignments_session_id_key" ON "assignments"("session_id");

-- CreateIndex
CREATE INDEX "assignments_candidate_id_idx" ON "assignments"("candidate_id");

-- CreateIndex
CREATE INDEX "assignments_status_idx" ON "assignments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_sessions_assignment_id_key" ON "assessment_sessions"("assignment_id");

-- CreateIndex
CREATE INDEX "assessment_sessions_candidate_id_idx" ON "assessment_sessions"("candidate_id");

-- CreateIndex
CREATE INDEX "responses_session_id_idx" ON "responses"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "responses_session_id_item_id_key" ON "responses"("session_id", "item_id");

-- CreateIndex
CREATE INDEX "scoring_runs_session_id_idx" ON "scoring_runs"("session_id");

-- CreateIndex
CREATE INDEX "reports_scoring_run_id_idx" ON "reports"("scoring_run_id");

-- CreateIndex
CREATE INDEX "report_exports_report_id_idx" ON "report_exports"("report_id");

-- CreateIndex
CREATE INDEX "agent_conversations_admin_user_id_idx" ON "agent_conversations"("admin_user_id");

-- CreateIndex
CREATE INDEX "audit_events_target_type_target_id_idx" ON "audit_events"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "audit_events_event_type_idx" ON "audit_events"("event_type");

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_blueprints" ADD CONSTRAINT "role_blueprints_agent_conversation_id_fkey" FOREIGN KEY ("agent_conversation_id") REFERENCES "agent_conversations"("agent_conversation_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_blueprints" ADD CONSTRAINT "assessment_blueprints_role_blueprint_id_fkey" FOREIGN KEY ("role_blueprint_id") REFERENCES "role_blueprints"("blueprint_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contextualized_items" ADD CONSTRAINT "contextualized_items_assessment_blueprint_id_fkey" FOREIGN KEY ("assessment_blueprint_id") REFERENCES "assessment_blueprints"("assessment_blueprint_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contextualized_items" ADD CONSTRAINT "contextualized_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "question_bank_items"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_blueprint_id_fkey" FOREIGN KEY ("blueprint_id") REFERENCES "role_blueprints"("blueprint_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_assessment_blueprint_id_fkey" FOREIGN KEY ("assessment_blueprint_id") REFERENCES "assessment_blueprints"("assessment_blueprint_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("candidate_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "assessment_sessions"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_sessions" ADD CONSTRAINT "assessment_sessions_assessment_blueprint_id_fkey" FOREIGN KEY ("assessment_blueprint_id") REFERENCES "assessment_blueprints"("assessment_blueprint_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_sessions" ADD CONSTRAINT "assessment_sessions_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("candidate_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "assessment_sessions"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "question_bank_items"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scoring_runs" ADD CONSTRAINT "scoring_runs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "assessment_sessions"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_scoring_run_id_fkey" FOREIGN KEY ("scoring_run_id") REFERENCES "scoring_runs"("scoring_run_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_blueprint_id_fkey" FOREIGN KEY ("blueprint_id") REFERENCES "role_blueprints"("blueprint_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_assessment_blueprint_id_fkey" FOREIGN KEY ("assessment_blueprint_id") REFERENCES "assessment_blueprints"("assessment_blueprint_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_exports" ADD CONSTRAINT "report_exports_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("report_id") ON DELETE RESTRICT ON UPDATE CASCADE;
