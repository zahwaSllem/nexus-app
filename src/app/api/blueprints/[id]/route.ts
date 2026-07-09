// Nexus — GET /api/blueprints/:id  (admin-only, read-only)
// Returns a single role blueprint (RoleBlueprintSchema), or 404.
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/guard";
import { toRoleBlueprintDTO } from "@/lib/server/blueprints";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const row = await prisma.roleBlueprint.findUnique({
    where: { blueprint_id: params.id },
  });
  if (!row) {
    return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
  }

  return NextResponse.json(toRoleBlueprintDTO(row));
}
