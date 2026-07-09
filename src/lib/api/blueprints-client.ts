// Nexus — Blueprints API client (admin-only endpoints)
// Maps to:
//   GET  /api/blueprints
//   GET  /api/blueprints/:id
//   GET  /api/blueprints/:id/assessment
//   GET  /api/blueprints/:id/governance
//   POST /api/blueprints/:id/approve
// NOT wired into any page yet.
import { apiFetch } from "@/lib/api/client";
import type {
  RoleBlueprintDTO,
  AssessmentBlueprintDTO,
  ApproveBlueprintRequest,
} from "@/lib/api/schemas";
import type { GovernanceWarning } from "@/lib/types/nexus";

/** GET /api/blueprints — list role blueprints (?approved=true for approved|validated). */
export function listBlueprints(
  opts: { approved?: boolean } = {},
): Promise<RoleBlueprintDTO[]> {
  return apiFetch<RoleBlueprintDTO[]>("/api/blueprints", {
    query: { approved: opts.approved },
  });
}

/** GET /api/blueprints/:id — a single role blueprint. */
export function getBlueprint(id: string): Promise<RoleBlueprintDTO> {
  return apiFetch<RoleBlueprintDTO>(`/api/blueprints/${encodeURIComponent(id)}`);
}

/** GET /api/blueprints/:id/assessment — the assessment blueprint for a role blueprint. */
export function getAssessmentBlueprint(id: string): Promise<AssessmentBlueprintDTO> {
  return apiFetch<AssessmentBlueprintDTO>(
    `/api/blueprints/${encodeURIComponent(id)}/assessment`,
  );
}

/** GET /api/blueprints/:id/governance — the blueprint's governance warnings. */
export function getBlueprintGovernance(id: string): Promise<GovernanceWarning[]> {
  return apiFetch<GovernanceWarning[]>(
    `/api/blueprints/${encodeURIComponent(id)}/governance`,
  );
}

/** POST /api/blueprints/:id/approve — approve a role blueprint. */
export function approveBlueprint(
  id: string,
  body: ApproveBlueprintRequest,
): Promise<RoleBlueprintDTO> {
  return apiFetch<RoleBlueprintDTO>(
    `/api/blueprints/${encodeURIComponent(id)}/approve`,
    { method: "POST", json: body },
  );
}
