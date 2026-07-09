// Nexus — Scoring serializers + converters (server-only)
// ─────────────────────────────────────────────────────────────────────────────
// Bridges the DB rows and the deterministic V1 mock scorer (src/lib/scoring):
//
//  • toItemResponse — Prisma Response row → nexus ItemResponse (the mock scorer's
//    input shape, a discriminated union by method_family).
//  • toScoredResultDTO — Prisma ScoringRun row → ScoredResult DTO (validated by
//    ScoredResultSchema). domain_scores / qc_flags are JSON and pass through.
//  • release_state reconciliation: the Prisma enum member names differ from the
//    wire strings via @map ("Released_with_Caution" ↔ "Released with Caution").
//    Prisma stores/returns the MEMBER name; the schema expects the wire string —
//    so we map both directions (RELEASE_STATE_TO_ENUM on write, TO_WIRE on read).
//
// GOVERNANCE: qc_flags and raw domain/dimension scores are ADMIN-ONLY. These
// serializers are only ever used behind admin-guarded routes.
// ─────────────────────────────────────────────────────────────────────────────

import type { Response, ScoringRun } from "@prisma/client";
import { ReleaseState } from "@prisma/client";
import type { ItemResponse } from "@/lib/types/nexus";
import { ScoredResultSchema, type ScoredResultDTO } from "@/lib/api/schemas";

/** Prisma enum MEMBER name → wire string (for the ScoredResult DTO). */
export const RELEASE_STATE_TO_WIRE: Record<string, string> = {
  Released: "Released",
  Released_with_Caution: "Released with Caution",
  Partial_Release: "Partial Release",
  Blocked_output_section: "Blocked output section",
  Assessment_incomplete: "Assessment incomplete",
  Invalid_for_interpretation: "Invalid for interpretation",
};

/** Wire string (mock scorer output) → Prisma enum member (for persistence). */
export const RELEASE_STATE_TO_ENUM: Record<string, ReleaseState> = {
  Released: ReleaseState.Released,
  "Released with Caution": ReleaseState.Released_with_Caution,
  "Partial Release": ReleaseState.Partial_Release,
  "Blocked output section": ReleaseState.Blocked_output_section,
  "Assessment incomplete": ReleaseState.Assessment_incomplete,
  "Invalid for interpretation": ReleaseState.Invalid_for_interpretation,
};

/** Prisma Response row → nexus ItemResponse (mock scorer input). */
export function toItemResponse(row: Response): ItemResponse {
  const latency_ms = row.latency_ms;
  switch (row.method_family) {
    case "likert":
      return { item_id: row.item_id, method_family: "likert", value: row.value as 1 | 2 | 3 | 4 | 5, latency_ms };
    case "contextual_self_report":
      return { item_id: row.item_id, method_family: "contextual_self_report", value: row.value as 1 | 2 | 3 | 4 | 5, latency_ms };
    case "forced_choice":
      return { item_id: row.item_id, method_family: "forced_choice", selected_option: row.selected_option as "A" | "B", latency_ms };
    case "cognitive_multiple_choice":
      return { item_id: row.item_id, method_family: "cognitive_multiple_choice", selected_option: row.selected_option as "A" | "B" | "C" | "D" | "E", latency_ms };
    case "sjt":
      return { item_id: row.item_id, method_family: "sjt", selected_option: row.selected_option as "A" | "B" | "C" | "D" | "E", latency_ms };
  }
}

/** Prisma ScoringRun row → ScoredResult DTO (admin-only payload). */
export function toScoredResultDTO(row: ScoringRun): ScoredResultDTO {
  return ScoredResultSchema.parse({
    scoring_run_id: row.scoring_run_id,
    session_id: row.session_id,
    bank_version: row.bank_version,
    norm_version: row.norm_version,
    scoring_version: row.scoring_version,
    synthesis_weight_version: row.synthesis_weight_version,
    validity_state: row.validity_state,
    release_state: RELEASE_STATE_TO_WIRE[row.release_state] ?? row.release_state,
    domain_scores: row.domain_scores,
    qc_flags: row.qc_flags,
    completion_ratio: row.completion_ratio,
    scored_at: row.scored_at.toISOString(),
  });
}
