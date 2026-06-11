import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

// ─── Mock report data ──────────────────────────────────────────────────────────

const REPORT_META = {
  reference: "NSX-2026-0042",
  generatedDate: "Jun 9, 2026",
  assessmentDate: "Jun 8, 2026",
  status: "Available",
  version: "V1",
};

const CANDIDATE = {
  name: "Alex Jordan",
  id: "C-007",
  jobTitle: "Software Engineer",
  level: "Entry / Individual Contributor",
  organization: "Nexus Platform Demo",
  assessorId: "ADMIN-001",
};

const QUALITY = [
  { label: "Items Completed",    value: "8 of 8",              ok: true  },
  { label: "Validity Flags",     value: "None detected",       ok: true  },
  { label: "Consistency Index",  value: "High (r = 0.87)",     ok: true  },
  { label: "Acquiescence Bias",  value: "Within normal range", ok: true  },
  { label: "Response Latency",   value: "Within expected band",ok: true  },
  { label: "Overall Status",     value: "Valid for scoring",   ok: true  },
];

interface Dimension {
  name: string;
  score: number;
}

interface Domain {
  code: string;
  name: string;
  composite: number;
  percentile: number;
  dimensions: Dimension[];
  narrative: string;
}

const DOMAINS: Domain[] = [
  {
    code: "D1",
    name: "Personality Architecture",
    composite: 74,
    percentile: 61,
    dimensions: [
      { name: "Conscientious Execution",   score: 81 },
      { name: "Exploratory Openness",      score: 68 },
      { name: "Emotional Steadiness",      score: 79 },
      { name: "Interpersonal Orientation", score: 72 },
      { name: "Social Assertiveness",      score: 65 },
    ],
    narrative:
      "Alex demonstrates solid conscientious execution and emotional steadiness, suggesting reliability and composure under pressure. Exploratory openness and social assertiveness are developing areas that may benefit from structured exposure to cross-functional work.",
  },
  {
    code: "D2",
    name: "Cognition",
    composite: 71,
    percentile: 55,
    dimensions: [
      { name: "Analytical Reasoning", score: 76 },
      { name: "Learning Agility",     score: 66 },
    ],
    narrative:
      "Strong analytical reasoning is evident. Learning agility scores suggest a methodical rather than rapid-adaptation style — well suited to environments with structured onboarding and clear problem scope.",
  },
  {
    code: "D3",
    name: "Motivations",
    composite: 62,
    percentile: 44,
    dimensions: [
      { name: "Achievement Drive", score: 67 },
      { name: "Affiliation",       score: 58 },
    ],
    narrative:
      "Moderate motivational profile. Achievement orientation is present; affiliation scores suggest a preference for independent contribution over heavily team-led dynamics.",
  },
  {
    code: "D4",
    name: "Emotional & Social",
    composite: 68,
    percentile: 50,
    dimensions: [
      { name: "Emotional Awareness", score: 72 },
      { name: "Social Regulation",   score: 64 },
    ],
    narrative:
      "Emotional awareness is a relative strength. Social regulation scores indicate generally constructive interpersonal conduct with room to build consistency in high-stakes social contexts.",
  },
];

const HIRING_STRENGTHS = [
  "Reliable execution under time constraints (D1 Conscientious Execution: 81)",
  "Composed under workplace pressure (D1 Emotional Steadiness: 79)",
  "Structured analytical problem-solving approach (D2 Analytical Reasoning: 76)",
];

const HIRING_WATCHPOINTS = [
  "May benefit from mentoring on proactive cross-team communication (Social Assertiveness: 65)",
  "Structured onboarding recommended to support rapid context-switching (Learning Agility: 66)",
];

const CANDIDATE_STRENGTHS = [
  "You show strong follow-through on tasks and remain composed when under pressure.",
  "Your analytical approach to problems is a clear asset for technical roles.",
];

const CANDIDATE_DEVELOPMENT = [
  "Consider seeking opportunities to contribute ideas in group settings to build assertiveness.",
  "Experiment with new tools or workflows outside your comfort zone to grow learning agility.",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 75) return { text: "text-emerald-400", bar: "bg-emerald-500", border: "border-emerald-500/30" };
  if (score >= 60) return { text: "text-blue-400",    bar: "bg-blue-500",    border: "border-blue-500/30" };
  if (score >= 45) return { text: "text-amber-400",   bar: "bg-amber-500",   border: "border-amber-500/30" };
  return             { text: "text-red-400",    bar: "bg-red-500",     border: "border-red-500/30" };
}

function scoreBand(score: number) {
  if (score >= 75) return "High";
  if (score >= 60) return "Moderate";
  if (score >= 45) return "Developing";
  return "Emerging";
}

// ─── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
  params: { id: string };
}

