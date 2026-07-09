// Nexus — Blueprints data source (mock ↔ api switch)
// ─────────────────────────────────────────────────────────────────────────────
// Single place the blueprint pages get their data. Behind NEXT_PUBLIC_DATA_SOURCE:
//   • mock → the in-memory mock store (current behavior, synchronous).
//   • api  → the real backend via blueprints-client / bank-client (async).
//
// Only the two admin Blueprint pages use this (Phase 1A). Nothing else is touched,
// and the mock path is byte-for-byte the previous behavior.
// ─────────────────────────────────────────────────────────────────────────────

import { isApiMode } from "@/lib/api/config";
import { ApiError } from "@/lib/api/client";
import {
  listBlueprints,
  getBlueprint,
  getAssessmentBlueprint,
} from "@/lib/api/blueprints-client";
import { listBankItems } from "@/lib/api/bank-client";
import { BLUEPRINTS, getBlueprintById } from "@/lib/mock-data/blueprints";
import { getAssessmentBlueprintByRoleBlueprint } from "@/lib/mock-data/assessment-blueprints";
import { getBankItemById } from "@/lib/mock-data/question-bank";
import type {
  RoleBlueprint,
  AssessmentBlueprint,
  BankItem,
} from "@/lib/types/nexus";

export interface BlueprintListData {
  blueprints: RoleBlueprint[];
  /** role blueprint_id → its assessment blueprint (null when none). */
  assessments: Record<string, AssessmentBlueprint | null>;
}

export interface BlueprintDetailData {
  /** null ⇒ not found. */
  blueprint: RoleBlueprint | null;
  assessment: AssessmentBlueprint | null;
  /** Resolve a bank item by id (mock lookup, or the fetched bank map). */
  resolveBankItem: (itemId: string) => BankItem | undefined;
}

/** Await a promise, mapping a 404 ApiError to null instead of throwing. */
async function orNullOn404<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch (err) {
    if (err instanceof ApiError && err.code === "not_found") return null;
    throw err;
  }
}

// ─── List ────────────────────────────────────────────────────────────────────

/** Synchronous mock list (used for the mock-mode initial render — no loading). */
export function mockBlueprintList(): BlueprintListData {
  const assessments: Record<string, AssessmentBlueprint | null> = {};
  for (const bp of BLUEPRINTS) {
    assessments[bp.blueprint_id] =
      getAssessmentBlueprintByRoleBlueprint(bp.blueprint_id) ?? null;
  }
  return { blueprints: BLUEPRINTS, assessments };
}

/** Load the blueprint list from the active data source. */
export async function loadBlueprintList(): Promise<BlueprintListData> {
  if (!isApiMode()) return mockBlueprintList();

  const blueprints = await listBlueprints();
  const entries = await Promise.all(
    blueprints.map(
      async (bp) =>
        [bp.blueprint_id, await orNullOn404(getAssessmentBlueprint(bp.blueprint_id))] as const,
    ),
  );
  return { blueprints, assessments: Object.fromEntries(entries) };
}

// ─── Detail ──────────────────────────────────────────────────────────────────

/** Synchronous mock detail (used for the mock-mode initial render — no loading). */
export function mockBlueprintDetail(id: string): BlueprintDetailData {
  const blueprint = getBlueprintById(id) ?? null;
  return {
    blueprint,
    assessment: blueprint
      ? getAssessmentBlueprintByRoleBlueprint(id) ?? null
      : null,
    resolveBankItem: (itemId) => getBankItemById(itemId),
  };
}

/** Load one blueprint (+ its assessment + bank lookup) from the active source. */
export async function loadBlueprintDetail(id: string): Promise<BlueprintDetailData> {
  if (!isApiMode()) return mockBlueprintDetail(id);

  const blueprint = await orNullOn404(getBlueprint(id));
  if (!blueprint) {
    return { blueprint: null, assessment: null, resolveBankItem: () => undefined };
  }
  const [assessment, bankItems] = await Promise.all([
    orNullOn404(getAssessmentBlueprint(id)),
    listBankItems(),
  ]);
  const bankMap = new Map(bankItems.map((b) => [b.item_id, b]));
  return { blueprint, assessment, resolveBankItem: (itemId) => bankMap.get(itemId) };
}
