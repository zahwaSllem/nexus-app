// Nexus — /api/assignments/:id  (admin-only)
// ─────────────────────────────────────────────────────────────────────────────
//  GET   — fetch a single assignment (AssessmentAssignment DTO), or 404.
//  PATCH — update ONLY deadline, invitation_status, and/or status. No candidate or
//          blueprint reassignment, no consent/session mutation. Writes an
//          `assignment.updated` audit event in the SAME transaction (fail-closed).
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, authorizeAdmin } from "@/lib/api/guard";
import { UpdateAssignmentRequestSchema } from "@/lib/api/schemas";
import type { Prisma } from "@prisma/client";
import { toAssignmentDTO } from "@/lib/server/assignments";

const POLICY_VERSION = "1.0.0";

// ─── GET /api/assignments/:id ─────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const row = await prisma.assignment.findUnique({
    where: { assignment_id: params.id },
  });
  if (!row) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  return NextResponse.json(toAssignmentDTO(row));
}

// ─── PATCH /api/assignments/:id ───────────────────────────────────────────────
export async function PATCH(
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
  const parsed = UpdateAssignmentRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid assignment update", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const existing = await prisma.assignment.findUnique({
    where: { assignment_id: params.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  const { deadline, invitation_status, status } = parsed.data;

  // Build the update from ONLY the three allowed fields.
  const data: Prisma.AssignmentUpdateInput = {};
  if (deadline !== undefined) {
    const deadlineDate = new Date(deadline);
    if (Number.isNaN(deadlineDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid deadline: expected an ISO date string." },
        { status: 400 },
      );
    }
    data.deadline = deadlineDate;
  }
  if (invitation_status !== undefined) data.invitation_status = invitation_status;
  if (status !== undefined) data.status = status;

  const [updated] = await prisma.$transaction([
    prisma.assignment.update({
      where: { assignment_id: params.id },
      data,
    }),
    prisma.auditEvent.create({
      data: {
        actor_user_id: gate.user.user_id,
        actor_role: "admin",
        event_type: "assignment.updated",
        target_type: "assignment",
        target_id: params.id,
        payload: {
          ...(deadline !== undefined ? { deadline } : {}),
          ...(invitation_status !== undefined ? { invitation_status } : {}),
          ...(status !== undefined ? { status } : {}),
        },
        policy_version: POLICY_VERSION,
      },
    }),
  ]);

  return NextResponse.json(toAssignmentDTO(updated));
}
