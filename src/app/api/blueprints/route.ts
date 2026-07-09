// Nexus — GET /api/blueprints  (admin-only, read-only)
// Lists role blueprints. Optional ?approved=true → only approved|validated
// (mirrors mock getApprovedBlueprints). Candidates are blocked.
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/guard";
import { toRoleBlueprintDTO } from "@/lib/server/blueprints";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const approvedOnly = req.nextUrl.searchParams.get("approved") === "true";

  const rows = await prisma.roleBlueprint.findMany({
    where: approvedOnly
      ? { approval_status: { in: ["approved", "validated"] } }
      : {},
    orderBy: { blueprint_id: "asc" },
  });

  return NextResponse.json(rows.map(toRoleBlueprintDTO));
}
