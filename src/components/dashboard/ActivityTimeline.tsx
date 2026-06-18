"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/providers/language-provider";
import {
  formatActivityDate,
  type ActivityEvent,
  type ActivityType,
} from "@/lib/analytics/dashboard-analytics";

const TYPE_STYLE: Record<ActivityType, { dot: string; ring: string }> = {
  assigned:  { dot: "bg-indigo-500",  ring: "ring-indigo-500/20" },
  completed: { dot: "bg-emerald-500", ring: "ring-emerald-500/20" },
  released:  { dot: "bg-violet-500",  ring: "ring-violet-500/20" },
};

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  const { t } = useLanguage();
  const a = t.dashboard.analytics;

  const typeLabel: Record<ActivityType, string> = {
    assigned: a.evtAssigned,
    completed: a.evtCompleted,
    released: a.evtReleased,
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-800 dark:shadow-card">
      <div className="border-b border-slate-200/80 px-6 py-4 dark:border-slate-700/60">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{a.timelineTitle}</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{a.timelineSubtitle}</p>
      </div>

      <div className="p-6">
        {events.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">{a.noActivity}</p>
        ) : (
          <ol className="relative space-y-5">
            {/* vertical track */}
            <span
              className="absolute left-[5px] top-1 bottom-1 w-px bg-slate-200 dark:bg-slate-700"
              aria-hidden
            />
            {events.map((e) => {
              const style = TYPE_STYLE[e.type];
              return (
                <li key={e.id} className="relative flex gap-4 ps-0">
                  <span
                    className={cn(
                      "relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-white dark:ring-slate-800",
                      style.dot,
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {e.candidateName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {typeLabel[e.type]}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
                    {formatActivityDate(e.timestamp)}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
