// Nexus — POST /api/assignments/bulk  (admin-only)
// ─────────────────────────────────────────────────────────────────────────────
// Create many assignments in one atomic transaction.
//
//   • Shared fields (blueprintId, assessmentBlueprintId, deadline, useCase,
//     includedDomains) are validated once; the role + assessment blueprint must
//     exist and be a matching pair, or the whole request is rejected (400).
//   • Each candidate ROW is validated INDIVIDUALLY (BulkCandidateInputSchema):
//       – malformed rows are rejected (reason: "invalid_row"),
//       – duplicate emails WITHIN the batch are rejected (reason:
//         "duplicate_email_in_batch") — the first occurrence wins.
//   • Existing candidates are reused by email; otherwise a candidate is created.
//   • Assignments + candidate creates + one `assignment.created` audit event per
//     row are written in a SINGLE transaction (fail-closed).
//   • Returns { created: CreatedAssignmentRecord[], rejected: [...] }.
//
// This endpoint never starts a session, never sends email, and never mutates
// question-bank metadata.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/api/guard";
import {
  CreateBulkAssignmentRequestSchema,
  BulkCandidateInputSchema,
} from "@/lib/api/schemas";
import type { Prisma } from "@prisma/client";
import {
  makeAssignmentId,
  makeCandidateId,
  makeInvitationLink,
  normalizeEmail,
} from "@/lib/server/assignments";
import {
  CreatedAssignmentRecordSchema,
  type CreatedAssignmentRecord,
} from "@/lib/api/schemas";

const POLICY_VERSION = "1.0.0";

type RejectedRow = { index: number; email?: string; reason: string };

export async function POST(req: NextRequest) {
  const gate = await authorizeAdmin();
  if (!gate.ok) return gate.response;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    raw = {};
  }

  // Validate the shared envelope (everything except the per-row candidates list),
  // so one malformed candidate row can't 400 the entire batch.
  const shared = CreateBulkAssignmentRequestSchema.omit({
    candidates: true,
  }).safeParse(raw);
  if (!shared.success) {
    return NextResponse.json(
      { error: "Invalid bulk request", issues: shared.error.issues },
      { status: 400 },
    );
  }

  const rows =
    raw && typeof raw === "object" && Array.isArray((raw as Record<string, unknown>).candidates)
      ? ((raw as Record<string, unknown>).candidates as unknown[])
      : null;
  if (!rows || rows.length === 0) {
    return NextResponse.json(
      { error: "candidates must be a non-empty array." },
      { status: 400 },
    );
  }

  const { blueprintId, assessmentBlueprintId, deadline, useCase } = shared.data;

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

  // ─── Per-row validation + in-batch duplicate detection ───────────────────────
  const rejected: RejectedRow[] = [];
  const valid: { index: number; name: string; email: string; title?: string }[] = [];
  const seenEmails = new Set<string>();

  rows.forEach((row, index) => {
    const parsed = BulkCandidateInputSchema.safeParse(row);
    if (!parsed.success) {
      const maybeEmail =
        row && typeof row === "object" && typeof (row as Record<string, unknown>).email === "string"
          ? ((row as Record<string, unknown>).email as string)
          : undefined;
      rejected.push({ index, email: maybeEmail, reason: "invalid_row" });
      return;
    }
    const email = normalizeEmail(parsed.data.email);
    if (seenEmails.has(email)) {
      rejected.push({ index, email, reason: "duplicate_email_in_batch" });
      return;
    }
    seenEmails.add(email);
    valid.push({
      index,
      name: parsed.data.name.trim(),
      email,
      title: parsed.data.jobTitle?.trim() || undefined,
    });
  });

  if (valid.length === 0) {
    // Nothing to create — report the rejections (no writes, no audit).
    return NextResponse.json({ created: [], rejected }, { status: 201 });
  }

  // ─── Reuse existing candidates by email ──────────────────────────────────────
  const existing = await prisma.candidate.findMany({
    where: { candidate_email: { in: valid.map((v) => v.email) } },
    select: { candidate_id: true, candidate_email: true },
  });
  const existingByEmail = new Map(existing.map((c) => [c.candidate_email, c.candidate_id]));

  // ─── Build the ops + the created records (candidate_id is app-generated, so
  //     candidate + assignment can share one transaction without a round-trip). ──
  const ops: Prisma.PrismaPromise<unknown>[] = [];
  const created: CreatedAssignmentRecord[] = [];

  for (const v of valid) {
    const candidateId = existingByEmail.get(v.email) ?? makeCandidateId();
    const isNew = !existingByEmail.has(v.email);
    const assignmentId = makeAssignmentId();
    const invitationLink = makeInvitationLink(assignmentId);

    if (isNew) {
      // Reserve the id so two rows with the same NEW email can't both create it
      // (already deduped above, but keep the map authoritative).
      existingByEmail.set(v.email, candidateId);
      ops.push(
        prisma.candidate.create({
          data: {
            candidate_id: candidateId,
            candidate_name: v.name,
            candidate_email: v.email,
            job_title: v.title,
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
          candidate_name: v.name,
          candidate_email: v.email,
          job_title: v.title,
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
    created.push(
      CreatedAssignmentRecordSchema.parse({
        assignmentId,
        candidateId,
        candidateName: v.name,
        candidateEmail: v.email,
        jobTitle: v.title,
        invitationLink,
        invitationStatus: "not_sent",
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
            candidate_email: v.email,
            reused_candidate: !isNew,
            bulk: true,
          },
          policy_version: POLICY_VERSION,
        },
      }),
    );
  }

  // All creates + audits atomically (fail-closed).
  await prisma.$transaction(ops);

  return NextResponse.json({ created, rejected }, { status: 201 });
}
