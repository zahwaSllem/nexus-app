// Nexus — Reports API client
// Maps to:
//   POST /api/reports/generate                      (admin)
//   GET  /api/reports                               (admin)
//   GET  /api/reports/:reportId                     (admin)
//   GET  /api/reports/by-candidate/:candidateId     (admin)
//   GET  /api/reports/by-scoring-run/:scoringRunId  (admin)
//   GET  /api/me/report                             (candidate — candidate-safe)
// NOT wired into any page yet.
import { apiFetch } from "@/lib/api/client";
import type {
  ReportDTO,
  GenerateReportRequest,
  CandidateReportResponseDTO,
} from "@/lib/api/schemas";

export type ListReportsQuery = {
  scoring_run_id?: string;
  blueprint_id?: string;
};

/** POST /api/reports/generate — build a report from a scoring run (admin). */
export function generateReport(body: GenerateReportRequest): Promise<ReportDTO> {
  return apiFetch<ReportDTO>("/api/reports/generate", { method: "POST", json: body });
}

/** GET /api/reports — list reports (admin). */
export function listReports(query: ListReportsQuery = {}): Promise<ReportDTO[]> {
  return apiFetch<ReportDTO[]>("/api/reports", { query });
}

/** GET /api/reports/:reportId — a single report (admin). */
export function getReport(reportId: string): Promise<ReportDTO> {
  return apiFetch<ReportDTO>(`/api/reports/${encodeURIComponent(reportId)}`);
}

/** GET /api/reports/by-candidate/:candidateId — a candidate's reports (admin). */
export function getReportsByCandidate(candidateId: string): Promise<ReportDTO[]> {
  return apiFetch<ReportDTO[]>(
    `/api/reports/by-candidate/${encodeURIComponent(candidateId)}`,
  );
}

/** GET /api/reports/by-scoring-run/:scoringRunId — the report for a scoring run (admin). */
export function getReportByScoringRun(scoringRunId: string): Promise<ReportDTO> {
  return apiFetch<ReportDTO>(
    `/api/reports/by-scoring-run/${encodeURIComponent(scoringRunId)}`,
  );
}

/** GET /api/me/report — the caller's own candidate-safe report (candidate). */
export function getMyReport(): Promise<CandidateReportResponseDTO> {
  return apiFetch<CandidateReportResponseDTO>("/api/me/report");
}
