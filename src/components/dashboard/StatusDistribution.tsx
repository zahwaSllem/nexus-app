"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/providers/language-provider";
import type { StatusSlice } from "@/lib/analytics/dashboard-analytics";
import type { AssignmentStatus } from "@/lib/types/nexus";

const STATUS_STYLE: Record<AssignmentStatus, { seg: string; dot: string }> = {
  not_started: { seg: "bg-slate-400 dark:bg-slate-500",   dot: "bg-slate-400 dark:bg-slate-500" },
  in_progress: { seg: "bg-amber-500",                      dot: "bg-amber-500" },
  completed:   { seg: "bg-emerald-500",                    dot: "bg-emerald-500" },
  expired:     { seg: "bg-red-500",                        dot: "bg-red-500" },
};

export function StatusDistribution({
  total,
  slices,
}: {
  total: number;
  slices: StatusSlice[];
}) {
  const { t } = useLanguage();
  const a = t.dashboard.analytics;

  const statusLabel: Record<AssignmentStatus, string> = {
    not_started: a.statusNotStarted,
    in_progress: a.statusInProgress,
    completed: a.statusCompleted,
    expired: a.statusExpired,
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-800 dark:shadow-card">
      <div className="border-b border-slate-200/80 px-6 py-4 dark:border-slate-700/60">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{a.statusTitle}</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{a.statusSubtitle}</p>
      </div>

      <div className="p-6">
        {/* Stacked segmented bar */}
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
          {slices.map((s) =>
            s.count > 0 ? (
              <div
                key={s.status}
                className={cn("h-3 transition-[width] duration-700 ease-out", STATUS_STYLE[s.status].seg)}
                style={{ width: `${s.pct}%` }}
                title={`${statusLabel[s.status]}: ${s.count}`}
              />
            ) : null,
          )}
        </div>

        {/* Legend */}
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
          {slices.map((s) => (
            <div key={s.status} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-sm", STATUS_STYLE[s.status].dot)} />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {statusLabel[s.status]}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                  {s.count}
                </span>
                <span className="text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
                  {s.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-slate-700/40 dark:text-slate-500">
          {total} {total === 1 ? a.assignmentSingular : a.assignmentsLabel}
        </p>
      </div>
    </div>
  );
}
