// Nexus — GET /api/reports  (admin-only)
// Lists all reports (full admin DTOs). Optional ?scoring_run_id / ?blueprint_id
// filters (ANDed). Candidates never reach this — admin_view is included.
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/guard";
import { toReportDTO } from "@/lib/server/reports";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const sp = req.nextUrl.searchParams;
  const where: Prisma.ReportWhereInput = {};
  const scoringRunId = sp.get("scoring_run_id");
  const blueprintId = sp.get("blueprint_id");
  if (scoringRunId) where.scoring_run_id = scoringRunId;
  if (blueprintId) where.blueprint_id = blueprintId;

  const rows = await prisma.report.findMany({
    where,
    orderBy: { generated_at: "desc" },
  });

  return NextResponse.json(rows.map(toReportDTO));
}
