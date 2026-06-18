"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/providers/language-provider";
import type { DomainAverage } from "@/lib/analytics/dashboard-analytics";

/** Color the score gauge by tier: strong ≥ 70, moderate ≥ 55, else developing. */
function tier(score: number): { bar: string; text: string } {
  if (score >= 70) return { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 55) return { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" };
  return { bar: "bg-red-500", text: "text-red-600 dark:text-red-400" };
}

export function DomainAnalytics({ domains }: { domains: DomainAverage[] }) {
  const { t } = useLanguage();
  const a = t.dashboard.analytics;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-800 dark:shadow-card">
      <div className="border-b border-slate-200/80 px-6 py-4 dark:border-slate-700/60">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{a.domainTitle}</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{a.domainSubtitle}</p>
      </div>

      <div className="p-6">
        {domains.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">{a.noData}</p>
        ) : (
          <div className="space-y-6">
            {domains.map((d) => {
              const tr = tier(d.avgScore);
              return (
                <div key={d.domain_id}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-300">
                        {d.domain_id}
                      </span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {d.domain_name}
                      </span>
                    </div>
                    <span className={cn("text-lg font-bold tabular-nums", tr.text)}>
                      {d.avgScore}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
                    <div
                      className={cn("h-2.5 rounded-full transition-[width] duration-700 ease-out", tr.bar)}
                      style={{ width: `${d.avgScore}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                    {d.sampleCount} {d.sampleCount === 1 ? a.sampleSingular : a.sampleLabel}
                    {" · "}
                    {d.dimensionCount} {a.dimensionsLabel}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
