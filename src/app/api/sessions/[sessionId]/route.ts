// Nexus — GET /api/sessions/:sessionId  (candidate-only, own session)
// ─────────────────────────────────────────────────────────────────────────────
// Returns session METADATA only — no items, no scoring data, no keyed answers.
// 404 if the session doesn't exist; 403 if it isn't the caller's own session.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeCandidate } from "@/lib/api/guard";
import { toSessionMetadataDTO } from "@/lib/server/sessions";

export async function GET(
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

  const [totalItems, answeredCount] = await prisma.$transaction([
    prisma.contextualizedItem.count({
      where: { assessment_blueprint_id: session.assessment_blueprint_id },
    }),
    prisma.response.count({ where: { session_id: session.session_id } }),
  ]);

  return NextResponse.json(
    toSessionMetadataDTO(session, totalItems, answeredCount),
  );
}
