// Nexus — Assessment Sessions API client (candidate-only endpoints)
// Maps to:
//   POST  /api/sessions/start
//   GET   /api/sessions/:id
//   GET   /api/sessions/:id/questions
//   PATCH /api/sessions/:id/answers
//   POST  /api/sessions/:id/submit
// NOT wired into any page yet.
import { apiFetch } from "@/lib/api/client";
import type {
  SessionMetadataDTO,
  SessionItemDTO,
  StartSessionRequest,
  SubmitResponsesRequest,
} from "@/lib/api/schemas";

/** PATCH /api/sessions/:id/answers — save summary. */
export interface SaveAnswersResult {
  saved: number;
  answered_count: number;
  total_items: number;
}

/** POST /api/sessions/start — begin a session for one of the caller's assignments. */
export function startSession(body: StartSessionRequest): Promise<SessionMetadataDTO> {
  return apiFetch<SessionMetadataDTO>("/api/sessions/start", {
    method: "POST",
    json: body,
  });
}

/** GET /api/sessions/:id — session metadata (no items, no scoring). */
export function getSession(id: string): Promise<SessionMetadataDTO> {
  return apiFetch<SessionMetadataDTO>(`/api/sessions/${encodeURIComponent(id)}`);
}

/** GET /api/sessions/:id/questions — candidate-safe questions, in order. */
export function getSessionQuestions(id: string): Promise<SessionItemDTO[]> {
  return apiFetch<SessionItemDTO[]>(
    `/api/sessions/${encodeURIComponent(id)}/questions`,
  );
}

/** PATCH /api/sessions/:id/answers — partial save. */
export function saveAnswers(
  id: string,
  body: SubmitResponsesRequest,
): Promise<SaveAnswersResult> {
  return apiFetch<SaveAnswersResult>(`/api/sessions/${encodeURIComponent(id)}/answers`, {
    method: "PATCH",
    json: body,
  });
}

/** POST /api/sessions/:id/submit — finalize (requires all questions answered). */
export function submitSession(id: string): Promise<SessionMetadataDTO> {
  return apiFetch<SessionMetadataDTO>(`/api/sessions/${encodeURIComponent(id)}/submit`, {
    method: "POST",
  });
}
