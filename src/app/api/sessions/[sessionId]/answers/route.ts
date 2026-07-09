// Nexus — PATCH /api/sessions/:sessionId/answers  (candidate-only, own session)
// ─────────────────────────────────────────────────────────────────────────────
// Partially save answers for an ACTIVE session.
//
//   • Body validated by SubmitResponsesRequestSchema (discriminated union per
//     method_family — value 1..5 for likert/frequency, selected_option for the
//     rest). Partial saves are allowed (any subset of questions).
//   • Every item_id must belong to THIS session's blueprint, and each answer's
//     method_family must match the bank item's method_family (else 400).
//   • Answers are upserted (create-or-update) keyed by (session_id, item_id), so
//     only the provided answers change; captured_at records the update time.
//   • Writes a `session.answers_saved` audit event in the SAME transaction.
//   • A submitted/scored/expired session is LOCKED → 409.
//
// This endpoint never scores and never mutates question-bank metadata.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeCandidate } from "@/lib/api/guard";
import { SubmitResponsesRequestSchema } from "@/lib/api/schemas";
import type { Prisma } from "@prisma/client";

const POLICY_VERSION = "1.0.0";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  const gate = await authorizeCandidate();
  if (!gate.ok) return gate.response;

  const session = await prisma.assessmentSession.findUnique({
    where: { session_id: params.sessionId },
  });
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.candidate_id !== gate.candidate.candidate_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // A session is only writable while active.
  if (session.state !== "created" && session.state !== "in_progress") {
    return NextResponse.json(
      { error: `Session is ${session.state}; answers are locked.` },
      { status: 409 },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    raw = {};
  }
  const parsed = SubmitResponsesRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid answers payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // Valid item ids (+ their method_family) for this session's blueprint.
  const items = await prisma.contextualizedItem.findMany({
    where: { assessment_blueprint_id: session.assessment_blueprint_id },
    include: { bank_item: { select: { method_family: true } } },
  });
  const methodByItem = new Map(items.map((ci) => [ci.item_id, ci.bank_item.method_family]));

  const unknownItems: string[] = [];
  const methodMismatches: string[] = [];
  for (const r of parsed.data.responses) {
    const expected = methodByItem.get(r.item_id);
    if (!expected) {
      unknownItems.push(r.item_id);
      continue;
    }
    if (expected !== r.method_family) {
      methodMismatches.push(r.item_id);
    }
  }
  if (unknownItems.length > 0 || methodMismatches.length > 0) {
    return NextResponse.json(
      {
        error: "One or more answers are invalid for this session.",
        unknown_item_ids: unknownItems,
        method_family_mismatch_item_ids: methodMismatches,
      },
      { status: 400 },
    );
  }

  const now = new Date();
  const ops: Prisma.PrismaPromise<unknown>[] = parsed.data.responses.map((r) => {
    const value = "value" in r ? r.value : null;
    const selected_option = "selected_option" in r ? r.selected_option : null;
    return prisma.response.upsert({
      where: { session_id_item_id: { session_id: session.session_id, item_id: r.item_id } },
      create: {
        session_id: session.session_id,
        item_id: r.item_id,
        method_family: r.method_family,
        value,
        selected_option,
        latency_ms: r.latency_ms,
        captured_at: now,
      },
      update: {
        method_family: r.method_family,
        value,
        selected_option,
        latency_ms: r.latency_ms,
        captured_at: now,
      },
    });
  });

  ops.push(
    prisma.auditEvent.create({
      data: {
        actor_user_id: gate.user.user_id,
        actor_role: "candidate",
        event_type: "session.answers_saved",
        target_type: "assessment_session",
        target_id: session.session_id,
        payload: {
          saved_count: parsed.data.responses.length,
          item_ids: parsed.data.responses.map((r) => r.item_id),
        },
        policy_version: POLICY_VERSION,
      },
    }),
  );

  await prisma.$transaction(ops);

  const [totalItems, answeredCount] = await prisma.$transaction([
    prisma.contextualizedItem.count({
      where: { assessment_blueprint_id: session.assessment_blueprint_id },
    }),
    prisma.response.count({ where: { session_id: session.session_id } }),
  ]);

  return NextResponse.json({
    saved: parsed.data.responses.length,
    answered_count: answeredCount,
    total_items: totalItems,
  });
}
