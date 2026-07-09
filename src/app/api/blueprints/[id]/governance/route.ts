// Nexus — GET /api/blueprints/:id/governance  (admin-only, read-only)
// Returns the GovernanceWarning[] stored on the role blueprint, or 404.
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/guard";
import { parseGovernanceWarnings } from "@/lib/server/blueprints";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const row = await prisma.roleBlueprint.findUnique({
    where: { blueprint_id: params.id },
    select: { governance_warnings: true },
  });
  if (!row) {
    return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
  }

  return NextResponse.json(parseGovernanceWarnings(row.governance_warnings));
}
