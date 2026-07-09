// Nexus — Reports data source (api loader)
// ─────────────────────────────────────────────────────────────────────────────
// API loader for the admin Reports list. The report TABLE is driven by the scoped
// endpoint GET /api/reports (real Report records — each row carries its own
// report_id and candidate info from admin_view). It also reuses two already-
// integrated reads: GET /api/blueprints (role/domain columns) and GET /api/assignments
// (the KPI counts the page shows). MOCK path stays in the page (store-derived).
//
// Read-only. No report detail, candidate report, export, scoring, or writes here.
// ─────────────────────────────────────────────────────────────────────────────

import { listReports } from "@/lib/api/reports-client";
import { listAssignments } from "@/lib/api/assignments-client";
import { listBlueprints } from "@/lib/api/blueprints-client";
import type { ReportDTO } from "@/lib/api/schemas";
import type { AssessmentAssignment, RoleBlueprint } from "@/lib/types/nexus";

export interface ReportListData {
  reports: ReportDTO[];
  /** For the "Total Assignments" / "Pending" KPI cards. */
  assignments: AssessmentAssignment[];
  /** blueprint_id → role blueprint (role title + domains columns). */
  blueprintsById: Record<string, RoleBlueprint>;
}

/** Load the admin reports list (+ blueprint lookup + KPI assignments). */
export async function loadReportList(): Promise<ReportListData> {
  const [reports, assignmentsPage, blueprints] = await Promise.all([
    listReports(),
    listAssignments({ page: 1, page_size: 100 }),
    listBlueprints(),
  ]);
  const blueprintsById: Record<string, RoleBlueprint> = {};
  for (const b of blueprints) blueprintsById[b.blueprint_id] = b;
  return { reports, assignments: assignmentsPage.data, blueprintsById };
}
