// Nexus — GET /api/reports/by-candidate/:candidateId  (admin-only)
// Returns all reports for a candidate (full admin DTOs), newest first. The link is
// resolved through scoring_run → session → candidate_id (no candidate column on
// Report). Empty array if the candidate has no reports.
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/guard";
import { toReportDTO } from "@/lib/server/reports";

export async function GET(
  _req: NextRequest,
  { params }: { params: { candidateId: string } },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const rows = await prisma.report.findMany({
    where: { scoring_run: { session: { candidate_id: params.candidateId } } },
    orderBy: { generated_at: "desc" },
  });

  return NextResponse.json(rows.map(toReportDTO));
}
