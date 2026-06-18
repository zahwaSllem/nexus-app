// ─── Dashboard Analytics Engine ──────────────────────────────────────────────
// Pure, deterministic derivations from the existing mock data structures.
//
// Inputs:
//   - assignments  → live from StoreProvider (includes any created via the agent flow)
//   - reports      → static REPORTS mock
//   - scoredResults→ static SCORED_RESULTS mock
//
// No backend, no database — every metric below is computed at render time from
// the same in-memory data the rest of the app already uses. All functions are
// generic over N records, so analytics scale automatically as mock data grows.

import type {
  AssessmentAssignment,
  AssignmentStatus,
  Report,
  ScoredResult,
  ReleaseState,
} from "@/lib/types/nexus";

// ─── Assessment Funnel ───────────────────────────────────────────────────────
// Cumulative pipeline: every assignment is "Assigned"; those that started count
// as "In Progress"; those finished are "Completed"; those with a released report
// are "Released". Counts are monotonically non-increasing down the funnel.

export type FunnelStageKey = "assigned" | "in_progress" | "completed" | "released";

export type FunnelStage = {
  key: FunnelStageKey;
  count: number;
  /** width % of the funnel bar, relative to the "Assigned" total */
  widthPct: number;
  /** conversion % from the previous stage (100 for the first stage) */
  conversionPct: number;
};

const RELEASED_STATES: ReleaseState[] = [
  "Released",
  "Released with Caution",
  "Partial Release",
];

export function computeFunnel(
  assignments: AssessmentAssignment[],
  reports: Report[],
): FunnelStage[] {
  const assigned = assignments.length;
  const inProgress = assignments.filter(
    (a) => a.status === "in_progress" || a.status === "completed",
  ).length;
  const completed = assignments.filter((a) => a.status === "completed").length;
  const released = reports.filter((r) =>
    RELEASED_STATES.includes(r.release_state),
  ).length;

  const raw: { key: FunnelStageKey; count: number }[] = [
    { key: "assigned", count: assigned },
    { key: "in_progress", count: inProgress },
    { key: "completed", count: completed },
    { key: "released", count: released },
  ];

  const top = assigned || 1;
  return raw.map((stage, i) => {
    const prev = i === 0 ? stage.count : raw[i - 1].count;
    return {
      ...stage,
      widthPct: Math.round((stage.count / top) * 100),
      conversionPct: i === 0 ? 100 : prev === 0 ? 0 : Math.round((stage.count / prev) * 100),
    };
  });
}

// ─── Assessment Status Distribution ──────────────────────────────────────────
// Non-cumulative breakdown of every assignment by its current status.

export type StatusSlice = {
  status: AssignmentStatus;
  count: number;
  pct: number;
};

const STATUS_ORDER: AssignmentStatus[] = [
  "not_started",
  "in_progress",
  "completed",
  "expired",
];

export function computeStatusDistribution(
  assignments: AssessmentAssignment[],
): { total: number; slices: StatusSlice[] } {
  const total = assignments.length;
  const slices = STATUS_ORDER.map((status) => {
    const count = assignments.filter((a) => a.status === status).length;
    return {
      status,
      count,
      pct: total === 0 ? 0 : Math.round((count / total) * 100),
    };
  });
  return { total, slices };
}

// ─── Report Release States ───────────────────────────────────────────────────
// Buckets every report's release_state into the four V1 display categories.

export type ReleaseBucketKey =
  | "released"
  | "released_with_caution"
  | "partial_release"
  | "blocked";

export type ReleaseBucket = {
  key: ReleaseBucketKey;
  count: number;
  pct: number;
};

function bucketForReleaseState(state: ReleaseState): ReleaseBucketKey {
  switch (state) {
    case "Released":
      return "released";
    case "Released with Caution":
      return "released_with_caution";
    case "Partial Release":
      return "partial_release";
    default:
      // "Blocked output section" | "Assessment incomplete" | "Invalid for interpretation"
      return "blocked";
  }
}

const RELEASE_BUCKET_ORDER: ReleaseBucketKey[] = [
  "released",
  "released_with_caution",
  "partial_release",
  "blocked",
];

export function computeReleaseStates(
  reports: Report[],
): { total: number; buckets: ReleaseBucket[] } {
  const total = reports.length;
  const counts: Record<ReleaseBucketKey, number> = {
    released: 0,
    released_with_caution: 0,
    partial_release: 0,
    blocked: 0,
  };
  for (const r of reports) counts[bucketForReleaseState(r.release_state)]++;

  const buckets = RELEASE_BUCKET_ORDER.map((key) => ({
    key,
    count: counts[key],
    pct: total === 0 ? 0 : Math.round((counts[key] / total) * 100),
  }));
  return { total, buckets };
}

