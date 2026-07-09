// Nexus — POST /api/sessions/:sessionId/submit  (candidate-only, own session)
// ─────────────────────────────────────────────────────────────────────────────
// Finalize a session.
//
//   • Must not already be submitted/scored (409) or expired (409).
//   • ALL mandatory questions must be answered — every blueprint item must have a
//     saved response, else 422 with the missing item ids.
//   • Sets state=submitted + submitted_at (locking further answer writes), flips
//     the assignment to completed + completed_at, and writes a `session.submitted`
//     audit event — all in ONE transaction (fail-closed).
//
// GOVERNANCE: this endpoint DOES NOT score, generate reports, trigger PDFs, or
// start any scoring job. It only records submission.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeCandidate } from "@/lib/api/guard";
import { toSessionMetadataDTO } from "@/lib/server/sessions";
import type { AssessmentSession } from "@prisma/client";

const POLICY_VERSION = "1.0.0";

export async function POST(
  _req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  const gate = await authorizeCandidate();
  if (!gate.ok) return gate.response;

  const session = await prisma.assessmentSession.findUnique({
    where: { session_id: params.sessionId },
  });
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.candidate_id !== gate.candidate.candidate_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.state === "submitted" || session.state === "scored") {
    return NextResponse.json({ error: "Session already submitted." }, { status: 409 });
  }
  if (session.state === "expired") {
    return NextResponse.json({ error: "Session is expired." }, { status: 409 });
  }

  // Completeness: every blueprint item must have a saved response.
  const [items, answered] = await prisma.$transaction([
    prisma.contextualizedItem.findMany({
      where: { assessment_blueprint_id: session.assessment_blueprint_id },
      select: { item_id: true },
    }),
    prisma.response.findMany({
      where: { session_id: session.session_id },
      select: { item_id: true },
    }),
  ]);
  const answeredSet = new Set(answered.map((r) => r.item_id));
  const missing = items.map((i) => i.item_id).filter((id) => !answeredSet.has(id));
  if (missing.length > 0) {
    return NextResponse.json(
      {
        error: "All questions must be answered before submitting.",
        total_items: items.length,
        answered_count: answeredSet.size,
        missing_count: missing.length,
        missing_item_ids: missing,
      },
      { status: 422 },
    );
  }

  const now = new Date();
  const [updated] = await prisma.$transaction([
    prisma.assessmentSession.update({
      where: { session_id: session.session_id },
      data: { state: "submitted", submitted_at: now },
    }),
    prisma.assignment.update({
      where: { assignment_id: session.assignment_id },
      data: { status: "completed", completed_at: now },
    }),
    prisma.auditEvent.create({
      data: {
        actor_user_id: gate.user.user_id,
        actor_role: "candidate",
        event_type: "session.submitted",
        target_type: "assessment_session",
        target_id: session.session_id,
        payload: {
          assignment_id: session.assignment_id,
          total_items: items.length,
        },
        policy_version: POLICY_VERSION,
      },
    }),
  ]);

  return NextResponse.json(
    toSessionMetadataDTO(updated as AssessmentSession, items.length, answeredSet.size),
  );
}
