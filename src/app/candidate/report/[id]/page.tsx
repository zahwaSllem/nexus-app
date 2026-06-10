import Link from "next/link";
import { REPORT_1 } from "@/lib/mock-data/reports";
import type { DomainScore, DimensionScore, BehavioralDescriptor, BlockedSectionReason } from "@/lib/types/nexus";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 75) return { bar: "bg-emerald-500", text: "text-emerald-400" };
  if (score >= 65) return { bar: "bg-blue-500",    text: "text-blue-400"    };
  if (score >= 50) return { bar: "bg-amber-500",   text: "text-amber-400"   };
  return               { bar: "bg-slate-500",   text: "text-slate-400"   };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CandidateReportPage() {
  // For the demo, use REPORT_1.candidate_view regardless of [id].
  const cv = REPORT_1.candidate_view;

  // Collect descriptors as a map for fast lookup
  const descriptorMap = new Map<string, string>(
    cv.behavioral_descriptors.map((d: BehavioralDescriptor) => [d.dimension_id, d.text])
  );

  return (
    <div className="min-h-screen bg-slate-900">

      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-sm text-white">
              N
            </div>
            <span className="text-base font-semibold text-white">Nexus</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/candidate/results/demo"
              className="flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-slate-200"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Results
            </Link>
            <Link
              href="/logout"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">

        {/* Report header */}
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-400">
            Developmental Feedback Report
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">
            Junior Software Engineer — Capability Assessment
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Completed 8 June 2026 · Release state:{" "}
            <span className="text-amber-400">{REPORT_1.release_state}</span>
          </p>
        </div>

        {/* Candidate-safe disclaimer */}
        <div className="mb-8 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-4">
          <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-emerald-400">Your Personal Development Report</p>
            <p className="mt-1 text-xs leading-relaxed text-emerald-300/70">
              This report is prepared for you personally. It describes your tendencies and patterns based on your
              assessment responses. The feedback is developmental — it is not a performance evaluation and should not
              be treated as a hiring decision. Discuss these findings with your manager or a development coach.
            </p>
          </div>
        </div>

        {/* Domain sections with behavioral descriptors */}
        <div className="mb-8 space-y-6">
          <h2 className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Your Profile
          </h2>

          {cv.domain_scores.map((domain: DomainScore) => {
            const visibleDims = domain.dimensions.filter(
              (d) => d.display_state === "visible" || d.display_state === "visible_with_caution"
            );
            if (visibleDims.length === 0) return null;

            return (
              <div key={domain.domain_id} className="rounded-xl border border-slate-700 bg-slate-800 overflow-hidden">
                {/* Domain header */}
                <div className="flex items-center gap-3 border-b border-slate-700/60 px-5 py-4">
                  <span className="rounded bg-slate-700 px-2 py-0.5 font-mono text-xs font-bold text-slate-300">
                    {domain.domain_id}
                  </span>
                  <h3 className="text-sm font-semibold text-white">{domain.domain_name}</h3>
                  <div className="ml-auto text-right">
                    <span className={`text-lg font-bold tabular-nums ${scoreColor(domain.standardized_score).text}`}>
                      {domain.standardized_score}
                    </span>
                    <span className="text-xs text-slate-600">/100</span>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {visibleDims.map((dim: DimensionScore) => {
                    const dc = scoreColor(dim.standardized_score);
                    const descriptor = descriptorMap.get(dim.dimension_id);
                    const isCaution = dim.display_state === "visible_with_caution";

                    return (
                      <div key={dim.dimension_id} className="space-y-2">
                        {/* Dimension score bar */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-200">{dim.dimension_name}</span>
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
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                          <div
                            className={`h-1.5 rounded-full ${dc.bar}`}
                            style={{ width: `${dim.standardized_score}%` }}
                          />
                        </div>

                        {/* Behavioral descriptor */}
                        {descriptor && (
                          <div className="rounded-lg bg-slate-700/30 px-4 py-3">
                            <p className="text-sm leading-relaxed text-slate-300">{descriptor}</p>
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

        {/* Development suggestions */}
        <div className="mb-8 rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h2 className="mb-1 text-sm font-semibold text-white">Development Suggestions</h2>
          <p className="mb-4 text-xs text-slate-500">
            These suggestions are based on your assessment profile and are designed to support your growth.
          </p>
          <ul className="space-y-3">
            {cv.development_suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-400">
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed text-slate-300">{suggestion}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Sections not yet available — gentle framing, no governance jargon */}
        {cv.blocked_section_notices.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Coming in a Future Report
            </h2>
            {cv.blocked_section_notices.map((notice: BlockedSectionReason) => (
              <div
                key={notice.section}
                className="flex items-start gap-3 rounded-xl border border-slate-700/50 bg-slate-800/60 px-4 py-3"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-slate-600">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-slate-400">{notice.section}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{notice.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer disclaimer */}
        <div className="mb-8 rounded-xl border border-slate-700/30 bg-slate-800/30 px-4 py-3">
          <p className="text-xs leading-relaxed text-slate-700">
            Nexus V1 · Report generated 8 June 2026 · Scores are provisional (scoring_version: 1.0.0-provisional).
            This report is for developmental use only and is not a normatively validated psychometric output.
            Not for use in clinical, diagnostic, or binding hiring decisions.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/candidate/results/demo"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-700 px-6 py-3 text-sm font-medium text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-slate-200"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Results
          </Link>
          <Link
            href="/candidate/dashboard"
            className="flex flex-1 items-center justify-center rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
          >
            Return to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}
