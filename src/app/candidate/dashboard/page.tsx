"use client";

import Link from "next/link";
import { ASSIGNMENT_1, ASSIGNMENT_3 } from "@/lib/mock-data/assignments";
import { SCORED_RESULT_1 } from "@/lib/mock-data/scored-results";
import { useLanguage } from "@/lib/providers/language-provider";
import { PageAmbient } from "@/components/layout/PageAmbient";

// ── Mock data ──────────────────────────────────────────────────────────────────

const CANDIDATE = { name: "Alex Jordan", id: "cand-001", email: "candidate@nexus.io" };

const ASSESSMENTS = [
  {
    assignment: ASSIGNMENT_1,
    title: "Junior Software Engineer — Capability Assessment",
    organization: "Nexus Platform Demo",
    domains: ["D1", "D2", "D4"],
    estimatedDuration: "35 min",
    actionHref: "/assessment",
    actionType: "start" as const,
  },
  {
    assignment: ASSIGNMENT_3,
    title: "Junior Software Engineer — Capability Assessment",
    organization: "Nexus Platform Demo",
    domains: ["D1", "D2", "D4"],
    estimatedDuration: "35 min",
    actionHref: "/candidate/results/demo",
    actionType: "results" as const,
  },
];

const DOMAIN_COLORS: Record<string, string> = {
  D1: "bg-indigo-500",
  D2: "bg-amber-500",
  D4: "bg-violet-500",
};

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CandidateDashboardPage() {
  const { t } = useLanguage();

  const completedCount = ASSESSMENTS.filter((a) => a.assignment.status === "completed").length;
  const pendingCount   = ASSESSMENTS.filter((a) => a.assignment.status === "not_started").length;

  const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string }> = {
    not_started: { label: t.candidate.notStarted, dot: "bg-slate-400 dark:bg-slate-600",  text: "text-slate-500 dark:text-slate-400" },
    in_progress:  { label: t.candidate.inProgress, dot: "bg-amber-500",                    text: "text-amber-500 dark:text-amber-400" },
    completed:    { label: t.candidate.completed,  dot: "bg-emerald-500",                  text: "text-emerald-500 dark:text-emerald-400" },
    expired:      { label: t.candidate.expired,    dot: "bg-red-500",                      text: "text-red-500 dark:text-red-400" },
  };

  return (
    <div className="relative min-h-full bg-slate-50 dark:bg-slate-900">
      <PageAmbient />

      {/* ── Hero strip ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-slate-200/60 dark:border-slate-800/70">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/40 dark:from-slate-800/50 dark:via-slate-900 dark:to-slate-900" />
        <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-40 w-56 rounded-full bg-indigo-400/12 blur-3xl dark:bg-indigo-500/8" />
        <div aria-hidden className="pointer-events-none absolute -bottom-4 left-1/3 h-24 w-40 rounded-full bg-violet-400/8 blur-2xl dark:bg-violet-500/6" />

        <div className="relative px-8 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-500 dark:text-indigo-400">
                {t.candidate.portalLabel}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {t.candidate.greeting}, {CANDIDATE.name.split(" ")[0]}.
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {pendingCount > 0 && (
                  <>
                    {t.candidate.youHave}{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {pendingCount} {pendingCount !== 1 ? t.candidate.assessmentsPending : t.candidate.assessmentPending}
                    </span>
                    {completedCount > 0 ? ` ${t.candidate.and} ` : "."}
                  </>
                )}
                {completedCount > 0 && (
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {completedCount} {t.candidate.completedLabel}.
                  </span>
                )}
              </p>
            </div>

            {/* Status chips */}
            <div className="flex flex-wrap items-center gap-2">
              {pendingCount > 0 && (
                <span className="flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/8 px-3 py-1.5 text-xs font-medium text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
                  {pendingCount} {t.candidate.assessmentsPending}
                </span>
              )}
              {completedCount > 0 && (
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                  {completedCount} {t.candidate.completedLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      <div className="px-8 py-7">
        <div className="grid gap-6 xl:grid-cols-3">

          {/* Assessment list — col-span-2 */}
          <div className="space-y-4 xl:col-span-2">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
              {t.candidate.yourAssessments}
            </h2>

            {ASSESSMENTS.map(({ assignment, title, organization, domains, estimatedDuration, actionHref, actionType }) => {
              const status = STATUS_CONFIG[assignment.status];
              const isCompleted = assignment.status === "completed";

              return (
                <div
                  key={assignment.assignment_id}
                  className={`relative overflow-hidden rounded-xl border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-800 ${
                    isCompleted
                      ? "border-emerald-500/25 hover:border-emerald-500/40"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                  }`}
                >
                  {/* Top accent bar */}
                  <div className={`absolute inset-x-0 top-0 h-0.5 ${isCompleted ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-indigo-500 to-violet-500"}`} />

                  <div className="p-5 pt-5">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                          {organization}
                        </p>
                        <h3 className="mt-0.5 text-base font-semibold text-slate-900 dark:text-white">
                          {title}
                        </h3>
                      </div>
                      <span className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-medium ${status.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden />
                        {status.label}
                      </span>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-3 text-xs text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {isCompleted
                          ? `${t.candidate.completedOn} ${new Date(assignment.completed_at!).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                          : `${t.candidate.dueOn} ${new Date(assignment.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {estimatedDuration}
                      </span>
                    </div>

                    <div className="mb-5 flex gap-1.5">
                      {domains.map((d) => (
                        <span
                          key={d}
                          className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                        >
                          {d}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={actionHref}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                        isCompleted
                          ? "bg-emerald-600 text-white hover:bg-emerald-500"
                          : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700"
                      }`}
                    >
                      {actionType === "start" ? t.candidate.startAssessment : t.candidate.viewResultsLink}
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right panel — results summary */}
          <div className="space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
              {t.candidate.latestResult}
            </h2>

            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
              <div className="p-5 pt-5">
                <p className="mb-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
                  {t.candidate.releaseState}
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-500 dark:text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden />
                  {SCORED_RESULT_1.release_state}
                </span>

                <div className="mt-4 space-y-3">
                  {SCORED_RESULT_1.domain_scores.map((domain) => (
                    <div key={domain.domain_id}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                          {domain.domain_id}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {domain.standardized_score}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className={`h-1.5 rounded-full ${DOMAIN_COLORS[domain.domain_id] ?? "bg-slate-400"}`}
                          style={{ width: `${domain.standardized_score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-2">
                  <Link
                    href="/candidate/results/demo"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 py-2 text-xs font-semibold text-white transition-all hover:from-indigo-700 hover:to-violet-700"
                  >
                    {t.candidate.viewResults}
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                  <Link
                    href="/candidate/report/demo"
                    className="flex w-full items-center justify-center rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200"
                  >
                    {t.candidate.fullReport}
                  </Link>
                </div>
              </div>
            </div>

            {/* Governance notice */}
            <div className="rounded-xl border border-slate-200/60 bg-slate-100/60 p-4 dark:border-slate-700/60 dark:bg-slate-800/60">
              <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                {t.candidate.aboutResults}
              </p>
              <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-600">
                {t.candidate.provisionalNote}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
