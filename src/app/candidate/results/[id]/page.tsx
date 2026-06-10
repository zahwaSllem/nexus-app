import Link from "next/link";
import { SCORED_RESULT_1 } from "@/lib/mock-data/scored-results";
import { REPORT_1 } from "@/lib/mock-data/reports";
import type { DomainScore, DimensionScore } from "@/lib/types/nexus";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 75) return { bar: "bg-emerald-500", text: "text-emerald-400", ring: "border-emerald-500/30" };
  if (score >= 65) return { bar: "bg-blue-500",    text: "text-blue-400",    ring: "border-blue-500/30" };
  if (score >= 50) return { bar: "bg-amber-500",   text: "text-amber-400",   ring: "border-amber-500/30" };
  return               { bar: "bg-slate-500",   text: "text-slate-400",   ring: "border-slate-600" };
}

function scoreBand(score: number) {
  if (score >= 75) return "Strong";
  if (score >= 65) return "Good";
  if (score >= 50) return "Developing";
  return "Emerging";
}

const CONFIDENCE_DOT: Record<string, string> = {
  HIGH:     "bg-emerald-500",
  MODERATE: "bg-amber-400",
  LOW:      "bg-slate-600",
};

// ─── Only show dimensions the candidate is allowed to see ─────────────────────

function candidateVisibleDimensions(dims: DimensionScore[]) {
  return dims.filter(
    (d) => d.display_state === "visible" || d.display_state === "visible_with_caution"
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CandidateResultsPage() {
  // For the demo, use SCORED_RESULT_1 regardless of [id].
  const result   = SCORED_RESULT_1;
  const report   = REPORT_1;
  const cv       = report.candidate_view;

  const totalDomains   = result.domain_scores.length;
  const completionPct  = Math.round(result.completion_ratio * 100);

  return (
    <div className="min-h-screen bg-slate-900">

      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/candidate/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-sm text-white">
              N
            </div>
            <span className="text-base font-semibold text-white">Nexus</span>
          </Link>
          <Link
            href="/candidate/dashboard"
            className="flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-slate-200"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">

        {/* Page title */}
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-400">
            Assessment Results
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">
            Junior Software Engineer — Capability Assessment
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Completed {new Date("2026-06-08T10:15:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Summary strip */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-white">{completionPct}%</p>
            <p className="mt-0.5 text-xs text-slate-500">Completed</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-white">{totalDomains}</p>
            <p className="mt-0.5 text-xs text-slate-500">Domains scored</p>
          </div>
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-center">
            <p className="text-xs font-medium text-amber-400">{result.release_state}</p>
            <p className="mt-0.5 text-xs text-slate-600">Release state</p>
          </div>
        </div>

        {/* Provisional notice */}
        <div className="mb-8 flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-blue-400">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-xs leading-relaxed text-blue-300/80">
            These scores are provisional (version 1.0.0-provisional) and intended for developmental feedback only.
            They are not normatively validated and should not be used as performance evaluations.
          </p>
        </div>

        {/* Domain score cards */}
        <div className="mb-8 space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Domain Scores
          </h2>

          {cv.domain_scores.map((domain: DomainScore) => {
            const visibleDims = candidateVisibleDimensions(domain.dimensions);
            if (visibleDims.length === 0) return null;

            const dc = scoreColor(domain.standardized_score);
            const band = scoreBand(domain.standardized_score);

            return (
              <div key={domain.domain_id} className={`rounded-xl border bg-slate-800 overflow-hidden ${dc.ring}`}>
                {/* Domain header */}
                <div className="flex items-center justify-between border-b border-slate-700/60 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-slate-700 px-2 py-0.5 font-mono text-xs font-bold text-slate-300">
                      {domain.domain_id}
                    </span>
                    <span className="text-sm font-semibold text-white">{domain.domain_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 text-xs ${
                      domain.confidence === "HIGH" ? "text-emerald-400" : "text-amber-400"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${CONFIDENCE_DOT[domain.confidence]}`} />
                      {domain.confidence === "HIGH" ? "High confidence" : "Provisional"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  {/* Composite */}
                  <div className="mb-4 flex items-end gap-3">
                    <div>
                      <p className="text-xs text-slate-500">Overall Score</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-3xl font-bold tabular-nums ${dc.text}`}>
                          {domain.standardized_score}
                        </span>
                        <span className="text-slate-600">/100</span>
                      </div>
                    </div>
                    <span className={`mb-1 rounded-full px-2 py-0.5 text-xs font-medium ${dc.text} bg-slate-700/50`}>
                      {band}
                    </span>
                  </div>
                  <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                    <div
                      className={`h-1.5 rounded-full ${dc.bar}`}
                      style={{ width: `${domain.standardized_score}%` }}
                    />
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
                              <span className="text-xs text-slate-300">{dim.dimension_name}</span>
                              {isCaution && (
                                <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-500">
                                  provisional
                                </span>
                              )}
                            </div>
                            <span className={`font-mono text-xs font-bold ${ddc.text}`}>
                              {dim.standardized_score}
                            </span>
                          </div>
                          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-700">
                            <div
                              className={`h-1 rounded-full ${ddc.bar}`}
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
        </div>

        {/* Development suggestions */}
        <div className="mb-8 rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Development Suggestions</h2>
          <ul className="space-y-3">
            {cv.development_suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-400">
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed text-slate-300">{suggestion}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/candidate/report/demo"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
          >
            View Full Report
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link
            href="/candidate/dashboard"
            className="flex flex-1 items-center justify-center rounded-lg border border-slate-700 px-6 py-3 text-sm font-medium text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-slate-200"
          >
            Return to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}
