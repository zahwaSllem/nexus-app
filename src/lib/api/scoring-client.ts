// Nexus — Scoring API client (admin-only endpoints)
// Maps to:
//   POST /api/scoring/run
//   GET  /api/scoring/:scoringRunId
//   GET  /api/sessions/:sessionId/scoring
// NOT wired into any page yet.
import { apiFetch } from "@/lib/api/client";
import type { ScoredResultDTO, RunScoringRequest } from "@/lib/api/schemas";

/** POST /api/scoring/run — run V1 provisional scoring for a submitted session. */
export function runScoring(body: RunScoringRequest): Promise<ScoredResultDTO> {
  return apiFetch<ScoredResultDTO>("/api/scoring/run", { method: "POST", json: body });
}

/** GET /api/scoring/:scoringRunId — a scoring run. */
export function getScoringRun(scoringRunId: string): Promise<ScoredResultDTO> {
  return apiFetch<ScoredResultDTO>(`/api/scoring/${encodeURIComponent(scoringRunId)}`);
}

/** GET /api/sessions/:sessionId/scoring — the scoring run for a session. */
export function getSessionScoring(sessionId: string): Promise<ScoredResultDTO> {
  return apiFetch<ScoredResultDTO>(
    `/api/sessions/${encodeURIComponent(sessionId)}/scoring`,
  );
}
