// Nexus — POST /api/sessions/start  (candidate-only)
// ─────────────────────────────────────────────────────────────────────────────
// Begin an assessment session for ONE of the candidate's own assignments.
//
//   • Validates the assignment exists and belongs to THIS candidate (else 404/403).
//   • Validates the assignment status allows starting (not completed/expired).
//   • Prevents duplicate sessions — assignment_id is unique per session; if one
//     already exists this returns 409 with the existing session_id (resume via GET).
//   • Creates the session (state=in_progress, started_at=now), flips the assignment
//     to in_progress and links session_id, and writes a `session.started` audit
//     event — all in ONE transaction (fail-closed).
//
// This endpoint never scores, never generates a report, and never mutates
// question-bank metadata.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeCandidate } from "@/lib/api/guard";
import { StartSessionRequestSchema } from "@/lib/api/schemas";
import { makeSessionId, toSessionMetadataDTO } from "@/lib/server/sessions";
import type { AssessmentSession } from "@prisma/client";

const POLICY_VERSION = "1.0.0";

export async function POST(req: NextRequest) {
  const gate = await authorizeCandidate();
  if (!gate.ok) return gate.response;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    raw = {};
  }
  const parsed = StartSessionRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid start-session request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { assignment_id } = parsed.data;

  const assignment = await prisma.assignment.findUnique({
    where: { assignment_id },
  });
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }
  // Candidate may only start their OWN assignment.
  if (assignment.candidate_id !== gate.candidate.candidate_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Status must allow starting.
  if (assignment.status === "completed" || assignment.status === "expired") {
    return NextResponse.json(
      { error: `Cannot start: assignment is ${assignment.status}.` },
      { status: 409 },
    );
  }

  // Prevent duplicate sessions (assignment_id is unique per session).
  const existing = await prisma.assessmentSession.findUnique({
    where: { assignment_id },
  });
  if (existing) {
    return NextResponse.json(
      {
        error: "A session already exists for this assignment.",
        session_id: existing.session_id,
        state: existing.state,
      },
      { status: 409 },
    );
  }

  const totalItems = await prisma.contextualizedItem.count({
    where: { assessment_blueprint_id: assignment.assessment_blueprint_id },
  });

  const sessionId = makeSessionId();
  const now = new Date();

  const [session] = await prisma.$transaction([
    prisma.assessmentSession.create({
      data: {
        session_id: sessionId,
        assignment_id,
        assessment_blueprint_id: assignment.assessment_blueprint_id,
        candidate_id: gate.candidate.candidate_id,
        state: "in_progress",
        started_at: now,
      },
    }),
    prisma.assignment.update({
      where: { assignment_id },
      data: { status: "in_progress", session_id: sessionId },
    }),
    prisma.auditEvent.create({
      data: {
        actor_user_id: gate.user.user_id,
        actor_role: "candidate",
        event_type: "session.started",
        target_type: "assessment_session",
        target_id: sessionId,
        payload: { assignment_id, assessment_blueprint_id: assignment.assessment_blueprint_id },
        policy_version: POLICY_VERSION,
      },
    }),
  ]);

  return NextResponse.json(
    toSessionMetadataDTO(session as AssessmentSession, totalItems, 0),
    { status: 201 },
  );
}
