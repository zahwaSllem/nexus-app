// Nexus — Assignments API client (admin-only endpoints)
// Maps to:
//   GET   /api/assignments            (filters + pagination)
//   GET   /api/assignments/:id
//   POST  /api/assignments
//   POST  /api/assignments/bulk
//   PATCH /api/assignments/:id
// NOT wired into any page yet.
import { apiFetch } from "@/lib/api/client";
import type {
  AssessmentAssignmentDTO,
  CreateAssignmentRequest,
  CreateBulkAssignmentRequest,
  UpdateAssignmentRequest,
  CreatedAssignmentRecord,
} from "@/lib/api/schemas";

/** GET /api/assignments — paginated envelope. */
export interface Paginated<T> {
  data: T[];
  pagination: { page: number; page_size: number; total: number; total_pages: number };
}

export type ListAssignmentsQuery = {
  status?: AssessmentAssignmentDTO["status"];
  blueprint_id?: string;
  candidate_email?: string;
  page?: number;
  page_size?: number;
};

/** POST /api/assignments/bulk — created records + rejected rows. */
export interface BulkAssignmentResult {
  created: CreatedAssignmentRecord[];
  rejected: { index: number; email?: string; reason: string }[];
}

/** GET /api/assignments — list assignments (filtered + paginated). */
export function listAssignments(
  query: ListAssignmentsQuery = {},
): Promise<Paginated<AssessmentAssignmentDTO>> {
  return apiFetch<Paginated<AssessmentAssignmentDTO>>("/api/assignments", { query });
}

/** GET /api/assignments/:id — a single assignment. */
export function getAssignment(id: string): Promise<AssessmentAssignmentDTO> {
  return apiFetch<AssessmentAssignmentDTO>(`/api/assignments/${encodeURIComponent(id)}`);
}

/** POST /api/assignments — create one assignment. */
export function createAssignment(
  body: CreateAssignmentRequest,
): Promise<AssessmentAssignmentDTO> {
  return apiFetch<AssessmentAssignmentDTO>("/api/assignments", {
    method: "POST",
    json: body,
  });
}

/** POST /api/assignments/bulk — create many assignments. */
export function createAssignmentsBulk(
  body: CreateBulkAssignmentRequest,
): Promise<BulkAssignmentResult> {
  return apiFetch<BulkAssignmentResult>("/api/assignments/bulk", {
    method: "POST",
    json: body,
  });
}

/** PATCH /api/assignments/:id — update deadline / invitation_status / status only. */
export function updateAssignment(
  id: string,
  body: UpdateAssignmentRequest,
): Promise<AssessmentAssignmentDTO> {
  return apiFetch<AssessmentAssignmentDTO>(`/api/assignments/${encodeURIComponent(id)}`, {
    method: "PATCH",
    json: body,
  });
}
