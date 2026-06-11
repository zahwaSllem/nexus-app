import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

// ─── Mock data ─────────────────────────────────────────────────────────────────

const CANDIDATE = {
  name: "Alex Jordan",
  id: "C-007",
  level: "Entry / Individual Contributor",
};

const ASSESSMENT = {
  title: "Nexus Capability Assessment V1",
  reference: "NSX-2026-0042",
  organization: "Nexus Platform Demo",
  jobTitle: "Software Engineer",
  level: "Entry / Individual Contributor",
  deadline: "Jun 15, 2026",
  estimatedDuration: "50–65 min",
  status: "Not Started",
};

const CONSENT = { confirmed: true, date: "Jun 8, 2026" };

const DOMAINS = [
  { code: "D1", name: "Personality Architecture", items: "~60 items", dimensions: 6 },
  { code: "D2", name: "Cognition",                items: "~40 items", dimensions: null },
  { code: "D3", name: "Motivations",              items: "~30 items", dimensions: null },
  { code: "D4", name: "Emotional & Social",        items: "~35 items", dimensions: null },
];

const MODULES = [
  { name: "Identity & Consent",            duration: "~2 min",    required: true  },
  { name: "Personality Architecture (D1)", duration: "20–25 min", required: true  },
  { name: "Cognition (D2)",                duration: "15–20 min", required: true  },
  { name: "Motivations (D3)",              duration: "~10 min",   required: false },
  { name: "Emotional & Social (D4)",       duration: "10–15 min", required: false },
];

const PROGRESS = { modulesCompleted: 0, totalModules: 5, percentage: 0 };

const ASSESSMENT_DETAILS = [
  { label: "Organization",  value: ASSESSMENT.organization },
  { label: "Job Title",     value: ASSESSMENT.jobTitle },
  { label: "Level",         value: ASSESSMENT.level },
  { label: "Deadline",      value: ASSESSMENT.deadline },
  { label: "Est. Duration", value: ASSESSMENT.estimatedDuration },
  { label: "Reference",     value: ASSESSMENT.reference },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AssessmentPortalPage() {
  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-900">

      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/candidate/dashboard"
              className="flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Dashboard
            </Link>
            <Link href="/candidate/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                N
              </div>
              <span className="text-base font-semibold text-slate-900 dark:text-white">Nexus</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{CANDIDATE.name}</p>
              <p className="font-mono text-xs text-slate-400 dark:text-slate-500">{CANDIDATE.id}</p>
            </div>
            <Link
              href="/logout"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200"
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-10">

        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Candidate Portal
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            Good day, {CANDIDATE.name.split(" ")[0]}.
          </h1>
          <p className="mt-1.5 text-slate-500 dark:text-slate-400">
            You have{" "}
            <span className="font-medium text-slate-700 dark:text-slate-200">1 assessment assigned</span>{" "}
            by <span className="font-medium text-slate-700 dark:text-slate-200">{ASSESSMENT.organization}</span>.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">

          {/* Assessment card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 lg:col-span-2">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Assigned Assessment
                </p>
                <h2 className="mt-1.5 text-lg font-bold text-slate-900 dark:text-white">
                  {ASSESSMENT.title}
                </h2>
              </div>
              <Badge variant="warning">Not Started</Badge>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {ASSESSMENT_DETAILS.map((row) => (
                <div key={row.label} className="rounded-lg bg-slate-100 px-4 py-3 dark:bg-slate-700/30">
                  <p className="text-xs text-slate-400 dark:text-slate-500">{row.label}</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-200">{row.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Consent Status
              </p>
              {CONSENT.confirmed ? (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-emerald-400">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-500 dark:text-emerald-400">Confirmed</p>
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Recorded {CONSENT.date}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/30">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-amber-400">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-400">Required</p>
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Must be confirmed before starting.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Progress
              </p>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">{PROGRESS.percentage}%</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {PROGRESS.modulesCompleted} / {PROGRESS.totalModules} modules
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${PROGRESS.percentage}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Not started</p>
            </div>
          </div>
        </div>

        {/* Domains included */}
        <div className="mt-6">
          <div className="mb-4 flex items-baseline justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Domains Included
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-600">
              4 of 6 domains · D5 deferred to Phase 2
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {DOMAINS.map((domain) => (
              <div key={domain.code} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-blue-500/10 px-2 py-0.5 font-mono text-xs font-bold text-blue-600 dark:text-blue-300">
                    {domain.code}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Included
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold leading-tight text-slate-900 dark:text-white">
                  {domain.name}
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{domain.items}</p>
                {domain.dimensions && (
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-600">
                    {domain.dimensions} dimensions
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modules checklist */}
        <div className="mt-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Assessment Modules
          </p>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {MODULES.map((mod, i) => (
                <div key={mod.name} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-400 dark:border-slate-600 dark:text-slate-500">
                      {i + 1}
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{mod.name}</span>
                    {mod.required && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                        Required
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{mod.duration}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-700 dark:bg-slate-700/20">
              <span className="text-xs text-slate-400 dark:text-slate-500">Total</span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">50–65 min</span>
            </div>
          </div>
        </div>

        {/* Instructions + CTA */}
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
            <div className="flex items-start gap-3">
              <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-amber-400">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-500 dark:text-amber-400">Before you begin</p>
                <p className="mt-1 text-xs leading-relaxed text-amber-600/80 dark:text-amber-300/70">
                  Find a quiet, uninterrupted space. The assessment takes approximately 50–65 minutes.
                  Do not close or refresh the browser once a session has started. There are no right or wrong answers — respond honestly and spontaneously.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/assessment/demo-session"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-4 text-base font-semibold text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
          >
            Start Assessment
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

      </div>
    </div>
  );
}
