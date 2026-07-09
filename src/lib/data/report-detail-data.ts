// Nexus — Report detail data source (mock ↔ api switch)
// ─────────────────────────────────────────────────────────────────────────────
// Only src/app/dashboard/reports/[id]/page.tsx uses this. Behind NEXT_PUBLIC_DATA_SOURCE:
//   • mock → the in-memory mock store (current behavior, synchronous).
//   • api  → GET /api/reports/:reportId only.
//
// Scope: read-only, admin report detail only. No candidate report, no export, no
// scoring, no writes. Deliberately does NOT call the scoring API: validity_state,
// completion_ratio, and scored_at live on ScoredResult, not on the Report DTO, and
// fetching a scoring run is a separate integration task. Those three fields come
// back null in api mode; the page shows a graceful fallback instead of guessing.
// qc_flags ARE available in api mode — they're duplicated onto admin_view.qc_flags
// by the backend, same as the mock data does.
// ─────────────────────────────────────────────────────────────────────────────

import { isApiMode } from "@/lib/api/config";
import { ApiError } from "@/lib/api/client";
import { getReport } from "@/lib/api/reports-client";
import { getReportById } from "@/lib/mock-data/reports";
import { getScoredResultById } from "@/lib/mock-data/scored-results";
import type { Report, ScoredResult } from "@/lib/types/nexus";

export interface ReportDetailData {
  /** null ⇒ not found. */
  report: Report | null;
  /**
   * ScoredResult fields not present on the Report DTO (validity_state,
   * completion_ratio, scored_at). Populated in mock mode; null in api mode
   * (scoring integration is out of scope for this page).
   */
  result: ScoredResult | null;
}

/** Await a promise, mapping a 404 ApiError to null instead of throwing. */
async function orNullOn404<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch (err) {
    if (err instanceof ApiError && err.code === "not_found") return null;
    throw err;
  }
}

/** Synchronous mock detail (used for the mock-mode initial render — no loading). */
export function mockReportDetail(id: string): ReportDetailData {
  const report = getReportById(id) ?? null;
  const result = report ? getScoredResultById(report.scoring_run_id) ?? null : null;
  return { report, result };
}

/** Load one report from the active data source. */
export async function loadReportDetail(id: string): Promise<ReportDetailData> {
  if (!isApiMode()) return mockReportDetail(id);

  const report = await orNullOn404(getReport(id));
  return { report, result: null };
}
