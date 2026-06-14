import type { BlueprintApprovalStatus } from "@/lib/types/nexus";
import { cn } from "@/lib/utils";

const STAGES: { key: BlueprintApprovalStatus; label: string }[] = [
  { key: "draft", label: "Draft" },
  { key: "reviewed", label: "Reviewed" },
  { key: "approved", label: "Approved" },
  { key: "validated", label: "Validated" },
];

const ORDER: Record<BlueprintApprovalStatus, number> = {
  draft: 0,
  reviewed: 1,
  approved: 2,
  validated: 3,
};

interface BlueprintStatusStepperProps {
  status: BlueprintApprovalStatus;
}

export function BlueprintStatusStepper({ status }: BlueprintStatusStepperProps) {
  const currentOrder = ORDER[status];

  return (
    <div className="flex items-center gap-0">
      {STAGES.map((stage, i) => {
        const stageOrder = ORDER[stage.key];
        const isComplete = stageOrder < currentOrder;
        const isActive = stageOrder === currentOrder;
        const isLast = i === STAGES.length - 1;

        return (
          <div key={stage.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-xs transition-all duration-200",
                  isComplete
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
                    : "border border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-500",
                )}
              >
                {isComplete ? (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-[10px] font-bold">{i + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-xs transition-colors duration-200",
                  isComplete
                    ? "text-emerald-600 dark:text-emerald-400"
                    : isActive
                    ? "font-medium text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400 dark:text-slate-600",
                )}
              >
                {stage.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "mx-2 mb-4 h-px w-8 transition-all duration-300",
                  isComplete
                    ? "bg-emerald-500/50"
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
