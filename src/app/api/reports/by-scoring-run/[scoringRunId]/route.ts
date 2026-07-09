// Nexus — GET /api/reports/by-scoring-run/:scoringRunId  (admin-only)
// Returns the report for a scoring run (full admin DTO), or 404. One report per run.
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/guard";
import { toReportDTO } from "@/lib/server/reports";

export async function GET(
  _req: NextRequest,
  { params }: { params: { scoringRunId: string } },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const row = await prisma.report.findFirst({
    where: { scoring_run_id: params.scoringRunId },
    orderBy: { generated_at: "desc" },
  });
  if (!row) {
    return NextResponse.json(
      { error: "No report for this scoring run" },
      { status: 404 },
    );
  }

  return NextResponse.json(toReportDTO(row));
}
