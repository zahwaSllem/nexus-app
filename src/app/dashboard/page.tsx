import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

// ─── Mock data ─────────────────────────────────────────────────────────────────

const KPI = [
  {
    label: "Total Candidates",
    value: 142,
    delta: "+12 this week",
    textAccent: "text-blue-400",
    bgAccent: "bg-blue-500/10",
    borderAccent: "border-blue-500/20",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
  {
    label: "Completed Assessments",
    value: 89,
    delta: "+8 this week",
    textAccent: "text-emerald-400",
    bgAccent: "bg-emerald-500/10",
    borderAccent: "border-emerald-500/20",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: "Pending Assessments",
    value: 31,
    delta: "4 overdue",
    textAccent: "text-amber-400",
    bgAccent: "bg-amber-500/10",
    borderAccent: "border-amber-500/20",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: "Reports Generated",
    value: 76,
    delta: "+5 this week",
    textAccent: "text-violet-400",
    bgAccent: "bg-violet-500/10",
    borderAccent: "border-violet-500/20",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path
          fillRule="evenodd"
          d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

const CANDIDATES = [
  { id: "C-001", level: "Entry",     domains: ["D1", "D2"],           status: "Completed",  date: "Jun 7, 2026" },
  { id: "C-002", level: "Manager",   domains: ["D1", "D2", "D3"],     status: "Completed",  date: "Jun 7, 2026" },
  { id: "C-003", level: "Manager",   domains: ["D1", "D2"],            status: "Completed",  date: "Jun 8, 2026" },
  { id: "C-004", level: "Entry",     domains: ["D1", "D2"],           status: "Completed",  date: "Jun 6, 2026" },
  { id: "C-005", level: "Manager",   domains: ["D1", "D2", "D3","D4"],status: "Completed",  date: "Jun 5, 2026" },
  { id: "C-006", level: "Entry",     domains: [],                      status: "Pending",    date: "Jun 8, 2026" },
  { id: "C-007", level: "Entry",     domains: ["D1", "D2", "D3", "D4"],status: "Completed",  date: "Jun 9, 2026" },
  { id: "C-008", level: "Entry",     domains: [],                      status: "Pending",    date: "Jun 9, 2026" },
];

const STATUS_VARIANT: Record<string, "success" | "warning" | "default"> = {
  Completed: "success",
  "In Progress": "warning",
  Pending: "default",
};

const DOMAINS = [
  { code: "D1", name: "Personality Architecture",  assessed: 89, total: 142, state: "operational", statusLabel: "Operational" },
  { code: "D2", name: "Cognition",                 assessed: 67, total: 142, state: "available",   statusLabel: "Available"   },
  { code: "D3", name: "Motivations",               assessed: 45, total: 142, state: "available",   statusLabel: "Available"   },
  { code: "D4", name: "Emotional & Social",         assessed: 38, total: 142, state: "available",   statusLabel: "Available"   },
  { code: "D5", name: "Workplace Effectiveness",   assessed:  0, total: 142, state: "blocked",     statusLabel: "Phase 2"     },
  { code: "D6", name: "Domain 6",                  assessed:  0, total: 142, state: "roadmap",     statusLabel: "Roadmap"     },
];

const DOMAIN_CONFIG: Record<string, { badgeClass: string; barClass: string; cardBorder: string }> = {
  operational: { badgeClass: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25", barClass: "bg-emerald-500", cardBorder: "border-slate-700"       },
  available:   { badgeClass: "bg-sky-500/15 text-sky-300 border border-sky-500/25",             barClass: "bg-sky-500",     cardBorder: "border-slate-700"       },
  blocked:     { badgeClass: "bg-violet-500/15 text-violet-300 border border-violet-500/25",    barClass: "bg-slate-700",   cardBorder: "border-violet-500/40"   },
  roadmap:     { badgeClass: "bg-slate-700 text-slate-400",                                      barClass: "bg-slate-700",   cardBorder: "border-slate-700/50"    },
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="min-h-full bg-slate-900 p-8">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Admin overview · Nexus V1</p>
        </div>
        <Link
          href="/dashboard/agent"
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
        >
          + New Assessment
        </Link>
      </div>

      {/* KPI cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border ${card.borderAccent} bg-slate-800 p-5`}
          >
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-slate-400">{card.label}</p>
              <div className={`rounded-lg p-2 ${card.bgAccent} ${card.textAccent}`}>
                {card.icon}
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold text-white">{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.delta}</p>
          </div>
        ))}
      </div>

      {/* Main grid: recent candidates + quick actions */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">

        {/* Recent candidates table */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-700 bg-slate-800">
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
              <h2 className="text-sm font-semibold text-white">Recent Candidates</h2>
              <Link
                href="/dashboard/candidates"
                className="text-xs font-medium text-blue-400 transition-colors hover:text-blue-300"
              >
                View all →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    {["ID", "Level", "Domains", "Status", "Date"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {CANDIDATES.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-slate-700/30">
                      <td className="px-6 py-3.5 font-mono text-xs font-semibold text-blue-400">
                        {c.id}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-slate-300">{c.level}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {c.domains.length > 0 ? (
                            c.domains.map((d) => (
                              <span
                                key={d}
                                className="rounded bg-blue-500/10 px-1.5 py-0.5 font-mono text-xs font-medium text-blue-300"
                              >
                                {d}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-600">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge dark variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-500">{c.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick actions + release note */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-slate-700 bg-slate-800">
            <div className="border-b border-slate-700 px-6 py-4">
              <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
            </div>
            <div className="space-y-2 p-4">
              {[
                { href: "/dashboard/agent",      label: "New Assessment",   symbol: "+" },
                { href: "/dashboard/reports",    label: "View Reports",     symbol: "→" },
                { href: "/dashboard/candidates", label: "All Candidates",   symbol: "→" },
                { href: "/admin",                label: "Admin Panel",      symbol: "→" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-700 px-4 py-3 text-sm text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-700 hover:text-white"
                >
                  <span>{action.label}</span>
                  <span className="text-slate-500">{action.symbol}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* V1 release note */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-5 py-4">
            <p className="text-xs font-semibold text-blue-400">V1 Release Status</p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-500">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                D1–D4 operational
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                D5 deferred to Phase 2
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
                D6 on roadmap
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Domain coverage */}
      <div>
        <div className="mb-5 flex items-baseline justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Domain Coverage</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Candidates assessed per domain · 142 total in pipeline
            </p>
          </div>
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
            D5 blocked in V1
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DOMAINS.map((domain) => {
            const cfg = DOMAIN_CONFIG[domain.state];
            const pct = Math.round((domain.assessed / domain.total) * 100);
            const isBlocked = domain.state === "blocked";
            const isRoadmap = domain.state === "roadmap";
            const dimmed = isBlocked || isRoadmap;

            return (
              <div
                key={domain.code}
                className={`rounded-xl border ${cfg.cardBorder} bg-slate-800 p-5 ${isBlocked ? "ring-1 ring-violet-500/20" : ""}`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded bg-blue-500/10 px-2 py-0.5 font-mono text-xs font-bold text-blue-300">
                    {domain.code}
                  </span>
                  <div className="flex flex-wrap justify-end gap-1">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.badgeClass}`}>
                      {domain.statusLabel}
                    </span>
                    {isBlocked && (
                      <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
                        Blocked
                      </span>
                    )}
                  </div>
                </div>

                {/* Name */}
                <p className={`mt-3 text-sm font-semibold ${dimmed ? "text-slate-500" : "text-white"}`}>
                  {domain.name}
                </p>

                {/* Assessed count */}
                <p className="mt-1 text-xs text-slate-600">
                  {isBlocked
                    ? "0 assessed — governance gate enforced"
                    : isRoadmap
                    ? "0 assessed — on roadmap"
                    : `${domain.assessed} of ${domain.total} candidates`}
                </p>

                {/* Progress bar */}
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                  <div
                    className={`h-1.5 rounded-full ${cfg.barClass}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  {!dimmed && (
                    <p className="text-xs text-slate-600">{domain.assessed} assessed</p>
                  )}
                  <p className={`ml-auto text-xs ${dimmed ? "text-slate-700" : "text-slate-500"}`}>
                    {pct}%
                  </p>
                </div>

                {/* D5 governance notice */}
                {isBlocked && (
                  <div className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-xs leading-relaxed text-violet-300">
                        V1 Governance Gate — Deferred to Phase 2. Blocked for all
                        high-stakes and selection use.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
