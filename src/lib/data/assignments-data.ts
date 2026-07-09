// Nexus — Assignments data source (api loader)
// ─────────────────────────────────────────────────────────────────────────────
// API loader for the admin assignments list. The MOCK path stays in the page,
// which reads the in-memory StoreProvider context (so runtime-created assignments
// still show in mock mode). This loader is only called when NEXT_PUBLIC_DATA_SOURCE
// = "api".
//
// The list also needs blueprint role/domain metadata for its columns, so it pulls
// the blueprint list too and indexes it by id.
// ─────────────────────────────────────────────────────────────────────────────

import { listAssignments } from "@/lib/api/assignments-client";
import { listBlueprints } from "@/lib/api/blueprints-client";
import type { AssessmentAssignment, RoleBlueprint } from "@/lib/types/nexus";

export interface AssignmentListData {
  assignments: AssessmentAssignment[];
  /** blueprint_id → role blueprint (for the role/domain columns). */
  blueprintsById: Record<string, RoleBlueprint>;
}

/** Load the assignments list (+ blueprint lookup) from the backend. */
export async function loadAssignmentList(): Promise<AssignmentListData> {
  const [page, blueprints] = await Promise.all([
    listAssignments({ page: 1, page_size: 100 }),
    listBlueprints(),
  ]);
  const blueprintsById: Record<string, RoleBlueprint> = {};
  for (const b of blueprints) blueprintsById[b.blueprint_id] = b;
  return { assignments: page.data, blueprintsById };
}
