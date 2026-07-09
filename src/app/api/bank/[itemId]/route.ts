// Nexus — GET /api/bank/:itemId  (admin-only, read-only)
// Returns a single BankItemSchema, or 404 if the item does not exist.
// Admin-only: candidates never receive raw bank items (requireAdmin()).
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/guard";
import { toBankItemDTO } from "@/lib/server/bank";

export async function GET(
  _req: NextRequest,
  { params }: { params: { itemId: string } },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const row = await prisma.questionBankItem.findUnique({
    where: { item_id: params.itemId },
  });
  if (!row) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json(toBankItemDTO(row));
}
