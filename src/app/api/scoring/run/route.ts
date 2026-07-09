// Nexus — POST /api/scoring/run  (admin-only)
// ─────────────────────────────────────────────────────────────────────────────
// Run V1 PROVISIONAL scoring for a SUBMITTED session using the deterministic mock
// scorer (src/lib/scoring/mock-scorer.ts — spec-shaped, not real IRT/GGUM).
//
//   • Admin-only (candidates must never reach raw scoring). 401/403 enforced.
//   • The session must be state=submitted, else 409 (not submitted / already
//     scored — the existing scoring_run_id is returned for the scored case).
//   • Reads the session's saved responses + the blueprint's bank items from the
//     DB, runs the scorer, and persists ONE ScoringRun (domain_scores,
//     dimension_scores, qc_flags, validity_state, release_state, completion_ratio).
//   • Flips the session to state=scored and writes a `score.completed` audit event
//     in the SAME transaction (fail-closed).
//
// GOVERNANCE: this endpoint does NOT create a report, trigger a PDF, or compute
// Domain 6. It only produces the scoring run.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/api/guard";
import { RunScoringRequestSchema } from "@/lib/api/schemas";
import { toBankItemDTO } from "@/lib/server/bank";
import {
  toItemResponse,
  toScoredResultDTO,
  RELEASE_STATE_TO_ENUM,
} from "@/lib/server/scoring";
import { mockScore } from "@/lib/scoring/mock-scorer";
import type { Prisma } from "@prisma/client";

const POLICY_VERSION = "1.0.0";

export async function POST(req: NextRequest) {
  const gate = await authorizeAdmin();
  if (!gate.ok) return gate.response;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    raw = {};
  }
  const parsed = RunScoringRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid scoring request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { session_id } = parsed.data;

  const session = await prisma.assessmentSession.findUnique({
    where: { session_id },
  });
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  // Scoring runs ONLY for submitted sessions.
  if (session.state === "scored") {
    const existing = await prisma.scoringRun.findFirst({
      where: { session_id },
      orderBy: { scored_at: "desc" },
    });
    return NextResponse.json(
      { error: "Session already scored.", scoring_run_id: existing?.scoring_run_id },
      { status: 409 },
    );
  }
  if (session.state !== "submitted") {
    return NextResponse.json(
      { error: `Session is ${session.state}; only submitted sessions can be scored.` },
      { status: 409 },
    );
  }

  // Load the blueprint's bank items (full metadata — needed for keyed_answer /
  // reverse_scored) and the session's saved responses.
  const ctxItems = await prisma.contextualizedItem.findMany({
    where: { assessment_blueprint_id: session.assessment_blueprint_id },
    select: { item_id: true },
  });
  const [bankRows, responseRows] = await Promise.all([
    prisma.questionBankItem.findMany({
      where: { item_id: { in: ctxItems.map((c) => c.item_id) } },
    }),
    prisma.response.findMany({ where: { session_id } }),
  ]);

  const items = bankRows.map(toBankItemDTO);
  const responses = responseRows.map(toItemResponse);

  // Deterministic V1 provisional scoring.
  const result = mockScore(responses, items, session_id);
  const scoringRunId = `score-${Math.random().toString(36).slice(2, 8)}`;

  const [savedRun] = await prisma.$transaction([
    prisma.scoringRun.create({
      data: {
        scoring_run_id: scoringRunId,
        session_id,
        bank_version: result.bank_version,
        norm_version: result.norm_version,
        scoring_version: result.scoring_version,
        synthesis_weight_version: result.synthesis_weight_version,
        validity_state: result.validity_state,
        release_state: RELEASE_STATE_TO_ENUM[result.release_state],
        domain_scores: result.domain_scores as unknown as Prisma.InputJsonValue,
        qc_flags: result.qc_flags as unknown as Prisma.InputJsonValue,
        completion_ratio: result.completion_ratio,
        scored_at: new Date(result.scored_at),
      },
    }),
    prisma.assessmentSession.update({
      where: { session_id },
      data: { state: "scored" },
    }),
    prisma.auditEvent.create({
      data: {
        actor_user_id: gate.user.user_id,
        actor_role: "admin",
        event_type: "score.completed",
        target_type: "scoring_run",
        target_id: scoringRunId,
        payload: {
          session_id,
          validity_state: result.validity_state,
          release_state: result.release_state,
          completion_ratio: result.completion_ratio,
          qc_flag_count: result.qc_flags.length,
        },
        policy_version: POLICY_VERSION,
      },
    }),
  ]);

  return NextResponse.json(toScoredResultDTO(savedRun), { status: 201 });
}
