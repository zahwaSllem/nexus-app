import Link from "next/link";

export default function AssessmentCompletePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">

      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/candidate/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              N
            </div>
            <span className="text-base font-semibold text-slate-900 dark:text-white">Nexus</span>
          </Link>
          <Link
            href="/candidate/dashboard"
            className="flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Candidate Dashboard
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-md text-center">

          {/* Success icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth={2.5}
              stroke="currentColor"
              className="h-10 w-10 text-emerald-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assessment Submitted</h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            Your responses have been recorded. Your results are now ready to view.
          </p>

          {/* What happens next */}
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 text-left dark:border-slate-700 dark:bg-slate-800">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
              What happens next
            </p>
            <ul className="space-y-2.5 text-sm">
              {[
                "Psychometric scoring and profile modeling",
                "Contextual interpretation against job-level benchmarks",
                "Governance review and audience-specific report generation",
              ].map((step) => (
                <li key={step} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  <span className="text-slate-500 dark:text-slate-400">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/candidate/results/demo"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
            >
              View My Results
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              href="/candidate/report/demo"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              View My Report
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              href="/candidate/dashboard"
              className="flex w-full items-center justify-center rounded-lg border border-slate-200/60 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600 dark:border-slate-700/60 dark:text-slate-500 dark:hover:border-slate-600 dark:hover:bg-slate-800/60 dark:hover:text-slate-300"
            >
              Return to Candidate Dashboard
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
