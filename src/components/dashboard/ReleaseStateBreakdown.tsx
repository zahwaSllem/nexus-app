"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/providers/language-provider";
import type { ReleaseBucket, ReleaseBucketKey } from "@/lib/analytics/dashboard-analytics";

const BUCKET_STYLE: Record<ReleaseBucketKey, { bar: string; dot: string; text: string }> = {
  released:              { bar: "bg-emerald-500", dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  released_with_caution: { bar: "bg-amber-500",   dot: "bg-amber-500",   text: "text-amber-600 dark:text-amber-400" },
  partial_release:       { bar: "bg-sky-500",     dot: "bg-sky-500",     text: "text-sky-600 dark:text-sky-400" },
  blocked:               { bar: "bg-red-500",     dot: "bg-red-500",     text: "text-red-600 dark:text-red-400" },
};

export function ReleaseStateBreakdown({
  total,
  buckets,
}: {
  total: number;
  buckets: ReleaseBucket[];
}) {
  const { t } = useLanguage();
  const a = t.dashboard.analytics;

  const bucketLabel: Record<ReleaseBucketKey, string> = {
    released: a.released,
    released_with_caution: a.releasedWithCaution,
    partial_release: a.partialRelease,
    blocked: t.dashboard.blocked,
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-800 dark:shadow-card">
      <div className="border-b border-slate-200/80 px-6 py-4 dark:border-slate-700/60">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{a.releaseTitle}</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{a.releaseSubtitle}</p>
      </div>

      <div className="space-y-4 p-6">
        {buckets.map((b) => {
          const style = BUCKET_STYLE[b.key];
          return (
            <div key={b.key}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", style.dot)} />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {bucketLabel[b.key]}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                    {b.count}
                  </span>
                  <span className={cn("text-[11px] font-medium tabular-nums", style.text)}>
                    {b.pct}%
                  </span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
                <div
                  className={cn("h-2 rounded-full transition-[width] duration-700 ease-out", style.bar)}
                  style={{ width: `${b.count > 0 ? Math.max(b.pct, 4) : 0}%` }}
                />
              </div>
            </div>
          );
        })}

        <p className="border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-slate-700/40 dark:text-slate-500">
          {total} {total === 1 ? a.reportSingular : a.reportsLabel}
        </p>
      </div>
    </div>
  );
}
