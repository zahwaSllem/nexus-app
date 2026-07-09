// Nexus — GET /api/sessions/:sessionId/questions  (candidate-only, own session)
// ─────────────────────────────────────────────────────────────────────────────
// Returns the CANDIDATE-SAFE questions for the session, in blueprint order.
// Each item is built from the ContextualizedItem (wording) + its QuestionBankItem
// (method_family / response_scale / options). Governance-sensitive fields —
// keyed_answer, reverse_scored, intended_meaning and all scoring metadata — are
// NEVER included (see toSessionItemDTO). Order is preserved by display_order.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeCandidate } from "@/lib/api/guard";
import { toSessionItemDTO } from "@/lib/server/sessions";

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

  const items = await prisma.contextualizedItem.findMany({
    where: { assessment_blueprint_id: session.assessment_blueprint_id },
    include: { bank_item: true },
    orderBy: { display_order: "asc" },
  });

  return NextResponse.json(items.map((ci) => toSessionItemDTO(ci, ci.bank_item)));
}
