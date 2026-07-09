// Nexus — GET /api/sessions/:sessionId/scoring  (admin-only)
// ─────────────────────────────────────────────────────────────────────────────
// Returns the scoring run for a session (ScoredResult DTO), or 404 if the session
// has not been scored. ADMIN-ONLY — raw scores + qc_flags are never candidate-safe.
//
// NOTE: the sibling session endpoints (metadata/questions/answers/submit) are
// candidate-only; THIS one is admin-only because it exposes raw scoring detail.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/guard";
import { toScoredResultDTO } from "@/lib/server/scoring";

export async function GET(
  _req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const session = await prisma.assessmentSession.findUnique({
    where: { session_id: params.sessionId },
    select: { session_id: true },
  });
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const run = await prisma.scoringRun.findFirst({
    where: { session_id: params.sessionId },
    orderBy: { scored_at: "desc" },
  });
  if (!run) {
    return NextResponse.json(
      { error: "No scoring run for this session" },
      { status: 404 },
    );
  }

  return NextResponse.json(toScoredResultDTO(run));
}
