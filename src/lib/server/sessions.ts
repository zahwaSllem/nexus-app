// Nexus — Assessment session serializers + helpers (server-only)
// ─────────────────────────────────────────────────────────────────────────────
//  • toSessionMetadataDTO — session metadata ONLY. No items, no scoring, no
//    keyed answers (candidate-safe).
//  • toSessionItemDTO — a single candidate-facing question built from the
//    ContextualizedItem (wording) + the QuestionBankItem (method/scale/options).
//    Deliberately OMITS keyed_answer, reverse_scored, intended_meaning and all
//    other governance/scoring metadata — those never reach a candidate.
//  • makeSessionId — id shape for a new session.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  AssessmentSession,
  ContextualizedItem,
  QuestionBankItem,
} from "@prisma/client";
import {
  SessionItemSchema,
  SessionMetadataSchema,
  type SessionItemDTO,
  type SessionMetadataDTO,
} from "@/lib/api/schemas";
import { RESPONSE_SCALE_TO_WIRE } from "@/lib/server/bank";

const orUndef = (v: string | null): string | undefined => (v == null ? undefined : v);

/** `sess-xxxxxx` — new runtime session id. */
export function makeSessionId(): string {
  return `sess-${Math.random().toString(36).slice(2, 8)}`;
}

/** Session metadata DTO (no items, no scoring, no keyed answers). */
export function toSessionMetadataDTO(
  row: AssessmentSession,
  totalItems: number,
  answeredCount: number,
): SessionMetadataDTO {
  return SessionMetadataSchema.parse({
    session_id: row.session_id,
    assignment_id: row.assignment_id,
    assessment_blueprint_id: row.assessment_blueprint_id,
    candidate_id: row.candidate_id,
    state: row.state,
    started_at: row.started_at ? row.started_at.toISOString() : undefined,
    submitted_at: row.submitted_at ? row.submitted_at.toISOString() : undefined,
    current_index: row.current_index,
    total_items: totalItems,
    answered_count: answeredCount,
  });
}

/** Candidate-safe question DTO (governance-sensitive fields are never included). */
export function toSessionItemDTO(
  ci: ContextualizedItem,
  bank: QuestionBankItem,
): SessionItemDTO {
  return SessionItemSchema.parse({
    item_id: ci.item_id,
    display_order: ci.display_order,
    contextualized_text: ci.contextualized_text,
    method_family: bank.method_family,
    response_scale: RESPONSE_SCALE_TO_WIRE[bank.response_scale] ?? bank.response_scale,
    option_a: orUndef(bank.option_a),
    option_b: orUndef(bank.option_b),
    option_c: orUndef(bank.option_c),
    option_d: orUndef(bank.option_d),
    option_e: orUndef(bank.option_e),
  });
}
