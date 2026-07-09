// Nexus — GET /api/exports/:exportId  (admin OR candidate)
// ─────────────────────────────────────────────────────────────────────────────
// Returns an export's status + provisional reference.
//
//   • Admin: may read any export.
//   • Candidate: may read ONLY a candidate-audience export of THEIR OWN report.
//     An admin-audience export, or another candidate's export, is 403.
//
// 401 unauthenticated · 403 wrong role/ownership · 404 not found.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { resolveCandidateId } from "@/lib/api/guard";
import { toExportStatusDTO } from "@/lib/server/exports";

export async function GET(
  _req: NextRequest,
  { params }: { params: { exportId: string } },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  const user = session.user;

  const row = await prisma.reportExport.findUnique({
    where: { export_id: params.exportId },
    include: { report: { include: { scoring_run: { include: { session: true } } } } },
  });
  if (!row) {
    return NextResponse.json({ error: "Export not found" }, { status: 404 });
  }

  if (user.role_type !== "admin") {
    // Candidate: candidate-audience only, and only their own report's export.
    if (row.audience !== "candidate") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const candidateId = await resolveCandidateId(user);
    if (!candidateId || row.report.scoring_run.session.candidate_id !== candidateId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json(toExportStatusDTO(row));
}
