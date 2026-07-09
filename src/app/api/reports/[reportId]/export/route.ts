// Nexus — POST /api/reports/:reportId/export  (admin OR candidate)
// ─────────────────────────────────────────────────────────────────────────────
// Create a PROVISIONAL PDF export of a report (V1 stub — no real bytes; see
// src/lib/server/exports.ts). Permissions are strict:
//
//   • Admin: may export either audience of any report (admin_view or candidate_view).
//   • Candidate: may export ONLY the candidate audience of THEIR OWN report. Any
//     request for audience=admin, or for a report that isn't theirs, is 403.
//   • The exported payload is the SAME report JSON the report APIs return
//     (toReportDTO for admin, toCandidateReportDTO for candidate) — so a candidate
//     export can never contain admin_view.
//
// Persists a report_exports row + a `report.exported` audit event in one
// transaction (fail-closed). Returns the export status + provisional reference.
// This endpoint sends no email and generates no real file.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { resolveCandidateId } from "@/lib/api/guard";
import { CreateExportRequestSchema } from "@/lib/api/schemas";
import { toReportDTO, toCandidateReportDTO } from "@/lib/server/reports";
import { makeStorageUrl, checksumOf, toExportStatusDTO } from "@/lib/server/exports";

const POLICY_VERSION = "1.0.0";

export async function POST(
  req: NextRequest,
  { params }: { params: { reportId: string } },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  const user = session.user;
  const isAdmin = user.role_type === "admin";

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    raw = {};
  }
  const parsed = CreateExportRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid export request", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { audience } = parsed.data;

  // Load the report (+ owning candidate via scoring_run → session).
  const report = await prisma.report.findUnique({
    where: { report_id: params.reportId },
    include: { scoring_run: { include: { session: true } } },
  });
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  // ── Authorization ────────────────────────────────────────────────────────────
  if (!isAdmin) {
    // Candidate: only the candidate audience, only their own report.
    if (audience !== "candidate") {
      return NextResponse.json(
        { error: "Candidates may only export the candidate view." },
        { status: 403 },
      );
    }
    const candidateId = await resolveCandidateId(user);
    if (!candidateId || report.scoring_run.session.candidate_id !== candidateId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // ── Build the export payload (same JSON the report APIs return) ───────────────
  const payload =
    audience === "candidate" ? toCandidateReportDTO(report) : toReportDTO(report);
  const exportId = randomUUID();
  const storageUrl = makeStorageUrl(exportId);
  const checksum = checksumOf(payload);

  const [saved] = await prisma.$transaction([
    prisma.reportExport.create({
      data: {
        export_id: exportId,
        report_id: report.report_id,
        audience,
        storage_url: storageUrl,
        checksum,
        policy_version: POLICY_VERSION,
        generated_by: user.email ?? "unknown",
      },
    }),
    prisma.auditEvent.create({
      data: {
        actor_user_id: user.user_id,
        actor_role: user.role_type,
        event_type: "report.exported",
        target_type: "report_export",
        target_id: exportId,
        payload: {
          report_id: report.report_id,
          audience,
          checksum,
          provisional: true,
        },
        policy_version: POLICY_VERSION,
      },
    }),
  ]);

  return NextResponse.json(toExportStatusDTO(saved), { status: 201 });
}
