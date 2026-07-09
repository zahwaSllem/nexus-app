// Nexus — GET /api/bank  (admin-only, read-only)
// ─────────────────────────────────────────────────────────────────────────────
// Returns the governed question bank as BankItemSchema[]. Optional filters (ANDed):
//   ?domain_id= &dimension_id= &method_family= &use_status=
// method_family / use_status are validated against their enums (invalid → 400).
//
// Candidates never receive raw bank items (they carry keyed_answer / scoring
// metadata) — enforced by requireAdmin(). Read-only: no POST/PUT/DELETE.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/guard";
import { BankQuerySchema } from "@/lib/api/schemas";
import { toBankItemDTO } from "@/lib/server/bank";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = BankQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { domain_id, dimension_id, method_family, use_status } = parsed.data;

  const rows = await prisma.questionBankItem.findMany({
    where: {
      ...(domain_id ? { domain_id } : {}),
      ...(dimension_id ? { dimension_id } : {}),
      ...(method_family ? { method_family } : {}),
      ...(use_status ? { use_status } : {}),
    },
    orderBy: { item_id: "asc" },
  });

  return NextResponse.json(rows.map(toBankItemDTO));
}
