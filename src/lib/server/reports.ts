// Nexus — Report generation + serializers (server-only)
// ─────────────────────────────────────────────────────────────────────────────
// Builds the two audience-partitioned views from a scoring run, deterministically
// (V1 provisional — templated prose, no NLG). Governance invariants:
//
//   • admin_view carries FULL detail: every dimension, qc_flags, governance_notes,
//     strengths, watch_points. ADMIN-ONLY.
//   • candidate_view is candidate-SAFE: only visible / visible_with_caution
//     dimensions survive; no qc_flags, no governance internals, no watch_points.
//     Blocked/downgraded/hidden content is ABSENT at build time, not hidden by UI.
//   • display_state drives partitioning:
//       visible / visible_with_caution → candidate-visible
//       downgraded → downgraded_dimension_ids (admin-only)
//       hidden     → hidden_dimension_ids (admin-only)
//       blocked    → blocked domain section
//   • release_state is reconciled across the Prisma @map boundary on read.
// ─────────────────────────────────────────────────────────────────────────────

import type { Report as ReportRow } from "@prisma/client";
import {
  ReportSchema,
  CandidateReportResponseSchema,
  type ReportDTO,
  type ScoredResultDTO,
  type AdminReportViewDTO,
  type CandidateReportViewDTO,
  type CandidateReportResponseDTO,
} from "@/lib/api/schemas";
import { RELEASE_STATE_TO_WIRE } from "@/lib/server/scoring";

const V1_POLICY_VERSION = "1.0.0";
const V1_SCORING_VERSION = "1.0.0-provisional";
const V1_SYNTHESIS_VERSION = "1.0.0-provisional";

type DimScore = ScoredResultDTO["domain_scores"][number]["dimensions"][number];

export type ReportContext = {
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  job_level: AdminReportViewDTO["job_level"];
  organization: string;
  blueprint_id: string;
  assessment_blueprint_id: string;
  use_case: ReportDTO["use_case"];
  blueprint_status: AdminReportViewDTO["blueprint_status"];
};

export type ReportViews = {
  release_state: ScoredResultDTO["release_state"];
  visible_sections: string[];
  blocked_sections: string[];
  downgraded_dimension_ids: string[];
  hidden_dimension_ids: string[];
  admin_view: AdminReportViewDTO;
  candidate_view: CandidateReportViewDTO;
};

const isCandidateVisible = (d: DimScore) =>
  d.display_state === "visible" || d.display_state === "visible_with_caution";

function band(score: number): string {
  if (score >= 70) return "strong";
  if (score >= 50) return "moderate";
  return "developing";
}

// Fixed V1 deferral notices (candidate-safe), mirroring the reporting standard.
const V1_BLOCKED_NOTICES: CandidateReportViewDTO["blocked_section_notices"] = [
  {
    section: "Workplace Effectiveness (D5)",
    reason:
      "This section is not yet available in V1. Domain 5 is a synthesis layer that requires validation of the foundational domains before it can be reported.",
    governance_rule: "PRD Part 2.6 — D5 deferred to Phase 2",
  },
  {
    section: "Fit and Readiness Indices (D6)",
    reason:
      "Context-derived indices require the Domain 6 engine, which is under development and not yet available in V1.",
    governance_rule: "PRD Part 2.7 — D6 indices deferred to Phase 2",
  },
  {
    section: "Percentile Bands",
    reason:
      "Percentile reporting requires validated norm groups, which are not yet established for V1. Scores are provisional on a 0–100 scale only.",
    governance_rule: "PRD Section 5.5 — Percentile release gates",
  },
];