export default function ReportDetailPage({ params: _params }: PageProps) {
  return (
    <div className="min-h-full bg-slate-900 p-8">

      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/dashboard/reports"
          className="flex w-fit items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-300"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Reports
        </Link>
      </div>

      {/* Report header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-blue-400">
            Assessment Report
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">{CANDIDATE.name}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {CANDIDATE.jobTitle} · {CANDIDATE.level}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-mono text-xs text-slate-500">{REPORT_META.reference}</p>
            <p className="mt-0.5 text-xs text-slate-600">Generated {REPORT_META.generatedDate}</p>
          </div>
          <Badge variant="success">{REPORT_META.status}</Badge>
        </div>
      </div>

      {/* Mock disclaimer */}
      <div className="mb-8 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-5 py-4">
        <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-amber-400">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-amber-400">Mock Report — Not Scientifically Validated</p>
          <p className="mt-0.5 text-xs leading-relaxed text-amber-300/70">
            All scores, percentiles, and narratives in this report are illustrative mock data generated
            for platform demonstration purposes only. They do not represent real psychometric output,
            validated assessments, or clinical/diagnostic conclusions. Nexus V1 scoring is under
            development and has not been normatively validated.
          </p>
        </div>
      </div>

      {/* Two-column grid: main content + sidebar */}
      <div className="grid gap-6 xl:grid-cols-3">

        {/* ── Sidebar (right on xl) ─────────────────────────── */}
        <div className="order-first flex flex-col gap-5 xl:order-last">

          {/* Candidate summary */}
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-500">
              Candidate
            </p>
            <div className="space-y-3">
              {[
                { label: "Name",         value: CANDIDATE.name },
                { label: "ID",           value: CANDIDATE.id },
                { label: "Job Title",    value: CANDIDATE.jobTitle },
                { label: "Level",        value: CANDIDATE.level },
                { label: "Organization", value: CANDIDATE.organization },
                { label: "Assessed",     value: REPORT_META.assessmentDate },
              ].map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-3">
                  <span className="shrink-0 text-xs text-slate-500">{row.label}</span>
                  <span className="text-right text-xs font-medium text-slate-300">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Response quality */}
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-500">
              Response Quality
            </p>
            <div className="space-y-2.5">
              {QUALITY.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    {item.ok && (
                      <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500/15">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-2.5 w-2.5 text-emerald-400">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <span className="text-xs font-medium text-slate-300">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Governance notice */}
          <div className="rounded-xl border border-violet-500/25 bg-violet-500/5 p-5">
            <div className="mb-3 flex items-center gap-2">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-violet-400">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <p className="text-xs font-semibold text-violet-300">Governance Notice</p>
            </div>
            <p className="text-xs leading-relaxed text-violet-300/70">
              This report is restricted to authorised reviewers only. Distribution beyond the
              designated hiring panel is prohibited under Nexus governance policy V1.2.
            </p>
            <div className="mt-3 border-t border-violet-500/15 pt-3">
              <p className="text-xs text-violet-400/60">
                D5 — Workplace Effectiveness is deferred to Phase 2 and excluded from all V1 reports
                per governance gate requirements.
              </p>
            </div>
          </div>

        </div>

        {/* ── Main content (left on xl) ─────────────────────── */}
        <div className="flex flex-col gap-6 xl:col-span-2">

          {/* Domain score cards */}
          {DOMAINS.map((domain) => {
            const color = scoreColor(domain.composite);
            const band = scoreBand(domain.composite);
            return (
              <div
                key={domain.code}
                className={`overflow-hidden rounded-xl border bg-slate-800 ${color.border}`}
              >
                {/* Domain header */}
                <div className="flex items-center justify-between border-b border-slate-700/60 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-blue-500/10 px-2 py-0.5 font-mono text-xs font-bold text-blue-300">
                      {domain.code}
                    </span>
                    <h2 className="text-sm font-semibold text-white">{domain.name}</h2>
                  </div>
                  <Badge variant="success">Included</Badge>
                </div>

                <div className="p-5">
                  {/* Composite score row */}
                  <div className="mb-5 flex items-end gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Composite Score</p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className={`text-4xl font-bold tabular-nums ${color.text}`}>
                          {domain.composite}
                        </span>
                        <span className="text-lg text-slate-600">/100</span>
                      </div>
                    </div>
                    <div className="mb-1">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${color.text} bg-slate-700/50`}>
                        {band}
                      </span>
                    </div>
                    <div className="mb-1 ml-auto text-right">
                      <p className="text-xs text-slate-500">Percentile</p>
                      <p className={`mt-0.5 text-sm font-bold ${color.text}`}>{domain.percentile}th</p>
                    </div>
                  </div>

                  {/* Composite bar */}
                  <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-slate-700">
                    <div
                      className={`h-2 rounded-full transition-all ${color.bar}`}
                      style={{ width: `${domain.composite}%` }}
                    />
                  </div>

                  {/* Dimension subscores */}
                  <div className="mb-5 space-y-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Dimensions
                    </p>
                    {domain.dimensions.map((dim) => {
                      const dc = scoreColor(dim.score);
                      return (
                        <div key={dim.name}>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs text-slate-300">{dim.name}</span>
                            <span className={`font-mono text-xs font-bold ${dc.text}`}>
                              {dim.score}
                            </span>
                          </div>
                          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-700">
                            <div
                              className={`h-1 rounded-full ${dc.bar}`}
                              style={{ width: `${dim.score}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Narrative */}
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 px-4 py-3">
                    <p className="mb-1.5 text-xs font-medium text-slate-500">Interpretation</p>
                    <p className="text-xs leading-relaxed text-slate-300">{domain.narrative}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* D5 governance card */}
          <div className="overflow-hidden rounded-xl border border-violet-500/30 bg-slate-800 ring-1 ring-violet-500/10">
            <div className="flex items-center justify-between border-b border-slate-700/60 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="rounded bg-violet-500/10 px-2 py-0.5 font-mono text-xs font-bold text-violet-300">
                  D5
                </span>
                <h2 className="text-sm font-semibold text-white">Workplace Effectiveness</h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="pilot">Phase 2</Badge>
                <Badge variant="error">Blocked</Badge>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-3">
                <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-violet-400">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <p className="text-sm leading-relaxed text-violet-300/80">
                  Domain 5 is deferred to Phase 2 and blocked for all high-stakes operational use in
                  V1 per governance requirements. Scoring methodology, normative baseline, and
                  audience-specific output formats for D5 are under development and will be validated
                  prior to V2 release.
                </p>
              </div>
            </div>
          </div>

          {/* Audience-specific sections */}
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Audience-Specific Views
            </p>

            {/* Hiring Manager */}
            <div className="rounded-xl border border-slate-700 bg-slate-800">
              <div className="flex items-center gap-3 border-b border-slate-700/60 px-5 py-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 ring-1 ring-blue-500/30">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-blue-400">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Hiring Manager View</p>
                  <p className="text-xs text-slate-500">Decision-support summary for authorised reviewers</p>
                </div>
              </div>
              <div className="p-5">
                <div className="mb-4">
                  <p className="mb-2.5 text-xs font-medium text-slate-500">Candidate Strengths</p>
                  <ul className="space-y-2">
                    {HIRING_STRENGTHS.map((s) => (
                      <li key={s} className="flex items-start gap-2.5">
                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        <span className="text-xs text-slate-300">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2.5 text-xs font-medium text-slate-500">Watch Points</p>
                  <ul className="space-y-2">
                    {HIRING_WATCHPOINTS.map((w) => (
                      <li key={w} className="flex items-start gap-2.5">
                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        <span className="text-xs text-slate-300">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 rounded-lg border border-blue-500/15 bg-blue-500/5 px-4 py-3">
                  <p className="text-xs leading-relaxed text-blue-300/80">
                    This view is restricted to authorised hiring personnel. Do not share with the
                    candidate. Scores are indicative and should be considered alongside structured
                    interview outcomes and verified credentials.
                  </p>
                </div>
              </div>
            </div>

            {/* Candidate Feedback */}
            <div className="rounded-xl border border-slate-700 bg-slate-800">
              <div className="flex items-center gap-3 border-b border-slate-700/60 px-5 py-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/30">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-400">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Candidate Feedback View</p>
                  <p className="text-xs text-slate-500">Developmental summary for the assessed individual</p>
                </div>
              </div>
              <div className="p-5">
                <div className="mb-4">
                  <p className="mb-2.5 text-xs font-medium text-slate-500">Your Strengths</p>
                  <ul className="space-y-2">
                    {CANDIDATE_STRENGTHS.map((s) => (
                      <li key={s} className="flex items-start gap-2.5">
                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        <span className="text-xs text-slate-300">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2.5 text-xs font-medium text-slate-500">Development Suggestions</p>
                  <ul className="space-y-2">
                    {CANDIDATE_DEVELOPMENT.map((d) => (
                      <li key={d} className="flex items-start gap-2.5">
                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        <span className="text-xs text-slate-300">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-4 py-3">
                  <p className="text-xs leading-relaxed text-emerald-300/80">
                    These suggestions are meant to support your professional growth and are not
                    performance evaluations. Discuss with your manager or a development coach for
                    personalised guidance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer disclaimer */}
          <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 px-5 py-4">
            <p className="text-xs leading-relaxed text-slate-600">
              Nexus {REPORT_META.version} · Report {REPORT_META.reference} · Generated {REPORT_META.generatedDate} ·
              This report contains mock data for platform demonstration only. All scores, narratives,
              and percentile positions are illustrative and have not been normatively validated.
              Not for use in live hiring, clinical, or diagnostic decisions.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
