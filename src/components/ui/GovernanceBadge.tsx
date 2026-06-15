import type { UseStatus } from "@/lib/types/nexus";

const CONFIG: Record<string, { label: string; className: string }> = {
  operational_allowed: {
    label: "Operational",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30",
  },
  operational_allowed_with_restrictions: {
    label: "Restricted",
    className: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30",
  },
  operational_allowed_restricted_by_level: {
    label: "Level-gated",
    className: "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30",
  },
  operational_blocked: {
    label: "Blocked",
    className: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30",
  },
  pilot: {
    label: "Pilot",
    className: "bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/30",
  },
  research: {
    label: "Research",
    className: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600",
  },
};

interface GovernanceBadgeProps {
  status: UseStatus | string;
}

export function GovernanceBadge({ status }: GovernanceBadgeProps) {
  const cfg = CONFIG[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
