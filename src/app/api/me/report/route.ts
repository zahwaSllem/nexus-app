// Nexus — GET /api/me/report  (candidate-only)
// ─────────────────────────────────────────────────────────────────────────────
// Returns the CALLER'S OWN candidate-safe report (latest). SECURITY: this NEVER
// serializes admin_view — only candidate_view + minimal metadata (via
// toCandidateReportDTO). The report is resolved through the caller's candidate
// profile → scoring_run → session, so a candidate can only ever receive their own.
// 401 unauthenticated · 403 non-candidate · 404 if they have no report yet.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeCandidate } from "@/lib/api/guard";
import { toCandidateReportDTO } from "@/lib/server/reports";

export async function GET() {
  const gate = await authorizeCandidate();
  if (!gate.ok) return gate.response;

  const row = await prisma.report.findFirst({
    where: { scoring_run: { session: { candidate_id: gate.candidate.candidate_id } } },
    orderBy: { generated_at: "desc" },
  });
  if (!row) {
    return NextResponse.json({ error: "No report available" }, { status: 404 });
  }

  return NextResponse.json(toCandidateReportDTO(row));
}
