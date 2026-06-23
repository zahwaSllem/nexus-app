// Nexus — database seed (B0)
// ─────────────────────────────────────────────────────────────────────────────
// Loads the existing FRONTEND MOCK DATA into the database so the future backend
// starts from the exact same fixtures the UI already renders. This is the only
// place mock data crosses into the DB; the frontend itself still uses the mock
// store unchanged.
//
// Safe to run repeatedly: it clears the seeded tables (reverse-FK order) first.
// Requires DATABASE_URL. If it is not set, the script exits 0 WITHOUT touching a
// database, so normal `npm run dev` / mock-data development never needs a DB.
//
// Run:  npm run db:seed   (after: prisma generate + prisma migrate dev)
// ─────────────────────────────────────────────────────────────────────────────

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes, scryptSync } from "node:crypto";
import {
  PrismaClient,
  Prisma,
  ResponseScale,
  ReleaseState,
} from "@prisma/client";

import { QUESTION_BANK } from "../src/lib/mock-data/question-bank";
import { BLUEPRINT_A, BLUEPRINT_B } from "../src/lib/mock-data/blueprints";
import {
  ASSESSMENT_BLUEPRINT_A,
  ASSESSMENT_BLUEPRINT_B,
} from "../src/lib/mock-data/assessment-blueprints";
import {
  ASSIGNMENT_1,
  ASSIGNMENT_2,
  ASSIGNMENT_3,
} from "../src/lib/mock-data/assignments";
import { SCORED_RESULT_1 } from "../src/lib/mock-data/scored-results";
import { REPORT_1 } from "../src/lib/mock-data/reports";
import { TRANSCRIPT_A, TRANSCRIPT_B } from "../src/lib/mock-data/agent-transcripts";