// ─── Domain Analytics ────────────────────────────────────────────────────────
// Average standardized score per scored domain across all scored results.
// V1 scores D1, D2, D4 (D3/D5 are governance-blocked / deferred).

export type DomainAverage = {
  domain_id: string;
  domain_name: string;
  avgScore: number;        // 0–100, rounded to 1 decimal
  sampleCount: number;     // number of scored results contributing
  dimensionCount: number;  // total dimensions averaged
};

export function computeDomainAverages(
  scoredResults: ScoredResult[],
): DomainAverage[] {
  // domain_id -> { name, scoreSum, scoreN, dimN, sessions }
  const acc = new Map<
    string,
    { name: string; scoreSum: number; scoreN: number; dimN: number; sessions: Set<string> }
  >();

  for (const result of scoredResults) {
    for (const domain of result.domain_scores) {
      const entry =
        acc.get(domain.domain_id) ??
        { name: domain.domain_name, scoreSum: 0, scoreN: 0, dimN: 0, sessions: new Set<string>() };
      entry.scoreSum += domain.standardized_score;
      entry.scoreN += 1;
      entry.dimN += domain.dimensions.length;
      entry.sessions.add(result.session_id);
      acc.set(domain.domain_id, entry);
    }
  }

  return Array.from(acc.entries())
    .map(([domain_id, e]) => ({
      domain_id,
      domain_name: e.name,
      avgScore: e.scoreN === 0 ? 0 : Math.round((e.scoreSum / e.scoreN) * 10) / 10,
      sampleCount: e.sessions.size,
      dimensionCount: e.dimN,
    }))
    .sort((a, b) => a.domain_id.localeCompare(b.domain_id));
}

// ─── Candidate Activity Timeline ─────────────────────────────────────────────
// Merges assignment lifecycle events and report releases into a single,
// reverse-chronological feed.

export type ActivityType = "assigned" | "completed" | "released";

export type ActivityEvent = {
  id: string;
  type: ActivityType;
  candidateName: string;
  timestamp: string; // ISO
};

export function computeActivityTimeline(
  assignments: AssessmentAssignment[],
  reports: Report[],
  limit = 8,
): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  for (const a of assignments) {
    events.push({
      id: `${a.assignment_id}-assigned`,
      type: "assigned",
      candidateName: a.candidate_name,
      timestamp: a.assigned_at,
    });
    if (a.completed_at) {
      events.push({
        id: `${a.assignment_id}-completed`,
        type: "completed",
        candidateName: a.candidate_name,
        timestamp: a.completed_at,
      });
    }
  }

  for (const r of reports) {
    events.push({
      id: `${r.report_id}-released`,
      type: "released",
      candidateName: r.admin_view.candidate_name,
      timestamp: r.generated_at,
    });
  }

  return events
    .sort((x, y) => (x.timestamp < y.timestamp ? 1 : x.timestamp > y.timestamp ? -1 : 0))
    .slice(0, limit);
}

// ─── Headline KPIs ───────────────────────────────────────────────────────────
// Derived summary numbers for the top KPI row.

export type DashboardKpis = {
  totalAssignments: number;
  completed: number;
  completionRatePct: number;
  reportsReleased: number;
  avgDomainScore: number; // mean of per-domain averages, 1 decimal
};

export function computeKpis(
  assignments: AssessmentAssignment[],
  reports: Report[],
  scoredResults: ScoredResult[],
): DashboardKpis {
  const totalAssignments = assignments.length;
  const completed = assignments.filter((a) => a.status === "completed").length;
  const reportsReleased = reports.filter((r) =>
    RELEASED_STATES.includes(r.release_state),
  ).length;
  const domainAverages = computeDomainAverages(scoredResults);
  const avgDomainScore =
    domainAverages.length === 0
      ? 0
      : Math.round(
          (domainAverages.reduce((s, d) => s + d.avgScore, 0) / domainAverages.length) * 10,
        ) / 10;

  return {
    totalAssignments,
    completed,
    completionRatePct:
      totalAssignments === 0 ? 0 : Math.round((completed / totalAssignments) * 100),
    reportsReleased,
    avgDomainScore,
  };
}

// ─── Date formatting helper ──────────────────────────────────────────────────

export function formatActivityDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
