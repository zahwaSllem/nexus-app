import Link from "next/link";
import { ASSIGNMENT_1, ASSIGNMENT_3 } from "@/lib/mock-data/assignments";
import { SCORED_RESULT_1 } from "@/lib/mock-data/scored-results";

// ─── Derived display data ──────────────────────────────────────────────────────

const CANDIDATE = {
  name: "Alex Jordan",
  id: "cand-001",
  email: "candidate@nexus.io",
};

const ASSESSMENTS = [
  {
    assignment: ASSIGNMENT_1,
    title: "Junior Software Engineer — Capability Assessment",
    organization: "Nexus Platform Demo",
    domains: ["D1", "D2", "D4"],
    estimatedDuration: "35 min",
    action: { label: "Start Assessment →", href: "/assessment" },
  },
  {
    assignment: ASSIGNMENT_3,
    title: "Junior Software Engineer — Capability Assessment",
    organization: "Nexus Platform Demo",
    domains: ["D1", "D2", "D4"],
    estimatedDuration: "35 min",
    action: { label: "View Results →", href: "/candidate/results/demo" },
  },
];

const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string }> = {
  not_started: { label: "Not Started", dot: "bg-slate-600", text: "text-slate-400" },
  in_progress:  { label: "In Progress", dot: "bg-amber-500",  text: "text-amber-400" },
  completed:    { label: "Completed",   dot: "bg-emerald-500", text: "text-emerald-400" },
  expired:      { label: "Expired",     dot: "bg-red-500",    text: "text-red-400" },
};

// ─── Score preview from latest completed result ────────────────────────────────

const DOMAIN_COLORS: Record<string, string> = {
  D1: "bg-blue-600",
  D2: "bg-amber-500",
  D4: "bg-violet-500",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CandidateDashboardPage() {
  const completedCount = ASSESSMENTS.filter((a) => a.assignment.status === "completed").length;
  const pendingCount   = ASSESSMENTS.filter((a) => a.assignment.status === "not_started").length;

  return (
    <div className="min-h-screen bg-slate-900">

      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-sm text-white">
              N
            </div>
            <span className="text-base font-semibold text-white">Nexus</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-200">{CANDIDATE.name}</p>
              <p className="font-mono text-xs text-slate-500">{CANDIDATE.id}</p>
            </div>
            <Link
              href="/logout"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* Welcome */}
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-400">
            Candidate Portal
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Good day, {CANDIDATE.name.split(" ")[0]}.
          </h1>
          <p className="mt-1.5 text-slate-400">
            {pendingCount > 0 && (
              <span>
                You have{" "}
                <span className="font-medium text-slate-200">{pendingCount} assessment{pendingCount !== 1 ? "s" : ""} pending</span>
                {completedCount > 0 ? " and " : "."}
              </span>
            )}
            {completedCount > 0 && (
              <span>
                <span className="font-medium text-emerald-400">{completedCount} completed</span>
                {pendingCount > 0 ? "." : " assessment"}{completedCount > 0 && pendingCount === 0 ? "s completed." : ""}
              </span>
            )}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Assessment list */}
          <div className="space-y-4 lg:col-span-2">
            <h2 className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Your Assessments
            </h2>

            {ASSESSMENTS.map(({ assignment, title, organization, domains, estimatedDuration, action }) => {
              const status = STATUS_CONFIG[assignment.status];
              const isCompleted = assignment.status === "completed";

              return (
                <div
                  key={assignment.assignment_id}
                  className={`rounded-xl border bg-slate-800 p-5 transition-shadow hover:shadow-md ${
                    isCompleted ? "border-emerald-500/25" : "border-slate-700"
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500">{organization}</p>
                      <h3 className="mt-0.5 text-base font-semibold text-white">{title}</h3>
                    </div>
                    <span className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-medium ${status.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {isCompleted
                        ? `Completed ${new Date(assignment.completed_at!).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                        : `Due ${new Date(assignment.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
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
                        className="rounded bg-slate-700 px-2 py-0.5 font-mono text-xs font-bold text-slate-400"
                      >
                        {d}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={action.href}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      isCompleted
                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                        : "bg-blue-700 text-white hover:bg-blue-600"
                    }`}
                  >
                    {action.label}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Right sidebar: latest result summary */}
          <div className="space-y-4">
            <h2 className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Latest Result
            </h2>

            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
              <p className="mb-1 text-xs font-medium text-slate-500">Release State</p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {SCORED_RESULT_1.release_state}
              </span>

              <div className="mt-4 space-y-3">
                {SCORED_RESULT_1.domain_scores.map((domain) => (
                  <div key={domain.domain_id}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-500">{domain.domain_id}</span>
                      <span className="font-mono text-xs font-bold text-white">{domain.standardized_score}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                      <div
                        className={`h-1.5 rounded-full ${DOMAIN_COLORS[domain.domain_id] ?? "bg-slate-500"}`}
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
                  View Results
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link
                  href="/candidate/report/demo"
                  className="flex w-full items-center justify-center rounded-lg border border-slate-700 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
                >
                  Full Report
                </Link>
              </div>
            </div>

            {/* Governance notice — candidate-safe */}
            <div className="rounded-xl border border-slate-700/60 bg-slate-800/60 p-4">
              <p className="mb-2 text-xs font-medium text-slate-500">About Your Results</p>
              <p className="text-xs leading-relaxed text-slate-600">
                Your results are provisional and intended for developmental feedback. Scores are on a
                0–100 scale. Percentile comparisons are not yet available.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
