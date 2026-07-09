// Nexus — POST /api/reports/generate  (admin-only)
// ─────────────────────────────────────────────────────────────────────────────
// Build an audience-partitioned report from a SCORING RUN.
//
//   • Admin-only. 401/403 enforced.
//   • Loads the scoring run + its session, assignment, role blueprint and candidate
//     for context; 404 if the run is missing, 422 if context can't be assembled.
//   • Derives admin_view (full detail) + candidate_view (candidate-safe) and the
//     section partitioning (visible/blocked/downgraded/hidden) deterministically.
//   • Persists BOTH views on one Report row and writes a `report.generated` audit
//     event in the SAME transaction (fail-closed). One report per scoring run —
//     a second attempt returns 409 with the existing report_id.
//
// GOVERNANCE: this endpoint does NOT generate a PDF/export and does NOT compute
// Domain 6.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/api/guard";
import { GenerateReportRequestSchema, type AdminReportViewDTO } from "@/lib/api/schemas";
import { toScoredResultDTO, RELEASE_STATE_TO_ENUM } from "@/lib/server/scoring";
import {
  buildReportViews,
  toReportDTO,
  REPORT_VERSIONS,
  type ReportContext,
} from "@/lib/server/reports";
import type { Prisma } from "@prisma/client";

const POLICY_VERSION = "1.0.0";

export async function POST(req: NextRequest) {
  const gate = await authorizeAdmin();
  if (!gate.ok) return gate.response;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    raw = {};
  }
  const parsed = GenerateReportRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid report request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { scoring_run_id } = parsed.data;

  const run = await prisma.scoringRun.findUnique({
    where: { scoring_run_id },
    include: { session: true },
  });
  if (!run) {
    return NextResponse.json({ error: "Scoring run not found" }, { status: 404 });
  }

  // One report per scoring run.
  const existing = await prisma.report.findFirst({ where: { scoring_run_id } });
  if (existing) {
    return NextResponse.json(
      { error: "A report already exists for this scoring run.", report_id: existing.report_id },
      { status: 409 },
    );
  }

  // Assemble report context.
  const session = run.session;
  const assignment = await prisma.assignment.findUnique({
    where: { assignment_id: session.assignment_id },
  });
  const [blueprint, candidate] = await Promise.all([
    assignment
      ? prisma.roleBlueprint.findUnique({ where: { blueprint_id: assignment.blueprint_id } })
      : Promise.resolve(null),
    prisma.candidate.findUnique({
      where: { candidate_id: session.candidate_id },
      include: { user: true },
    }),
  ]);
  if (!assignment || !blueprint || !candidate) {
    return NextResponse.json(
      { error: "Cannot generate report: session context is incomplete." },
      { status: 422 },
    );
  }

  const roleContext = blueprint.role_context as { job_level?: AdminReportViewDTO["job_level"] };
  const ctx: ReportContext = {
    candidate_id: session.candidate_id,
    candidate_name: assignment.candidate_name,
    candidate_email: candidate.candidate_email,
    job_title: assignment.job_title ?? candidate.job_title ?? "—",
    job_level: roleContext.job_level ?? "IC",
    organization: candidate.user?.organization ?? "—",
    blueprint_id: assignment.blueprint_id,
    assessment_blueprint_id: session.assessment_blueprint_id,
    use_case: assignment.use_case,
    blueprint_status: blueprint.approval_status,
  };

  const scored = toScoredResultDTO(run);
  const views = buildReportViews(scored, ctx);

  const reportId = `rpt-${Math.random().toString(36).slice(2, 8)}`;

  const [saved] = await prisma.$transaction([
    prisma.report.create({
      data: {
        report_id: reportId,
        scoring_run_id,
        blueprint_id: ctx.blueprint_id,
        assessment_blueprint_id: ctx.assessment_blueprint_id,
        use_case: ctx.use_case,
        policy_version: REPORT_VERSIONS.policy_version,
        scoring_version: REPORT_VERSIONS.scoring_version,
        synthesis_weight_version: REPORT_VERSIONS.synthesis_weight_version,
        release_state: RELEASE_STATE_TO_ENUM[views.release_state],
        visible_sections: views.visible_sections,
        blocked_sections: views.blocked_sections,
        downgraded_dimension_ids: views.downgraded_dimension_ids,
        hidden_dimension_ids: views.hidden_dimension_ids,
        admin_view: views.admin_view as unknown as Prisma.InputJsonValue,
        candidate_view: views.candidate_view as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.auditEvent.create({
      data: {
        actor_user_id: gate.user.user_id,
        actor_role: "admin",
        event_type: "report.generated",
        target_type: "report",
        target_id: reportId,
        payload: {
          scoring_run_id,
          candidate_id: ctx.candidate_id,
          release_state: views.release_state,
          blocked_sections: views.blocked_sections,
          downgraded_dimension_ids: views.downgraded_dimension_ids,
        },
        policy_version: POLICY_VERSION,
      },
    }),
  ]);

  return NextResponse.json(toReportDTO(saved), { status: 201 });
}
