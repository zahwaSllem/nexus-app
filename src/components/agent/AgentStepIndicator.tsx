import { cn } from "@/lib/utils";

const STEPS = [
  { n: 1, label: "Interview" },
  { n: 2, label: "Role Blueprint" },
  { n: 3, label: "Assessment" },
  { n: 4, label: "Governance" },
  { n: 5, label: "Approval" },
] as const;

interface AgentStepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
}

export function AgentStepIndicator({ currentStep }: AgentStepIndicatorProps) {
  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const isComplete = step.n < currentStep;
        const isActive = step.n === currentStep;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={step.n} className="flex items-center">
            {/* Node + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                  isComplete
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white ring-4 ring-indigo-500/20 shadow-[0_0_14px_0_rgba(99,102,241,0.30)]"
                    : "border border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500",
                )}
              >
                {isComplete ? (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.n
                )}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-xs transition-colors duration-200",
                  isComplete
                    ? "font-medium text-emerald-600 dark:text-emerald-400"
                    : isActive
                    ? "font-semibold text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400 dark:text-slate-600",
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {!isLast && (
              <div
                className={cn(
                  "mx-2 mb-5 h-px w-12 transition-all duration-500 sm:w-16",
                  isComplete
                    ? "bg-gradient-to-r from-emerald-500/70 to-emerald-400/40 dark:from-emerald-500/60 dark:to-emerald-400/30"
                    : "bg-slate-200 dark:bg-slate-700",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
