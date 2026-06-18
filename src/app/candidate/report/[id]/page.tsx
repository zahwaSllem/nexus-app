import Link from "next/link";
import { REPORT_1 } from "@/lib/mock-data/reports";
import type { DomainScore, DimensionScore, BehavioralDescriptor, BlockedSectionReason } from "@/lib/types/nexus";
import { PageAmbient } from "@/components/layout/PageAmbient";
import { ReportExportButton, type ReportExportData } from "@/components/report/ReportExportButton";

const scoreColor = (score: number) => {
  if (score >= 75) return { bar: "bg-emerald-500", text: "text-emerald-400" };
  if (score >= 65) return { bar: "bg-indigo-500",  text: "text-indigo-400"  };
  if (score >= 50) return { bar: "bg-amber-500",   text: "text-amber-400"   };
  return               { bar: "bg-slate-500",   text: "text-slate-400"   };
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CandidateReportPage() {
  const cv = REPORT_1.candidate_view;

  const descriptorMap = new Map<string, string>(
    cv.behavioral_descriptors.map((d: BehavioralDescriptor) => [d.dimension_id, d.text]),
  );

  const dimScoreMap = new Map<string, number>(
    cv.domain_scores
      .flatMap((d: DomainScore) => d.dimensions)
      .map((dim: DimensionScore) => [dim.dimension_id, dim.standardized_score]),
  );

  const topDescriptors = [...cv.behavioral_descriptors]
    .sort((a, b) => (dimScoreMap.get(b.dimension_id) ?? 0) - (dimScoreMap.get(a.dimension_id) ?? 0))
    .slice(0, 3);

  const exportData: ReportExportData = {
    candidateName: REPORT_1.admin_view.candidate_name,
    reportType: "Developmental Feedback Report",
    releaseState: REPORT_1.release_state,
    generatedAt: fmtDate(REPORT_1.generated_at),
    domainScores: cv.domain_scores
      .map((d: DomainScore) => ({
        domain_id: d.domain_id,
        domain_name: d.domain_name,
        standardized_score: d.standardized_score,
        confidence: d.confidence,
        dimensions: d.dimensions
          .filter(
            (dim) => dim.display_state === "visible" || dim.display_state === "visible_with_caution",
          )
          .map((dim) => ({
            dimension_name: dim.dimension_name,
            standardized_score: dim.standardized_score,
            confidence: dim.confidence,
          })),
      }))
      .filter((d) => d.dimensions.length > 0),
    strengths: topDescriptors.map((desc) => ({
      title: desc.dimension_name,
      score: dimScoreMap.get(desc.dimension_id),
      detail: desc.text,
    })),
    recommendations: cv.development_suggestions,
    // governanceNotes intentionally omitted — candidate report excludes governance.
  };

  return (
    <div className="relative min-h-full bg-slate-50 dark:bg-slate-900">
      <PageAmbient />

      {/* ── Hero strip ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-slate-200/60 dark:border-slate-800/70">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/40 dark:from-slate-800/50 dark:via-slate-900 dark:to-slate-900" />
        <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-40 w-56 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/8" />

        <div className="relative flex flex-wrap items-start justify-between gap-4 px-8 py-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-500 dark:text-indigo-400">
              Developmental Feedback Report
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              Junior Software Engineer — Capability Assessment
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Completed 8 June 2026 · Release state:{" "}
              <span className="text-amber-500 dark:text-amber-400">{REPORT_1.release_state}</span>
            </p>
          </div>
          <ReportExportButton data={exportData} />
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      <div className="px-8 py-7">

        {/* Candidate-safe disclaimer */}
        <div className="mb-7 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-4">
          <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Your Personal Development Report</p>
            <p className="mt-1 text-xs leading-relaxed text-emerald-700/80 dark:text-emerald-300/70">
              This report is prepared for you personally. It describes your tendencies and patterns based on your
              assessment responses. The feedback is developmental — it is not a performance evaluation and should not
              be treated as a hiring decision. Discuss these findings with your manager or a development coach.
            </p>
          </div>
        </div>

        {/* Your Strengths */}
        {topDescriptors.length > 0 && (
          <div className="mb-7">
            <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
              Your Strengths
            </h2>
            <div className="space-y-3">
              {topDescriptors.map((desc: BehavioralDescriptor) => {
                const score = dimScoreMap.get(desc.dimension_id) ?? 0;
                const dc = scoreColor(score);
                return (
                  <div
                    key={desc.dimension_id}
                    className="flex items-start gap-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-5 py-4 dark:border-emerald-500/10 dark:bg-emerald-500/[0.04]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/60 dark:bg-slate-800/60">
                      <span className={`text-sm font-bold tabular-nums ${dc.text}`}>{score}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        {desc.dimension_name}
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {desc.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Domain sections */}
        <div className="mb-7">
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
            Your Profile
          </h2>

          <div className="space-y-6">
            {cv.domain_scores.map((domain: DomainScore) => {
              const visibleDims = domain.dimensions.filter(
                (d) => d.display_state === "visible" || d.display_state === "visible_with_caution",
              );
              if (visibleDims.length === 0) return null;

              return (
                <div key={domain.domain_id} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-700/60">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      {domain.domain_id}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{domain.domain_name}</h3>
                    <div className="ml-auto text-right">
                      <span className={`text-lg font-bold tabular-nums ${scoreColor(domain.standardized_score).text}`}>
                        {domain.standardized_score}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-600">/100</span>
                    </div>
                  </div>

                  <div className="space-y-5 p-5">
                    {visibleDims.map((dim: DimensionScore) => {
                      const dc = scoreColor(dim.standardized_score);
                      const descriptor = descriptorMap.get(dim.dimension_id);
                      const isCaution = dim.display_state === "visible_with_caution";

                      return (
                        <div key={dim.dimension_id} className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                {dim.dimension_name}
                              </span>
                              {isCaution && (
                                <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-500">
                                  provisional
                                </span>
                              )}
                            </div>
                            <span className={`shrink-0 font-mono text-sm font-bold ${dc.text}`}>
                              {dim.standardized_score}
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <div className={`h-1.5 rounded-full ${dc.bar}`} style={{ width: `${dim.standardized_score}%` }} />
                          </div>
                          {descriptor && (
                            <div className="rounded-lg bg-slate-100 px-4 py-3 dark:bg-slate-700/30">
                              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{descriptor}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Learning Recommendations */}
        <div className="mb-7 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-1 text-sm font-semibold text-slate-900 dark:text-white">Learning Recommendations</h2>
          <p className="mb-4 text-xs text-slate-400 dark:text-slate-500">
            These suggestions are based on your assessment profile and are designed to support your growth.
          </p>
          <ul className="space-y-3">
            {cv.development_suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{suggestion}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Role Fit Explanation */}
        <div className="mb-7 rounded-xl border border-slate-200/60 bg-slate-50 px-5 py-5 dark:border-slate-700/40 dark:bg-slate-800/50">
          <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Role Fit
          </h2>
          <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-500">
            Role Fit reflects how your capability profile — across personality, cognition, and
            interpersonal functioning — aligns with the specific demands of your assessed role.
            This analysis requires the Nexus Domain 6 engine, which compares your scores against
            a validated role context profile. It will be available in a future version of this report.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-slate-500">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <p className="text-[10px] text-slate-500 dark:text-slate-600">Coming in Phase 2</p>
          </div>
        </div>

        {/* Sections not yet available */}
        {cv.blocked_section_notices.length > 0 && (
          <div className="mb-7 space-y-3">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
              Coming in a Future Report
            </h2>
            {cv.blocked_section_notices.map((notice: BlockedSectionReason) => (
              <div
                key={notice.section}
                className="flex items-start gap-3 rounded-xl border border-slate-200/50 bg-slate-50 px-4 py-3 dark:border-slate-700/50 dark:bg-slate-800/60"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-600">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{notice.section}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400 dark:text-slate-600">{notice.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer disclaimer */}
        <div className="mb-7 rounded-xl border border-slate-200/30 bg-slate-100/30 px-4 py-3 dark:border-slate-700/30 dark:bg-slate-800/30">
          <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-700">
            Nexus V1 · Report generated 8 June 2026 · Scores are provisional (scoring_version: 1.0.0-provisional).
            This report is for developmental use only and is not a normatively validated psychometric output.
            Not for use in clinical, diagnostic, or binding hiring decisions.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/candidate/results/demo"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-6 py-3 text-sm font-medium text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Results
          </Link>
          <Link
            href="/candidate/dashboard"
            className="flex flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:from-indigo-700 hover:to-violet-700"
          >
            Return to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}
