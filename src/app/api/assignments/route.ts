// Nexus — /api/assignments  (admin-only)
// ─────────────────────────────────────────────────────────────────────────────
//  GET  — list assignments with optional filters (status, blueprint_id,
//         candidate_email) + pagination (page, page_size). Returns a paginated
//         envelope: { data: AssessmentAssignment[], pagination }.
//  POST — create ONE assignment. Validates the role + assessment blueprint exist
//         (and match), reuses an existing candidate by email or creates one,
//         generates an invitation_link, sets invitation_status=not_sent and
//         status=not_started, and writes an `assignment.created` audit event in
//         the SAME transaction (fail-closed: audit failure rolls back the create).
//
//  This endpoint never starts a session, never sends email, and never mutates
//  question-bank metadata.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, authorizeAdmin } from "@/lib/api/guard";
import {
  AssignmentQuerySchema,
  CreateAssignmentRequestSchema,
} from "@/lib/api/schemas";
import type { Prisma, Assignment } from "@prisma/client";
import {
  toAssignmentDTO,
  makeAssignmentId,
  makeCandidateId,
  makeInvitationLink,
  normalizeEmail,
} from "@/lib/server/assignments";

const POLICY_VERSION = "1.0.0";

// ─── GET /api/assignments ────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const sp = req.nextUrl.searchParams;
  const parsed = AssignmentQuerySchema.safeParse({
    status: sp.get("status") ?? undefined,
    blueprint_id: sp.get("blueprint_id") ?? undefined,
    candidate_email: sp.get("candidate_email") ?? undefined,
    page: sp.get("page") ?? undefined,
    page_size: sp.get("page_size") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { status, blueprint_id, candidate_email, page, page_size } = parsed.data;

  const where: Prisma.AssignmentWhereInput = {};
  if (status) where.status = status;
  if (blueprint_id) where.blueprint_id = blueprint_id;
  if (candidate_email) where.candidate_email = normalizeEmail(candidate_email);

  const [total, rows] = await prisma.$transaction([
    prisma.assignment.count({ where }),
    prisma.assignment.findMany({
      where,
      orderBy: { assigned_at: "desc" },
      skip: (page - 1) * page_size,
      take: page_size,
    }),
  ]);

  return NextResponse.json({
    data: rows.map(toAssignmentDTO),
    pagination: {
      page,
      page_size,
      total,
      total_pages: Math.max(1, Math.ceil(total / page_size)),
    },
  });
}

// ─── POST /api/assignments ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const gate = await authorizeAdmin();
  if (!gate.ok) return gate.response;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    raw = {};
  }
  const parsed = CreateAssignmentRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid assignment request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const {
    blueprintId,
    assessmentBlueprintId,
    candidateName,
    candidateEmail,
    deadline,
    useCase,
    jobTitle,
  } = parsed.data;

  // Deadline must be a real date.
  const deadlineDate = new Date(deadline);
  if (Number.isNaN(deadlineDate.getTime())) {
    return NextResponse.json(
      { error: "Invalid deadline: expected an ISO date string." },
      { status: 400 },
    );
  }

  // Blueprint + assessment blueprint must exist and be a matching pair.
  const [blueprint, assessmentBlueprint] = await Promise.all([
    prisma.roleBlueprint.findUnique({ where: { blueprint_id: blueprintId } }),
    prisma.assessmentBlueprint.findUnique({
      where: { assessment_blueprint_id: assessmentBlueprintId },
    }),
  ]);
  if (!blueprint) {
    return NextResponse.json({ error: "Role blueprint not found" }, { status: 400 });
  }
  if (!assessmentBlueprint) {
    return NextResponse.json({ error: "Assessment blueprint not found" }, { status: 400 });
  }
  if (assessmentBlueprint.role_blueprint_id !== blueprintId) {
    return NextResponse.json(
      { error: "Assessment blueprint does not belong to the specified role blueprint." },
      { status: 400 },
    );
  }

  // Reuse an existing candidate by email, else create one.
  const email = normalizeEmail(candidateEmail);
  const name = candidateName.trim();
  const title = jobTitle?.trim() || undefined;
  const existingCandidate = await prisma.candidate.findUnique({
    where: { candidate_email: email },
  });
  const candidateId = existingCandidate?.candidate_id ?? makeCandidateId();

  const assignmentId = makeAssignmentId();
  const invitationLink = makeInvitationLink(assignmentId);

  const ops: Prisma.PrismaPromise<unknown>[] = [];
  if (!existingCandidate) {
    ops.push(
      prisma.candidate.create({
        data: {
          candidate_id: candidateId,
          candidate_name: name,
          candidate_email: email,
          job_title: title,
        },
      }),
    );
  }
  ops.push(
    prisma.assignment.create({
      data: {
        assignment_id: assignmentId,
        blueprint_id: blueprintId,
        assessment_blueprint_id: assessmentBlueprintId,
        candidate_id: candidateId,
        candidate_name: name,
        candidate_email: email,
        job_title: title,
        use_case: useCase,
        status: "not_started",
        consent_confirmed: false,
        deadline: deadlineDate,
        assigned_by: gate.user.email ?? "unknown",
        invitation_link: invitationLink,
        invitation_status: "not_sent",
      },
    }),
  );
  ops.push(
    prisma.auditEvent.create({
      data: {
        actor_user_id: gate.user.user_id,
        actor_role: "admin",
        event_type: "assignment.created",
        target_type: "assignment",
        target_id: assignmentId,
        payload: {
          blueprint_id: blueprintId,
          assessment_blueprint_id: assessmentBlueprintId,
          candidate_id: candidateId,
          candidate_email: email,
          reused_candidate: Boolean(existingCandidate),
        },
        policy_version: POLICY_VERSION,
      },
    }),
  );

  // Create + audit atomically (fail-closed).
  const results = await prisma.$transaction(ops);
  const created = results[existingCandidate ? 0 : 1] as Assignment;

  return NextResponse.json(toAssignmentDTO(created), { status: 201 });
}
