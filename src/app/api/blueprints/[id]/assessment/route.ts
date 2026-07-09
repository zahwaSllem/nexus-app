// Nexus — GET /api/blueprints/:id/assessment  (admin-only, read-only)
// Returns the AssessmentBlueprint (with contextualized items) for a role blueprint.
// The :id is the ROLE blueprint id (role_blueprint_id is unique per assessment BP).
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/guard";
import { toAssessmentBlueprintDTO } from "@/lib/server/blueprints";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const abp = await prisma.assessmentBlueprint.findUnique({
    where: { role_blueprint_id: params.id },
    include: { contextualized_items: true },
  });
  if (!abp) {
    return NextResponse.json(
      { error: "Assessment blueprint not found for this role blueprint" },
      { status: 404 },
    );
  }

  return NextResponse.json(
    toAssessmentBlueprintDTO(abp, abp.contextualized_items),
  );
}
