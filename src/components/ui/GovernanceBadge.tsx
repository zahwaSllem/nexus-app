import type { UseStatus } from "@/lib/types/nexus";

const CONFIG: Record<string, { label: string; className: string }> = {
  operational_allowed: {
    label: "Operational",
    className: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
  operational_allowed_with_restrictions: {
    label: "Restricted",
    className: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  },
  operational_allowed_restricted_by_level: {
    label: "Level-gated",
    className: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
  },
  operational_blocked: {
    label: "Blocked",
    className: "bg-red-500/15 text-red-400 border border-red-500/30",
  },
  pilot: {
    label: "Pilot",
    className: "bg-violet-500/15 text-violet-400 border border-violet-500/30",
  },
  research: {
    label: "Research",
    className: "bg-slate-700 text-slate-400 border border-slate-600",
  },
};

interface GovernanceBadgeProps {
  status: UseStatus | string;
}

export function GovernanceBadge({ status }: GovernanceBadgeProps) {
  const cfg = CONFIG[status] ?? {
    label: status,
    className: "bg-slate-700 text-slate-400 border border-slate-600",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
