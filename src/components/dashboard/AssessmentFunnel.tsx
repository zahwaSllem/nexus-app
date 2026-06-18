"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/providers/language-provider";
import type { FunnelStage, FunnelStageKey } from "@/lib/analytics/dashboard-analytics";

const STAGE_STYLE: Record<FunnelStageKey, { bar: string; dot: string; text: string }> = {
  assigned:    { bar: "bg-gradient-to-r from-indigo-500 to-indigo-400", dot: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400" },
  in_progress: { bar: "bg-gradient-to-r from-sky-500 to-sky-400",       dot: "bg-sky-500",    text: "text-sky-600 dark:text-sky-400" },
  completed:   { bar: "bg-gradient-to-r from-emerald-500 to-emerald-400", dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  released:    { bar: "bg-gradient-to-r from-violet-500 to-violet-400", dot: "bg-violet-500", text: "text-violet-600 dark:text-violet-400" },
};

export function AssessmentFunnel({ stages }: { stages: FunnelStage[] }) {
  const { t } = useLanguage();
  const a = t.dashboard.analytics;

  const stageLabel: Record<FunnelStageKey, string> = {
    assigned: a.stageAssigned,
    in_progress: a.stageInProgress,
    completed: a.stageCompleted,
    released: a.stageReleased,
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-800 dark:shadow-card">
      <div className="border-b border-slate-200/80 px-6 py-4 dark:border-slate-700/60">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{a.funnelTitle}</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{a.funnelSubtitle}</p>
      </div>

      <div className="space-y-5 p-6">
        {stages.map((stage, i) => {
          const style = STAGE_STYLE[stage.key];
          return (
            <div key={stage.key}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", style.dot)} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {stageLabel[stage.key]}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                    {stage.count}
                  </span>
                  {i > 0 && (
                    <span className={cn("text-[11px] font-medium tabular-nums", style.text)}>
                      {stage.conversionPct}% {a.conversion}
                    </span>
                  )}
                </div>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
                <div
                  className={cn("h-2.5 rounded-full transition-[width] duration-700 ease-out", style.bar)}
                  style={{ width: `${Math.max(stage.widthPct, stage.count > 0 ? 4 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
