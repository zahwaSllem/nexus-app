// Nexus — Question Bank serializer (server-only)
// ─────────────────────────────────────────────────────────────────────────────
// Converts a Prisma QuestionBankItem row into the API DTO validated by
// BankItemSchema. Two reconciliations are required:
//
//  1. response_scale: the Prisma enum member names for two values differ from the
//     wire strings via @map ("agreement_1_5" ↔ "1-5 Agreement", etc.). Prisma
//     returns the MEMBER name, so we reverse-map it to the string BankItemSchema
//     expects. All other enums have identical member names and pass through.
//  2. nullable columns: Prisma returns `null` for empty String? columns, but the
//     schema's optional fields expect `undefined` — convert null → undefined.
//
// This endpoint is ADMIN-ONLY, so the full item (incl. keyed_answer, reverse_scored,
// intended_meaning) is returned intact. Candidates never reach this serializer.
// ─────────────────────────────────────────────────────────────────────────────

import type { QuestionBankItem } from "@prisma/client";
import { BankItemSchema, type BankItemDTO } from "@/lib/api/schemas";

const RESPONSE_SCALE_TO_WIRE: Record<string, string> = {
  agreement_1_5: "1-5 Agreement",
  frequency_1_5: "1-5 Frequency",
  forced_choice_binary: "forced_choice_binary",
  cognitive_mcq: "cognitive_mcq",
  sjt_single_best: "sjt_single_best",
};

const orUndef = (v: string | null): string | undefined => (v == null ? undefined : v);

export function toBankItemDTO(row: QuestionBankItem): BankItemDTO {
  return BankItemSchema.parse({
    item_id: row.item_id,
    domain_id: row.domain_id,
    domain_name: row.domain_name,
    dimension_id: row.dimension_id,
    dimension_name: row.dimension_name,
    facet_id: row.facet_id,
    facet_name: row.facet_name,
    method_family: row.method_family,
    item_format: row.item_format,
    item_text: row.item_text,
    option_a: orUndef(row.option_a),
    option_b: orUndef(row.option_b),
    option_c: orUndef(row.option_c),
    option_d: orUndef(row.option_d),
    option_e: orUndef(row.option_e),
    keyed_answer: orUndef(row.keyed_answer),
    response_scale: RESPONSE_SCALE_TO_WIRE[row.response_scale] ?? row.response_scale,
    primary_domain_id: row.primary_domain_id,
    primary_dimension_id: row.primary_dimension_id,
    primary_facet_id: row.primary_facet_id,
    secondary_dimension_ids: orUndef(row.secondary_dimension_ids),
    loading_type: row.loading_type,
    intended_meaning: row.intended_meaning,
    prohibited_overlap: orUndef(row.prohibited_overlap),
    bank_state: row.bank_state,
    use_status: row.use_status,
    validation_track: row.validation_track,
    job_level_overlay: row.job_level_overlay,
    reverse_scored: row.reverse_scored,
  });
}
