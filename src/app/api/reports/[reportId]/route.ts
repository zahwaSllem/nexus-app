// Nexus — GET /api/reports/:reportId  (admin-only)
// Returns a single full report (admin DTO), or 404.
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/guard";
import { toReportDTO } from "@/lib/server/reports";

export async function GET(
  _req: NextRequest,
  { params }: { params: { reportId: string } },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const row = await prisma.report.findUnique({
    where: { report_id: params.reportId },
  });
  if (!row) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json(toReportDTO(row));
}
