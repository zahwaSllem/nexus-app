// Nexus — Question Bank API client (admin-only endpoints)
// Maps to: GET /api/bank, GET /api/bank/:itemId
// NOT wired into any page yet.
import { apiFetch } from "@/lib/api/client";
import type { BankItemDTO } from "@/lib/api/schemas";

export type BankQuery = {
  domain_id?: string;
  dimension_id?: string;
  method_family?: BankItemDTO["method_family"];
  use_status?: BankItemDTO["use_status"];
};

/** GET /api/bank — list bank items (optional filters, ANDed). */
export function listBankItems(query: BankQuery = {}): Promise<BankItemDTO[]> {
  return apiFetch<BankItemDTO[]>("/api/bank", { query });
}

/** GET /api/bank/:itemId — a single bank item. */
export function getBankItem(itemId: string): Promise<BankItemDTO> {
  return apiFetch<BankItemDTO>(`/api/bank/${encodeURIComponent(itemId)}`);
}