/** Derive both audience views + section partitioning from a scoring run. */
export function buildReportViews(
  scored: ScoredResultDTO,
  ctx: ReportContext,
): ReportViews {
  const allDims = scored.domain_scores.flatMap((d) => d.dimensions);

  const downgraded_dimension_ids = allDims
    .filter((d) => d.display_state === "downgraded")
    .map((d) => d.dimension_id);
  const hidden_dimension_ids = allDims
    .filter((d) => d.display_state === "hidden")
    .map((d) => d.dimension_id);
  const blockedDims = allDims.filter((d) => d.display_state === "blocked");

  const visibleDomains = scored.domain_scores.filter((dom) =>
    dom.dimensions.some(isCandidateVisible),
  );

  const visible_sections = [
    ...visibleDomains.map((dom) => `domain_profile_${dom.domain_id}`),
    "response_quality",
    "governance_notice",
  ];

  const blocked_sections = Array.from(
    new Set([
      ...blockedDims.map((d) => `domain_profile_${d.domain_id}`),
      "domain6_context_indices",
      "percentile_bands",
    ]),
  );

  // ── admin_view ──────────────────────────────────────────────────────────────
  const strengths: AdminReportViewDTO["strengths"] = allDims
    .filter((d) => isCandidateVisible(d) && d.standardized_score >= 70)
    .sort((a, b) => b.standardized_score - a.standardized_score)
    .slice(0, 3)
    .map((d) => ({
      dimension_id: d.dimension_id,
      dimension_name: d.dimension_name,
      score: d.standardized_score,
      label: `Strong ${d.dimension_name} (${d.standardized_score}/100), reported with ${d.confidence} confidence.`,
    }));

  const watch_points: AdminReportViewDTO["watch_points"] = allDims
    .filter(
      (d) =>
        d.standardized_score < 65 ||
        d.confidence === "LOW" ||
        d.confidence === "UNACCEPTABLE",
    )
    .sort((a, b) => a.standardized_score - b.standardized_score)
    .slice(0, 3)
    .map((d) => ({
      dimension_id: d.dimension_id,
      dimension_name: d.dimension_name,
      score: d.standardized_score,
      note:
        d.confidence === "LOW" || d.confidence === "UNACCEPTABLE"
          ? `${d.dimension_name} scored below the confidence threshold for reliable interpretation (${d.confidence}). Treat as exploratory only.`
          : `${d.dimension_name} is a relative development area (${d.standardized_score}/100). Consider probing further.`,
    }));

  const governance_notes: string[] = [];
  for (const id of downgraded_dimension_ids) {
    const d = allDims.find((x) => x.dimension_id === id)!;
    governance_notes.push(
      `${d.dimension_name} (${id}) is below the confidence threshold for standard display (SE = ${d.standard_error}). It appears as downgraded and is excluded from the candidate view.`,
    );
  }
  for (const id of hidden_dimension_ids) {
    const d = allDims.find((x) => x.dimension_id === id)!;
    governance_notes.push(
      `${d.dimension_name} (${id}) is hidden due to UNACCEPTABLE confidence and is excluded from all interpretation.`,
    );
  }
  if (blockedDims.length > 0) {
    governance_notes.push(
      `Domains ${Array.from(new Set(blockedDims.map((d) => d.domain_id))).join(", ")} are governance-blocked in V1 and excluded from this report.`,
    );
  }
  governance_notes.push(
    `All scores carry scoring_version ${V1_SCORING_VERSION} and synthesis_weight_version ${V1_SYNTHESIS_VERSION}. Calibration minimums are unconfirmed; percentile reporting is not available at this stage.`,
  );
  if (scored.qc_flags.length > 0) {
    const summary = scored.qc_flags
      .map((f) => `${f.flag_code} (${f.severity})`)
      .join(", ");
    governance_notes.push(`Response-quality flags: ${summary}.`);
  }

  const highCount = allDims.filter((d) => d.confidence === "HIGH").length;
  const modCount = allDims.filter((d) => d.confidence === "MODERATE").length;
  const lowCount = allDims.filter(
    (d) => d.confidence === "LOW" || d.confidence === "UNACCEPTABLE",
  ).length;
  const confidence_summary =
    `${highCount} dimension(s) at HIGH confidence, ${modCount} at MODERATE, ${lowCount} at LOW/UNACCEPTABLE. ` +
    `Overall release state: ${scored.release_state}. ` +
    `${scored.qc_flags.length} QC flag(s) recorded.`;

  const admin_view: AdminReportViewDTO = {
    candidate_id: ctx.candidate_id,
    candidate_name: ctx.candidate_name,
    candidate_email: ctx.candidate_email,
    job_title: ctx.job_title,
    job_level: ctx.job_level,
    organization: ctx.organization,
    domain_scores: scored.domain_scores,
    qc_flags: scored.qc_flags,
    governance_notes,
    strengths,
    watch_points,
    confidence_summary,
    blueprint_status: ctx.blueprint_status,
    use_case: ctx.use_case,
  };

  // ── candidate_view (candidate-safe) ─────────────────────────────────────────
  const candidateDomainScores = scored.domain_scores
    .map((dom) => ({
      ...dom,
      dimensions: dom.dimensions.filter(isCandidateVisible),
    }))
    .filter((dom) => dom.dimensions.length > 0);

  const behavioral_descriptors: CandidateReportViewDTO["behavioral_descriptors"] =
    candidateDomainScores
      .flatMap((dom) => dom.dimensions)
      .map((d) => ({
        dimension_id: d.dimension_id,
        dimension_name: d.dimension_name,
        text: `Your responses indicate a ${band(d.standardized_score)} level of ${d.dimension_name}.`,
      }));

  const development_suggestions =
    watch_points.length > 0
      ? watch_points.map(
          (w) =>
            `Consider targeted development of ${w.dimension_name} through practice and feedback.`,
        )
      : [
          "Continue building on your demonstrated strengths through progressively challenging work.",
        ];

  const candidate_view: CandidateReportViewDTO = {
    domain_scores: candidateDomainScores,
    behavioral_descriptors,
    development_suggestions,
    blocked_section_notices: V1_BLOCKED_NOTICES,
  };

  return {
    release_state: scored.release_state,
    visible_sections,
    blocked_sections,
    downgraded_dimension_ids,
    hidden_dimension_ids,
    admin_view,
    candidate_view,
  };
}

