import { cn } from "@/lib/utils";

const STEPS = [
  { n: 1, label: "Interview" },
  { n: 2, label: "Role Blueprint" },
  { n: 3, label: "Assessment" },
  { n: 4, label: "Governance" },
  { n: 5, label: "Approval" },
] as const;

const STEP_DESCRIPTIONS: Record<number, string> = {
  1: "AI interviews you about the role",
  2: "Review AI-generated blueprint",
  3: "Verify item selection & coverage",
  4: "Acknowledge governance items",
  5: "Give final sign-off to activate",
};

interface AgentStepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
}

// ─── Desktop: vertical step rail ──────────────────────────────────────────────

export function AgentStepIndicator({ currentStep }: AgentStepIndicatorProps) {
  return (
    <nav aria-label="Workflow steps">
      {STEPS.map((step, i) => {
        const isComplete = step.n < currentStep;
        const isActive = step.n === currentStep;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={step.n}>
            {/* Step card */}
            <div
              className={cn(
                "relative flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all duration-300",
                isActive
                  ? "bg-indigo-50/70 ring-1 ring-indigo-200/60 dark:bg-indigo-500/8 dark:ring-indigo-500/20"
                  : "",
              )}
            >
              {/* Step node */}
              <div className="relative z-10 shrink-0 pt-0.5">
                {isActive && (
                  <span
                    className="absolute -inset-1 rounded-full bg-indigo-400/20 animate-ping"
                    style={{ animationDuration: "2s" }}
                    aria-hidden
                  />
                )}
                <div
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300",
                    isComplete
                      ? "bg-emerald-500 text-white"
                      : isActive
                      ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-[0_0_20px_0_rgba(99,102,241,0.40)]"
                      : "border-2 border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500",
                  )}
                >
                  {isComplete ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step.n
                  )}
                </div>
              </div>

              {/* Labels */}
              <div
                className={cn(
                  "min-w-0 flex-1 transition-opacity duration-300",
                  isActive ? "opacity-100" : isComplete ? "opacity-70" : "opacity-45",
                )}
              >
                <p
                  className={cn(
                    "text-sm font-semibold leading-tight",
                    isActive
                      ? "text-indigo-700 dark:text-indigo-300"
                      : "text-slate-700 dark:text-slate-300",
                  )}
                >
                  {step.label}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                  {STEP_DESCRIPTIONS[step.n]}
                </p>
              </div>
            </div>

            {/* Connector between steps */}
            {!isLast && (
              <div
                className={cn(
                  "ml-[27px] h-5 w-0.5 transition-colors duration-500",
                  isComplete
                    ? "bg-emerald-500/60 dark:bg-emerald-500/50"
                    : "bg-slate-200 dark:bg-slate-700",
                )}
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ─── Mobile: compact horizontal progress bar ───────────────────────────────────

export function AgentMobileStepBar({ currentStep }: AgentStepIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 items-center gap-1">
        {STEPS.map((step) => (
          <div
            key={step.n}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-500",
              step.n < currentStep
                ? "bg-emerald-500"
                : step.n === currentStep
                ? "bg-gradient-to-r from-indigo-500 to-violet-500"
                : "bg-slate-200 dark:bg-slate-700",
            )}
          />
        ))}
      </div>
      <span className="shrink-0 text-xs font-medium text-slate-400 dark:text-slate-500">
        {currentStep} / {STEPS.length}
      </span>
    </div>
  );
}
