// Nexus — POST /api/blueprints/:id/approve  (admin-only)
// ─────────────────────────────────────────────────────────────────────────────
// Approval workflow (docs/API_CONTRACT.md §4):
//   • Body validated by ApproveBlueprintRequestSchema (approved_by email,
//     acknowledged_warnings[], target_status = approved|validated).
//   • GOVERNANCE GATE: if any severity:"blocking" warning remains → 422 (not a
//     silent success), with the blocking codes / nexus rules.
//   • On success: set approval_status = target_status, stamp approved_at/by, and
//     append a `blueprint.approved` audit event IN THE SAME TRANSACTION. If the
//     audit write fails, the whole transaction rolls back — audit failure is
//     SEV-1 / fail-closed (constraint #9).
//
// This endpoint never selects questions and never mutates bank metadata; it only
// transitions the blueprint's approval state.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/api/guard";
import { ApproveBlueprintRequestSchema } from "@/lib/api/schemas";
import {
  toRoleBlueprintDTO,
  parseGovernanceWarnings,
} from "@/lib/server/blueprints";

const POLICY_VERSION = "1.0.0";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await authorizeAdmin();
  if (!gate.ok) return gate.response;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    raw = {};
  }
  const parsed = ApproveBlueprintRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid approval request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const blueprint = await prisma.roleBlueprint.findUnique({
    where: { blueprint_id: params.id },
  });
  if (!blueprint) {
    return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
  }

  // Governance gate — blocking warnings cannot be acknowledged, only resolved.
  const blocking = parseGovernanceWarnings(blueprint.governance_warnings).filter(
    (w) => w.severity === "blocking",
  );
  if (blocking.length > 0) {
    return NextResponse.json(
      {
        error: "Cannot approve: blocking governance warnings must be resolved.",
        release_reason_codes: blocking.map((w) => w.code),
        nexus_rule: blocking.map((w) => w.nexus_rule).filter(Boolean),
      },
      { status: 422 },
    );
  }

  const { approved_by, target_status, acknowledged_warnings } = parsed.data;

  // Update + audit atomically (fail-closed: audit failure rolls back approval).
  const [updated] = await prisma.$transaction([
    prisma.roleBlueprint.update({
      where: { blueprint_id: params.id },
      data: {
        approval_status: target_status,
        approved_at: new Date(),
        approved_by,
      },
    }),
    prisma.auditEvent.create({
      data: {
        actor_user_id: gate.user.user_id,
        actor_role: "admin",
        event_type: "blueprint.approved",
        target_type: "role_blueprint",
        target_id: params.id,
        payload: { target_status, approved_by, acknowledged_warnings },
        policy_version: POLICY_VERSION,
      },
    }),
  ]);

  return NextResponse.json(toRoleBlueprintDTO(updated));
}
