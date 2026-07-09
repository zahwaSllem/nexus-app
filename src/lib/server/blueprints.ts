// Nexus — Blueprint serializers (server-only)
// ─────────────────────────────────────────────────────────────────────────────
// Convert Prisma rows into the API DTOs validated by the existing Zod schemas.
//
//  • RoleBlueprint JSON columns (role_context, context_profile, selected_dimensions,
//    governance_warnings, blueprint_quality) are stored byte-aligned with the TS
//    types, so they pass through and are validated by RoleBlueprintSchema.
//  • DateTime columns → ISO strings (schemas expect strings). null → undefined.
//  • AssessmentBlueprint's contextualized_items live in a child table; they are
//    passed in and sorted by display_order. Item metadata is never mutated here —
//    only original_text + contextualized_text (wording) are surfaced.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import type {
  RoleBlueprint,
  AssessmentBlueprint,
  ContextualizedItem,
} from "@prisma/client";
import {
  RoleBlueprintSchema,
  AssessmentBlueprintSchema,
  GovernanceWarningSchema,
  type RoleBlueprintDTO,
  type AssessmentBlueprintDTO,
} from "@/lib/api/schemas";

export function toRoleBlueprintDTO(row: RoleBlueprint): RoleBlueprintDTO {
  return RoleBlueprintSchema.parse({
    blueprint_id: row.blueprint_id,
    role_context: row.role_context,
    context_profile: row.context_profile,
    included_domains: row.included_domains,
    selected_dimensions: row.selected_dimensions,
    governance_warnings: row.governance_warnings,
    approval_status: row.approval_status,
    blueprint_quality: row.blueprint_quality,
    agent_conversation_id: row.agent_conversation_id,
    created_at: row.created_at.toISOString(),
    approved_at: row.approved_at ? row.approved_at.toISOString() : undefined,
    approved_by: row.approved_by ?? undefined,
  });
}

export function toAssessmentBlueprintDTO(
  row: AssessmentBlueprint,
  items: ContextualizedItem[],
): AssessmentBlueprintDTO {
  return AssessmentBlueprintSchema.parse({
    assessment_blueprint_id: row.assessment_blueprint_id,
    role_blueprint_id: row.role_blueprint_id,
    contextualized_items: items
      .slice()
      .sort((a, b) => a.display_order - b.display_order)
      .map((ci) => ({
        item_id: ci.item_id,
        original_text: ci.original_text,
        contextualized_text: ci.contextualized_text,
        contextualization_rationale: ci.contextualization_rationale,
        display_order: ci.display_order,
      })),
    total_items: row.total_items,
    estimated_duration_min: row.estimated_duration_min,
    method_mix: row.method_mix,
    domain_coverage: row.domain_coverage,
    agent_selection_rationale: row.agent_selection_rationale,
    generated_at: row.generated_at.toISOString(),
  });
}

/** Validate + return the governance warnings stored on a role blueprint. */
export function parseGovernanceWarnings(json: unknown) {
  return z.array(GovernanceWarningSchema).parse(json);
}
