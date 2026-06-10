import type { BlueprintApprovalStatus } from "@/lib/types/nexus";

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
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs transition-all ${
                  isComplete
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-600"
                }`}
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
                className={`whitespace-nowrap text-xs ${
                  isComplete
                    ? "text-emerald-400"
                    : isActive
                    ? "font-medium text-white"
                    : "text-slate-600"
                }`}
              >
                {stage.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`mx-2 mb-4 h-px w-8 ${
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
