"use client";

import Link from "next/link";
import { ASSIGNMENT_1, ASSIGNMENT_3 } from "@/lib/mock-data/assignments";
import { SCORED_RESULT_1 } from "@/lib/mock-data/scored-results";
import { useLanguage } from "@/lib/providers/language-provider";
import { useTheme } from "@/lib/providers/theme-provider";
import type { Theme } from "@/lib/providers/theme-provider";
import { cn } from "@/lib/utils";

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
  D1: "bg-blue-600",
  D2: "bg-amber-500",
  D4: "bg-violet-500",
};

// ── Icons ──────────────────────────────────────────────────────────────────────

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  );
}
function MonitorIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
    </svg>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CandidateDashboardPage() {
  const { t, lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();

  const completedCount = ASSESSMENTS.filter((a) => a.assignment.status === "completed").length;
  const pendingCount   = ASSESSMENTS.filter((a) => a.assignment.status === "not_started").length;

  const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string }> = {
    not_started: { label: t.candidate.notStarted,  dot: "bg-slate-400 dark:bg-slate-600",  text: "text-slate-500 dark:text-slate-400" },
    in_progress:  { label: t.candidate.inProgress,  dot: "bg-amber-500",                    text: "text-amber-500 dark:text-amber-400" },
    completed:    { label: t.candidate.completed,   dot: "bg-emerald-500",                  text: "text-emerald-500 dark:text-emerald-400" },
    expired:      { label: t.candidate.expired,     dot: "bg-red-500",                      text: "text-red-500 dark:text-red-400" },
  };

  const themeOptions: { value: Theme; icon: React.ReactNode }[] = [
    { value: "light",  icon: <SunIcon /> },
    { value: "dark",   icon: <MoonIcon /> },
    { value: "system", icon: <MonitorIcon /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              N
            </div>
            <span className="text-base font-semibold text-slate-900 dark:text-white">
              {t.common.nexus}
            </span>
          </Link>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTheme(opt.value)}
                  title={t.theme[opt.value]}
                  className={cn(
                    "flex items-center justify-center rounded-md px-2 py-1.5 transition-all",
                    theme === opt.value
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
                  )}
                >
                  {opt.icon}
                </button>
              ))}
            </div>

            {/* Language toggle */}
            <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              {(["en", "ar"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
                    lang === l
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
                  )}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* User info + sign out */}
            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                  {CANDIDATE.name}
                </p>
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500">
                  {CANDIDATE.id}
                </p>
              </div>
              <Link
                href="/logout"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200"
              >
                {t.candidate.signOut}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* Welcome */}
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-600 dark:text-blue-400">
            {t.candidate.portalLabel}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {t.candidate.greeting}, {CANDIDATE.name.split(" ")[0]}.
          </h1>
          <p className="mt-1.5 text-slate-500 dark:text-slate-400">
            {pendingCount > 0 && (
              <span>
                {t.candidate.youHave}{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {pendingCount}{" "}
                  {pendingCount !== 1 ? t.candidate.assessmentsPending : t.candidate.assessmentPending}
                </span>
                {completedCount > 0 ? ` ${t.candidate.and} ` : ""}
              </span>
            )}
            {completedCount > 0 && (
              <span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {completedCount} {t.candidate.completedLabel}
                </span>
                {pendingCount === 0 ? "." : "."}
              </span>
            )}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Assessment list */}
          <div className="space-y-4 lg:col-span-2">
            <h2 className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.candidate.yourAssessments}
            </h2>

            {ASSESSMENTS.map(({ assignment, title, organization, domains, estimatedDuration, actionHref, actionType }) => {
              const status = STATUS_CONFIG[assignment.status];
              const isCompleted = assignment.status === "completed";

              return (
                <div
                  key={assignment.assignment_id}
                  className={`rounded-xl border bg-white p-5 transition-shadow hover:shadow-md dark:bg-slate-800 ${
                    isCompleted
                      ? "border-emerald-500/25"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        {organization}
                      </p>
                      <h3 className="mt-0.5 text-base font-semibold text-slate-900 dark:text-white">
                        {title}
                      </h3>
                    </div>
                    <span className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-medium ${status.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
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

                  <div className="mb-4 flex gap-1.5">
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
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      isCompleted
                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                        : "bg-blue-700 text-white hover:bg-blue-600"
                    }`}
                  >
                    {actionType === "start" ? t.candidate.startAssessment : t.candidate.viewResultsLink}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Right sidebar: latest result summary */}
          <div className="space-y-4">
            <h2 className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.candidate.latestResult}
            </h2>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <p className="mb-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                {t.candidate.releaseState}
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-500 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
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

              <div className="mt-4 space-y-2">
                <Link
                  href="/candidate/results/demo"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
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

            {/* Governance notice */}
            <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-4 dark:border-slate-700/60 dark:bg-slate-800/60">
              <p className="mb-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                {t.candidate.aboutResults}
              </p>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-600">
                {t.candidate.provisionalNote}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