/** Constants a route needs when persisting a report. */
export const REPORT_VERSIONS = {
  policy_version: V1_POLICY_VERSION,
  scoring_version: V1_SCORING_VERSION,
  synthesis_weight_version: V1_SYNTHESIS_VERSION,
} as const;

/** Prisma Report row → full Report DTO (ADMIN payload — includes admin_view). */
export function toReportDTO(row: ReportRow): ReportDTO {
  return ReportSchema.parse({
    report_id: row.report_id,
    scoring_run_id: row.scoring_run_id,
    blueprint_id: row.blueprint_id,
    assessment_blueprint_id: row.assessment_blueprint_id,
    use_case: row.use_case,
    policy_version: row.policy_version,
    scoring_version: row.scoring_version,
    synthesis_weight_version: row.synthesis_weight_version,
    release_state: RELEASE_STATE_TO_WIRE[row.release_state] ?? row.release_state,
    visible_sections: row.visible_sections,
    blocked_sections: row.blocked_sections,
    downgraded_dimension_ids: row.downgraded_dimension_ids,
    hidden_dimension_ids: row.hidden_dimension_ids,
    admin_view: row.admin_view,
    candidate_view: row.candidate_view,
    generated_at: row.generated_at.toISOString(),
  });
}

/** Prisma Report row → CANDIDATE-SAFE payload (NO admin_view, NO governance internals). */
export function toCandidateReportDTO(row: ReportRow): CandidateReportResponseDTO {
  return CandidateReportResponseSchema.parse({
    report_id: row.report_id,
    use_case: row.use_case,
    release_state: RELEASE_STATE_TO_WIRE[row.release_state] ?? row.release_state,
    candidate_view: row.candidate_view,
    generated_at: row.generated_at.toISOString(),
  });
}
