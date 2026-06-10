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
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const isComplete = step.n < currentStep;
        const isActive = step.n === currentStep;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={step.n} className="flex items-center">
            {/* Step node */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  isComplete
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-blue-600 text-white ring-2 ring-blue-500/40"
                    : "bg-slate-700 text-slate-500"
                }`}
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
                className={`whitespace-nowrap text-xs font-medium transition-colors ${
                  isComplete
                    ? "text-emerald-400"
                    : isActive
                    ? "text-white"
                    : "text-slate-600"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={`mx-2 mb-5 h-px w-12 transition-all sm:w-16 ${
                  isComplete ? "bg-emerald-500/50" : "bg-slate-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
