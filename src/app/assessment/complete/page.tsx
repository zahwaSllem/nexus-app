import Link from "next/link";

export default function AssessmentCompletePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-6">
      <div className="mx-auto max-w-md text-center">
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

        <h1 className="text-2xl font-bold text-white">Assessment Submitted</h1>
        <p className="mt-3 text-slate-400">
          Your responses have been recorded. Results will be processed and made available to your
          designated reviewer.
        </p>

        <div className="mt-8 rounded-xl border border-slate-700 bg-slate-800 p-5 text-left">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
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
                <span className="text-slate-400">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/assessment"
            className="flex w-full items-center justify-center rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
          >
            Return to Assessment Portal
          </Link>
          <Link
            href="/"
            className="flex w-full items-center justify-center rounded-lg border border-slate-700 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-slate-200"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
