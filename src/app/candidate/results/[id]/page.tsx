"use client";

import Link from "next/link";
import { SCORED_RESULT_1 } from "@/lib/mock-data/scored-results";
import { REPORT_1 } from "@/lib/mock-data/reports";
import type { DomainScore, DimensionScore } from "@/lib/types/nexus";
import { useLanguage } from "@/lib/providers/language-provider";
import { PageAmbient } from "@/components/layout/PageAmbient";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 75) return { bar: "bg-emerald-500",  text: "text-emerald-400",  ring: "border-emerald-500/30" };
  if (score >= 65) return { bar: "bg-indigo-500",   text: "text-indigo-400",   ring: "border-indigo-500/30" };
  if (score >= 50) return { bar: "bg-amber-500",    text: "text-amber-400",    ring: "border-amber-500/30" };
  return               { bar: "bg-slate-500",    text: "text-slate-400",    ring: "border-slate-300 dark:border-slate-600" };
}

const CONFIDENCE_DOT: Record<string, string> = {
  HIGH:     "bg-emerald-500",
  MODERATE: "bg-amber-400",
  LOW:      "bg-slate-400 dark:bg-slate-600",
};

function candidateVisibleDimensions(dims: DimensionScore[]) {
  return dims.filter(
    (d) => d.display_state === "visible" || d.display_state === "visible_with_caution",
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CandidateResultsPage() {
  const { t } = useLanguage();
  const result   = SCORED_RESULT_1;
  const report   = REPORT_1;
  const cv       = report.candidate_view;

  const completionPct = Math.round(result.completion_ratio * 100);
  const totalDomains  = result.domain_scores.length;

  function scoreBand(score: number) {
    if (score >= 75) return t.results.strong;
    if (score >= 65) return t.results.good;
    if (score >= 50) return t.results.developing;
    return t.results.emerging;
  }

  return (
    <div className="relative min-h-full bg-slate-50 dark:bg-slate-900">
      <PageAmbient />

      {/* ── Hero strip ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-slate-200/60 dark:border-slate-800/70">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/40 dark:from-slate-800/50 dark:via-slate-900 dark:to-slate-900" />
        <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-40 w-56 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/8" />

        <div className="relative px-8 py-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-500 dark:text-indigo-400">
            {t.results.assessmentResults}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            Junior Software Engineer — Capability Assessment
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t.results.completedLabel}{" "}
            {new Date("2026-06-08T10:15:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      <div className="px-8 py-7">

        {/* Summary strip */}
        <div className="mb-7 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-center dark:border-slate-700 dark:bg-slate-800">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{completionPct}%</p>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{t.results.completedLabel}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-center dark:border-slate-700 dark:bg-slate-800">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalDomains}</p>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{t.results.domainsScored}</p>
          </div>
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-4 text-center">
            <p className="text-xs font-medium text-amber-500 dark:text-amber-400">
              {result.release_state}
            </p>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-600">{t.results.releaseState}</p>
          </div>
        </div>

        {/* Provisional notice */}
        <div className="mb-7 flex items-start gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-xs leading-relaxed text-indigo-600 dark:text-indigo-300/80">
            {t.results.provisionalNotice}
          </p>
        </div>

        {/* Domain score cards */}
        <div className="mb-7">
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
            {t.results.domainScores}
          </h2>

          <div className="grid gap-4 xl:grid-cols-2">
            {cv.domain_scores.map((domain: DomainScore) => {
              const visibleDims = candidateVisibleDimensions(domain.dimensions);
              if (visibleDims.length === 0) return null;

              const dc   = scoreColor(domain.standardized_score);
              const band = scoreBand(domain.standardized_score);

              return (
                <div key={domain.domain_id} className={`overflow-hidden rounded-xl border bg-white dark:bg-slate-800 ${dc.ring}`}>
                  {/* Domain header */}
                  <div className="flex items-center justify-between border-b border-slate-200/60 px-5 py-4 dark:border-slate-700/60">
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {domain.domain_id}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {domain.domain_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1.5 text-xs ${
                        domain.confidence === "HIGH" ? "text-emerald-500 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${CONFIDENCE_DOT[domain.confidence]}`} aria-hidden />
                        {domain.confidence === "HIGH" ? t.results.highConfidence : t.results.provisional}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Composite score */}
                    <div className="mb-4 flex items-end gap-3">
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {t.results.overallScore}
                        </p>
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-3xl font-bold tabular-nums ${dc.text}`}>
                            {domain.standardized_score}
                          </span>
                          <span className="text-slate-400 dark:text-slate-600">/100</span>
                        </div>
                      </div>
                      <span className={`mb-1 rounded-full px-2 py-0.5 text-xs font-medium ${dc.text} bg-slate-100 dark:bg-slate-700/50`}>
                        {band}
                      </span>
                    </div>
                    <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div className={`h-1.5 rounded-full ${dc.bar}`} style={{ width: `${domain.standardized_score}%` }} />
                    </div>

                    {/* Dimensions */}
                    <div className="space-y-3">
                      {visibleDims.map((dim: DimensionScore) => {
                        const ddc = scoreColor(dim.standardized_score);
                        const isCaution = dim.display_state === "visible_with_caution";
                        return (
                          <div key={dim.dimension_id}>
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-600 dark:text-slate-300">
                                  {dim.dimension_name}
                                </span>
                                {isCaution && (
                                  <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-500">
                                    {t.results.provisional}
                                  </span>
                                )}
                              </div>
                              <span className={`font-mono text-xs font-bold ${ddc.text}`}>
                                {dim.standardized_score}
                              </span>
                            </div>
                            <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                              <div className={`h-1 rounded-full ${ddc.bar}`} style={{ width: `${dim.standardized_score}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Development suggestions */}
        <div className="mb-7 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
            {t.results.developmentSuggestions}
          </h2>
          <ul className="space-y-3">
            {cv.development_suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {suggestion}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/candidate/report/demo"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:from-indigo-700 hover:to-violet-700"
          >
            {t.results.viewFullReport}
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link
            href="/candidate/dashboard"
            className="flex flex-1 items-center justify-center rounded-lg border border-slate-200 px-6 py-3 text-sm font-medium text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            {t.results.returnToDashboard}
          </Link>
        </div>

      </div>
    </div>
  );
}
