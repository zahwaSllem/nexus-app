import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { REPORT_1 } from "@/lib/mock-data/reports";
import { SCORED_RESULT_1 } from "@/lib/mock-data/scored-results";
import type {
  DomainScore,
  DimensionScore,
  StrengthPoint,
  WatchPoint,
  QCFlag,
  ConfidenceBand,
  ReleaseState,
} from "@/lib/types/nexus";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 75) return { text: "text-emerald-400", bar: "bg-emerald-500", border: "border-emerald-500/30" };
  if (score >= 65) return { text: "text-indigo-400",  bar: "bg-indigo-500",  border: "border-indigo-500/30" };
  if (score >= 50) return { text: "text-amber-400",   bar: "bg-amber-500",   border: "border-amber-500/30" };
  return               { text: "text-slate-400",   bar: "bg-slate-500",   border: "border-slate-700"      };
}

const CONFIDENCE_BADGE: Record<ConfidenceBand, string> = {
  HIGH:         "bg-emerald-500/15 text-emerald-400",
  MODERATE:     "bg-amber-500/10 text-amber-400",
  LOW:          "bg-red-500/10 text-red-400",
  UNACCEPTABLE: "bg-slate-700 text-slate-500",
};

const RELEASE_CONFIG: Record<ReleaseState, { border: string; text: string }> = {
  "Released":                   { border: "border-emerald-500/30 bg-emerald-500/5", text: "text-emerald-400" },
  "Released with Caution":      { border: "border-amber-500/30 bg-amber-500/5",    text: "text-amber-400"   },
  "Partial Release":            { border: "border-amber-500/30 bg-amber-500/5",    text: "text-amber-400"   },
  "Blocked output section":     { border: "border-red-500/30 bg-red-500/5",        text: "text-red-400"     },
  "Assessment incomplete":      { border: "border-slate-700 bg-slate-800",          text: "text-slate-400"   },
  "Invalid for interpretation": { border: "border-red-500/30 bg-red-500/5",        text: "text-red-400"     },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ─── Page ──────────────────────────────────────────────────────────────────────

interface PageProps { params: { id: string } }

export default function AdminReportDetailPage({ params: _params }: PageProps) {
  const report = REPORT_1;
  const result = SCORED_RESULT_1;
  const av = report.admin_view;
  const rc = RELEASE_CONFIG[report.release_state] ?? RELEASE_CONFIG["Released with Caution"];

  return (
    <div className="min-h-full bg-slate-900 p-8">

      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/dashboard/reports"
          className="flex w-fit items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-300"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Reports
        </Link>
      </div>

      {/* Release State Banner */}
      <div className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-5 py-4 ${rc.border}`}>
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className={`h-5 w-5 shrink-0 ${rc.text}`}>
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className={`text-sm font-semibold ${rc.text}`}>{report.release_state}</p>
            <p className="text-xs text-slate-400">
              Validity: {result.validity_state} · Scored {fmtDate(result.scored_at)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-700/60 px-2.5 py-0.5 font-mono text-xs text-slate-300">
            {report.report_id}
          </span>
          <span className="rounded-full bg-slate-700/60 px-2.5 py-0.5 font-mono text-xs text-slate-500">
            {report.scoring_version}
          </span>
        </div>
      </div>

      {/* Report header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-400">
            Admin Assessment Report
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">{av.candidate_name}</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {av.job_title} · {av.job_level} · {av.organization}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-600">Use Case</p>
          <p className="mt-0.5 text-xs font-semibold text-slate-300">
            {av.use_case === "hiring_support_validated_blueprint"
              ? "Hiring Support — Validated Blueprint"
              : "Developmental"}
          </p>
          <p className="mt-1 text-xs text-slate-600">Generated {fmtDate(report.generated_at)}</p>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid gap-6 xl:grid-cols-3">

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <div className="order-first flex flex-col gap-5 xl:order-last">

          {/* Candidate summary */}
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Candidate</p>
            <div className="space-y-2.5">
              {(
                [
                  ["Name",         av.candidate_name],
                  ["Email",        av.candidate_email],
                  ["Title",        av.job_title],
                  ["Level",        av.job_level],
                  ["Organization", av.organization],
                  ["Completion",   `${Math.round(result.completion_ratio * 100)}%`],
                  ["Assessed",     fmtDate(result.scored_at)],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <span className="shrink-0 text-xs text-slate-500">{label}</span>
                  <span className="text-right text-xs font-medium text-slate-300">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Response Quality & QC */}
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Response Quality
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400">Validity State</span>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400">
                  {result.validity_state}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400">Completion</span>
                <span className="text-xs font-semibold text-slate-300">
                  {Math.round(result.completion_ratio * 100)}%
                </span>
              </div>
            </div>
            {result.qc_flags.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-slate-700/60 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600">QC Flags</p>
                {result.qc_flags.map((flag: QCFlag) => (
                  <div
                    key={flag.flag_code}
                    className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5"
                  >
                    <p className="font-mono text-[10px] font-bold text-amber-400">{flag.flag_code}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-amber-300/70">
                      {flag.description}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      Severity: {flag.severity}
                      {flag.affected_domain ? ` · ${flag.affected_domain}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blocked & downgraded */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
              Not Available / Blocked
            </p>
            <div className="space-y-1.5">
              {report.blocked_sections.map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 shrink-0 text-slate-600">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-mono text-[10px] text-slate-600">{s}</span>
                </div>
              ))}
            </div>
            {report.downgraded_dimension_ids.length > 0 && (
              <div className="mt-3 border-t border-slate-700/40 pt-3">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600">
                  Downgraded Dimensions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {report.downgraded_dimension_ids.map((id) => (
                    <span
                      key={id}
                      className="rounded bg-red-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-red-400/70"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Version tags */}
          <div className="rounded-xl border border-slate-700/30 bg-slate-800/30 p-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
              Version Tags
            </p>
            <div className="space-y-1.5">
              {(
                [
                  ["Scoring",     report.scoring_version],
                  ["Synthesis",   report.synthesis_weight_version],
                  ["Blueprint",   report.blueprint_id],
                  ["Assessment",  report.assessment_blueprint_id],
                  ["Policy",      report.policy_version],
                ] as [string, string][]
              ).map(([label, val]) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-600">{label}</span>
                  <span className="font-mono text-[10px] text-slate-500">{val}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Main content ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 xl:col-span-2">

          {/* Confidence Summary */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-400">
              Confidence Summary
            </p>
            <p className="text-sm leading-relaxed text-slate-300">{av.confidence_summary}</p>
          </div>

          {/* Critical Success Factors */}
          <div className="overflow-hidden rounded-xl border border-emerald-500/25 bg-slate-800">
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-700/60 bg-emerald-500/5 px-5 py-4">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-emerald-400">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h2 className="text-sm font-semibold text-white">Critical Success Factors</h2>
              <span className="ml-auto text-xs text-slate-500">
                Highest-scoring dimensions for role alignment
              </span>
            </div>
            <div className="divide-y divide-slate-700/40">
              {av.strengths.map((s: StrengthPoint) => {
                const sc = scoreColor(s.score);
                return (
                  <div key={s.dimension_id} className="flex items-start gap-4 px-5 py-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-700/50">
                      <span className={`text-lg font-bold tabular-nums ${sc.text}`}>{s.score}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-white">{s.dimension_name}</span>
                        <span className="font-mono text-xs text-slate-600">{s.dimension_id}</span>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-300">{s.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risk Indicators & Disqualifying Traits */}
          <div className="overflow-hidden rounded-xl border border-amber-500/25 bg-slate-800">
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-700/60 bg-amber-500/5 px-5 py-4">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-amber-400">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h2 className="text-sm font-semibold text-white">Risk Indicators &amp; Watch Points</h2>
            </div>
            <div className="divide-y divide-slate-700/40">
              {av.watch_points.map((w: WatchPoint) => {
                const isDisqualifying = report.downgraded_dimension_ids.includes(w.dimension_id);
                const sc = scoreColor(w.score);
                return (
                  <div key={w.dimension_id} className="flex items-start gap-4 px-5 py-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                        isDisqualifying ? "bg-red-500/10" : "bg-slate-700/50"
                      }`}
                    >
                      <span
                        className={`text-lg font-bold tabular-nums ${
                          isDisqualifying ? "text-red-400" : sc.text
                        }`}
                      >
                        {w.score}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-white">{w.dimension_name}</span>
                        <span className="font-mono text-xs text-slate-600">{w.dimension_id}</span>
                        {isDisqualifying && (
                          <span className="rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-400">
                            Disqualifying — Low Confidence
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-amber-300/70">{w.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Domain Breakdown */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Domain Breakdown
            </p>
            <div className="flex flex-col gap-5">
              {av.domain_scores.map((domain: DomainScore) => {
                const sc = scoreColor(domain.standardized_score);
                return (
                  <div
                    key={domain.domain_id}
                    className={`overflow-hidden rounded-xl border bg-slate-800 ${sc.border}`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-700/60 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="rounded bg-blue-500/10 px-2 py-0.5 font-mono text-xs font-bold text-blue-300">
                          {domain.domain_id}
                        </span>
                        <h3 className="text-sm font-semibold text-white">{domain.domain_name}</h3>
                      </div>
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${CONFIDENCE_BADGE[domain.confidence]}`}>
                        {domain.confidence}
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="mb-4 flex items-end gap-3">
                        <div>
                          <p className="text-xs text-slate-500">Composite Score</p>
                          <div className="flex items-baseline gap-1.5">
                            <span className={`text-3xl font-bold tabular-nums ${sc.text}`}>
                              {domain.standardized_score}
                            </span>
                            <span className="text-slate-600">/100</span>
                          </div>
                        </div>
                      </div>
                      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                        <div
                          className={`h-1.5 rounded-full ${sc.bar}`}
                          style={{ width: `${domain.standardized_score}%` }}
                        />
                      </div>

                      <div className="space-y-3">
                        {domain.dimensions.map((dim: DimensionScore) => {
                          if (dim.display_state === "hidden" || dim.display_state === "blocked") return null;
                          const dc = scoreColor(dim.standardized_score);
                          const isDowngraded = dim.display_state === "downgraded";
                          const isCaution = dim.display_state === "visible_with_caution";
                          return (
                            <div key={dim.dimension_id} className={isDowngraded ? "opacity-60" : ""}>
                              <div className="mb-1 flex items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className={`text-xs ${isDowngraded ? "text-slate-500" : "text-slate-300"}`}>
                                    {dim.dimension_name}
                                  </span>
                                  {isDowngraded && (
                                    <span className="rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-400">
                                      downgraded
                                    </span>
                                  )}
                                  {isCaution && (
                                    <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-400">
                                      caution
                                    </span>
                                  )}
                                  <span className={`rounded px-1 py-0.5 text-[10px] ${CONFIDENCE_BADGE[dim.confidence]}`}>
                                    {dim.confidence}
                                  </span>
                                </div>
                                <span
                                  className={`font-mono text-xs font-bold ${
                                    isDowngraded ? "text-slate-500" : dc.text
                                  }`}
                                >
                                  {dim.standardized_score}
                                </span>
                              </div>
                              <div className="h-1 w-full overflow-hidden rounded-full bg-slate-700">
                                <div
                                  className={`h-1 rounded-full ${isDowngraded ? "bg-slate-600" : dc.bar}`}
                                  style={{ width: `${dim.standardized_score}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* D5 blocked */}
              <div className="overflow-hidden rounded-xl border border-violet-500/20 bg-slate-800">
                <div className="flex items-center justify-between border-b border-slate-700/60 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-violet-500/10 px-2 py-0.5 font-mono text-xs font-bold text-violet-300">
                      D5
                    </span>
                    <h3 className="text-sm font-semibold text-white">Workplace Effectiveness</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="pilot">Phase 2</Badge>
                    <Badge variant="error">Blocked</Badge>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs leading-relaxed text-violet-300/70">
                    Domain 5 is excluded from this report per V1 governance gate. D5 scoring methodology,
                    normative baseline, and output formats are under development and will be validated
                    prior to V2 release.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Role Fit */}
          <div className="overflow-hidden rounded-xl border border-slate-700/40 bg-slate-800/60 p-5">
            <div className="mb-3 flex items-center gap-3">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-slate-600">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <h2 className="text-sm font-semibold text-slate-400">Role Fit Indices (Domain 6)</h2>
              <span className="ml-auto rounded-full bg-slate-700/60 px-2.5 py-0.5 text-xs text-slate-500">
                Not Available — V1
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Contextual Alignment Index (CAI) and Decision Influence Index (DII) are Domain 6 outputs
              computed by the Nexus role-fit engine. This requires validated context profiles and norm
              baselines. Role Fit computation is deferred to Phase 2.
            </p>
            <p className="mt-2 text-xs text-slate-600">
              The 17-field context profile for this role is stored and available for future computation
              under blueprint{" "}
              <span className="font-mono text-slate-500">{report.blueprint_id}</span>.
            </p>
          </div>

          {/* Hiring Recommendation */}
          <div className="overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-400">
              Hiring Recommendation
            </p>
            <p className="mb-3 text-sm font-semibold text-white">Proceed with Caution</p>
            <p className="text-xs leading-relaxed text-amber-300/70">
              Release state is{" "}
              <span className="font-medium text-amber-400">{report.release_state}</span> (validity:{" "}
              {result.validity_state}). Results may support hiring consideration with the following
              advisories: (1) verify numerical reasoning capacity through technical interview probing
              (D2-NR: 56); (2) treat D4-SA as exploratory only — low confidence, do not use in hiring
              decision; (3) all scores are provisional pending calibration confirmation. Do not use
              assessment data as a standalone hiring signal.
            </p>
            <div className="mt-3 rounded-lg border border-amber-500/10 bg-amber-500/5 px-3 py-2">
              <p className="text-[10px] leading-relaxed text-amber-400/50">
                This recommendation is derived from the automated release state and validity
                classification. It does not constitute a hiring decision. All hiring decisions remain
                the responsibility of authorised personnel.
              </p>
            </div>
          </div>

          {/* Governance Notes */}
          <div className="overflow-hidden rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
            <div className="mb-4 flex items-center gap-2">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-violet-400">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <h2 className="text-sm font-semibold text-violet-300">Governance Notes</h2>
            </div>
            <div className="space-y-3">
              {av.governance_notes.map((note, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-[10px] font-bold text-violet-400">
                    {i + 1}
                  </span>
                  <p className="text-xs leading-relaxed text-violet-300/70">{note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="rounded-xl border border-slate-700/30 bg-slate-800/30 px-5 py-4">
            <p className="text-xs leading-relaxed text-slate-600">
              Nexus V1 · Report {report.report_id} · Generated {fmtDate(report.generated_at)} ·
              Blueprint {report.blueprint_id} · Assessment {report.assessment_blueprint_id} ·
              Scores are provisional ({report.scoring_version}). Not for use in clinical, diagnostic,
              or binding hiring decisions without supplementary validation.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