// ─── Minimal .env loader (no extra dependency) ─────────────────────────────────
// PrismaClient reads DATABASE_URL from the environment; the CLI loads .env but a
// plain `tsx prisma/seed.ts` run does not, so load it here if present.
function loadEnv() {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/// Safe password hashing for seed users using Node's built-in scrypt (no native
/// build deps). Format: "scrypt:<saltHex>:<hashHex>". Production may swap to Argon2id.
function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

/// Cast a typed mock object into a Prisma JSON column value. Optional `undefined`
/// fields are dropped by JSON serialization; the cast satisfies Prisma's JSON type.
const J = (v: unknown) => v as Prisma.InputJsonValue;

const d = (iso?: string) => (iso ? new Date(iso) : undefined);

// Enums that use @map in the schema need value→member translation.
const RESPONSE_SCALE: Record<string, ResponseScale> = {
  "1-5 Agreement": ResponseScale.agreement_1_5,
  "1-5 Frequency": ResponseScale.frequency_1_5,
  forced_choice_binary: ResponseScale.forced_choice_binary,
  cognitive_mcq: ResponseScale.cognitive_mcq,
  sjt_single_best: ResponseScale.sjt_single_best,
};

const RELEASE_STATE: Record<string, ReleaseState> = {
  Released: ReleaseState.Released,
  "Released with Caution": ReleaseState.Released_with_Caution,
  "Partial Release": ReleaseState.Partial_Release,
  "Blocked output section": ReleaseState.Blocked_output_section,
  "Assessment incomplete": ReleaseState.Assessment_incomplete,
  "Invalid for interpretation": ReleaseState.Invalid_for_interpretation,
};

// ─── Seed ───────────────────────────────────────────────────────────────────────

const prisma = new PrismaClient();

async function clear() {
  // Reverse-FK order so foreign keys never block deletion. The assignment↔session
  // cycle is broken by nulling assignment.session_id before deleting sessions.
  await prisma.reportExport.deleteMany();
  await prisma.report.deleteMany();
  await prisma.scoringRun.deleteMany();
  await prisma.response.deleteMany();
  await prisma.assignment.updateMany({ data: { session_id: null } });
  await prisma.assessmentSession.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.contextualizedItem.deleteMany();
  await prisma.assessmentBlueprint.deleteMany();
  await prisma.roleBlueprint.deleteMany();
  await prisma.agentConversation.deleteMany();
  await prisma.questionBankItem.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.user.deleteMany();
}

async function seed() {
  // 1. Users (two roles only). Mock credentials from PROJECT_STATUS.md.
  await prisma.user.createMany({
    data: [
      {
        user_id: "user-admin",
        email: "admin@nexus.io",
        password_hash: hashPassword("admin123"),
        role_type: "admin",
        display_name: "Nexus Admin",
        organization: "Nexus",
      },
      {
        user_id: "user-candidate",
        email: "candidate@nexus.io",
        password_hash: hashPassword("password123"),
        role_type: "candidate",
        display_name: "Alex Jordan",
      },
    ],
  });

  // 2. Candidates. cand-001 is the account behind candidate@nexus.io.
  await prisma.candidate.createMany({
    data: [
      {
        candidate_id: "cand-001",
        user_id: "user-candidate",
        candidate_name: "Alex Jordan",
        candidate_email: "candidate@nexus.io",
        job_title: "Junior Software Engineer",
      },
      {
        candidate_id: "cand-002",
        candidate_name: "Sam Rivera",
        candidate_email: "sam.rivera@example.com",
        job_title: "Junior Software Engineer",
      },
    ],
  });

  // 3. Question bank — 51 governed items (immutable metadata).
  await prisma.questionBankItem.createMany({
    data: QUESTION_BANK.map((it) => ({
      ...it,
      response_scale: RESPONSE_SCALE[it.response_scale],
    })),
  });

  // 4. Agent conversations (FK target for role blueprints).
  for (const t of [TRANSCRIPT_A, TRANSCRIPT_B]) {
    await prisma.agentConversation.create({
      data: {
        agent_conversation_id: t.conversation_id,
        admin_user_id: "user-admin",
        status: t.completed ? "completed" : "in_progress",
        turns: J(t.turns),
        completed_at: t.completed ? d(t.turns.at(-1)?.timestamp) : null,
      },
    });
  }

  // 5. Role blueprints (bp-001 approved, bp-002 draft). Nested objects → JSON.
  for (const bp of [BLUEPRINT_A, BLUEPRINT_B]) {
    await prisma.roleBlueprint.create({
      data: {
        blueprint_id: bp.blueprint_id,
        role_context: J(bp.role_context),
        context_profile: J(bp.context_profile), // 17-field context form (Domain 6 input, NOT a questionnaire domain)
        included_domains: bp.included_domains,
        selected_dimensions: J(bp.selected_dimensions),
        governance_warnings: J(bp.governance_warnings),
        approval_status: bp.approval_status,
        blueprint_quality: J(bp.blueprint_quality),
        agent_conversation_id: bp.agent_conversation_id,
        created_at: d(bp.created_at),
        approved_at: d(bp.approved_at),
        approved_by: bp.approved_by,
      },
    });
  }

  // 6. Assessment blueprints (abp-001, abp-002).
  for (const abp of [ASSESSMENT_BLUEPRINT_A, ASSESSMENT_BLUEPRINT_B]) {
    await prisma.assessmentBlueprint.create({
      data: {
        assessment_blueprint_id: abp.assessment_blueprint_id,
        role_blueprint_id: abp.role_blueprint_id,
        total_items: abp.total_items,
        estimated_duration_min: abp.estimated_duration_min,
        method_mix: J(abp.method_mix),
        domain_coverage: J(abp.domain_coverage),
        agent_selection_rationale: abp.agent_selection_rationale,
        generated_at: d(abp.generated_at),
      },
    });

    // 7. Contextualized items — original_text is an immutable copy of the bank text.
    await prisma.contextualizedItem.createMany({
      data: abp.contextualized_items.map((ci) => ({
        assessment_blueprint_id: abp.assessment_blueprint_id,
        item_id: ci.item_id,
        original_text: ci.original_text,
        contextualized_text: ci.contextualized_text,
        contextualization_rationale: ci.contextualization_rationale,
        display_order: ci.display_order,
      })),
    });
  }

  // 8. Assignments (session_id set later to break the assignment↔session cycle).
  for (const a of [ASSIGNMENT_1, ASSIGNMENT_2, ASSIGNMENT_3]) {
    await prisma.assignment.create({
      data: {
        assignment_id: a.assignment_id,
        blueprint_id: a.blueprint_id,
        assessment_blueprint_id: a.assessment_blueprint_id,
        candidate_id: a.candidate_id,
        candidate_name: a.candidate_name,
        candidate_email: a.candidate_email,
        job_title: a.job_title,
        use_case: a.use_case,
        status: a.status,
        consent_confirmed: a.consent_confirmed,
        consent_date: d(a.consent_date),
        deadline: new Date(a.deadline),
        assigned_at: d(a.assigned_at),
        assigned_by: a.assigned_by,
        completed_at: d(a.completed_at),
        invitation_link: a.invitation_link,
        invitation_status: a.invitation_status,
        // session_id intentionally omitted here — see step 9/10.
      },
    });
  }

  // 9. Session sess-001 (Sam Rivera / asgn-002). Synthesized: the mock data has no
  //    standalone session entity, but scoring_runs + reports reference it by FK.
  //    NOTE: asgn-003 also references sess-001 in mock data, but session_id is
  //    @unique, so only the canonical assignment (asgn-002) is linked here.
  await prisma.assessmentSession.create({
    data: {
      session_id: "sess-001",
      assignment_id: "asgn-002",
      assessment_blueprint_id: "abp-001",
      candidate_id: "cand-002",
      state: "scored",
      started_at: d("2026-06-08T09:30:00Z"),
      submitted_at: d("2026-06-08T10:15:00Z"),
      current_index: ASSESSMENT_BLUEPRINT_A.total_items,
    },
  });

  // 10. Link the canonical assignment to its session.
  await prisma.assignment.update({
    where: { assignment_id: "asgn-002" },
    data: { session_id: "sess-001" },
  });

  // 11. Scoring run score-001 (domain/dimension scores + QC flags → JSON).
  await prisma.scoringRun.create({
    data: {
      scoring_run_id: SCORED_RESULT_1.scoring_run_id,
      session_id: SCORED_RESULT_1.session_id,
      bank_version: SCORED_RESULT_1.bank_version,
      norm_version: SCORED_RESULT_1.norm_version,
      scoring_version: SCORED_RESULT_1.scoring_version,
      synthesis_weight_version: SCORED_RESULT_1.synthesis_weight_version,
      validity_state: SCORED_RESULT_1.validity_state,
      release_state: RELEASE_STATE[SCORED_RESULT_1.release_state],
      domain_scores: J(SCORED_RESULT_1.domain_scores),
      qc_flags: J(SCORED_RESULT_1.qc_flags), // admin-only; never surfaced to candidates
      completion_ratio: SCORED_RESULT_1.completion_ratio,
      scored_at: d(SCORED_RESULT_1.scored_at),
    },
  });

  // 12. Report rpt-001 — audience-partitioned: admin_view (detailed) + candidate_view
  //     (candidate-safe). Stored separately; candidate endpoints serialize candidate_view only.
  await prisma.report.create({
    data: {
      report_id: REPORT_1.report_id,
      scoring_run_id: REPORT_1.scoring_run_id,
      blueprint_id: REPORT_1.blueprint_id,
      assessment_blueprint_id: REPORT_1.assessment_blueprint_id,
      use_case: REPORT_1.use_case,
      policy_version: REPORT_1.policy_version,
      scoring_version: REPORT_1.scoring_version,
      synthesis_weight_version: REPORT_1.synthesis_weight_version,
      release_state: RELEASE_STATE[REPORT_1.release_state],
      visible_sections: REPORT_1.visible_sections,
      blocked_sections: REPORT_1.blocked_sections,
      downgraded_dimension_ids: REPORT_1.downgraded_dimension_ids,
      hidden_dimension_ids: REPORT_1.hidden_dimension_ids,
      admin_view: J(REPORT_1.admin_view),
      candidate_view: J(REPORT_1.candidate_view),
      generated_at: d(REPORT_1.generated_at),
    },
  });
}

async function main() {
  loadEnv();

  if (!process.env.DATABASE_URL) {
    console.warn(
      "[seed] DATABASE_URL is not set — skipping seed.\n" +
        "        The frontend runs on mock data and needs no database.\n" +
        "        To seed: copy .env.example to .env, set DATABASE_URL, run\n" +
        "        `npm run prisma:migrate`, then `npm run db:seed`."
    );
    return;
  }

  console.log("[seed] clearing existing seeded rows…");
  await clear();
  console.log("[seed] inserting mock fixtures…");
  await seed();

  const counts = {
    users: await prisma.user.count(),
    candidates: await prisma.candidate.count(),
    question_bank_items: await prisma.questionBankItem.count(),
    role_blueprints: await prisma.roleBlueprint.count(),
    assessment_blueprints: await prisma.assessmentBlueprint.count(),
    contextualized_items: await prisma.contextualizedItem.count(),
    assignments: await prisma.assignment.count(),
    assessment_sessions: await prisma.assessmentSession.count(),
    scoring_runs: await prisma.scoringRun.count(),
    reports: await prisma.report.count(),
    agent_conversations: await prisma.agentConversation.count(),
  };
  console.log("[seed] done:", counts);
}

main()
  .catch((e) => {
    console.error("[seed] failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
