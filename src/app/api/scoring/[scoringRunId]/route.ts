// Nexus — GET /api/scoring/:scoringRunId  (admin-only)
// ─────────────────────────────────────────────────────────────────────────────
// Returns a scoring run (ScoredResult DTO), or 404. ADMIN-ONLY — the payload
// carries raw domain/dimension scores + qc_flags, which candidates must never see.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/guard";
import { toScoredResultDTO } from "@/lib/server/scoring";

export async function GET(
  _req: NextRequest,
  { params }: { params: { scoringRunId: string } },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const run = await prisma.scoringRun.findUnique({
    where: { scoring_run_id: params.scoringRunId },
  });
  if (!run) {
    return NextResponse.json({ error: "Scoring run not found" }, { status: 404 });
  }

  return NextResponse.json(toScoredResultDTO(run));
}
