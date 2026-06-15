import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { PageAmbient } from "@/components/layout/PageAmbient";

// ─── Data ─────────────────────────────────────────────────────────────────────

const domains = [
  {
    code: "D1",
    name: "Personality Architecture",
    description:
      "Core personality traits across 6 dimensions — Conscientious Execution, Exploratory Openness, Emotional Steadiness, Interpersonal Orientation, and Social Assertiveness.",
    status: "Operational",
    dimensions: 6,
  },
  {
    code: "D2",
    name: "Cognition",
    description:
      "Cognitive reasoning patterns and mental agility measured under real-world constraints and time pressure.",
    status: "Available",
    dimensions: null,
  },
  {
    code: "D3",
    name: "Motivations",
    description:
      "Underlying drive patterns that predict engagement, commitment, and long-term role-fit across job levels.",
    status: "Available",
    dimensions: null,
  },
  {
    code: "D4",
    name: "Emotional & Social",
    description:
      "Emotional regulation, interpersonal sensitivity, and social adaptability under varying conditions.",
    status: "Available",
    dimensions: null,
  },
  {
    code: "D5",
    name: "Workplace Effectiveness",
    description:
      "Synthesis layer translating foundational traits into 8 business-facing behavioral dimensions. Deferred to Phase 2.",
    status: "Phase 2",
    dimensions: 8,
  },
  {
    code: "D6",
    name: "Domain 6",
    description:
      "Extended capability dimensions for specialized enterprise assessment contexts. Detail finalized in roadmap.",
    status: "Roadmap",
    dimensions: null,
  },
];

const layers = [
  { n: "01", name: "Session Orchestration",    desc: "Assessment path, module sequence, and routing" },
  { n: "02", name: "Measurement",               desc: "Item administration, raw response & response-time capture" },
  { n: "03", name: "Response Quality",          desc: "Detects careless, inconsistent, or impression-managed responding" },
  { n: "04", name: "Psychometric Scoring",      desc: "Theta scores and precision / confidence estimates" },
  { n: "05", name: "Profile Modeling",          desc: "Domain profiles and facet pattern synthesis" },
  { n: "06", name: "Contextual Interpretation", desc: "Maps scores to job levels, role families, and use cases" },
  { n: "07", name: "Governance",                desc: "Enforces use permissions, redactions, and confidence warnings" },
];

const journeySteps = [
  { n: "01", label: "Assigned",   desc: "Admin assigns an assessment package via the platform portal" },
  { n: "02", label: "Session",    desc: "Secure session orchestration begins; item banks activate" },
  { n: "03", label: "Responds",   desc: "Candidate answers across all domains with live quality monitoring" },
  { n: "04", label: "Scored",     desc: "7-layer pipeline: quality → psychometrics → profile modeling" },
  { n: "05", label: "Released",   desc: "Governance-gated, role-specific reports delivered to each party" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function domainStatusBadge(status: string) {
  if (status === "Operational") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  if (status === "Available")   return "border-indigo-500/30 bg-indigo-500/10 text-indigo-400";
  if (status === "Phase 2")     return "border-violet-500/30 bg-violet-500/10 text-violet-400";
  return "border-slate-700/50 bg-slate-800/60 text-slate-500";
}

function layerNumberColor(i: number) {
  if (i < 2) return "text-indigo-400";
  if (i < 5) return "text-violet-400";
  return "text-emerald-400";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="dark min-h-screen bg-slate-950">
      <Navbar />

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-6 py-20">
        <PageAmbient variant="rich" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Eyebrow */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
              Enterprise Assessment Platform
            </span>
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-in-up mt-8 text-balance text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "0.2s" }}
          >
            Measure What{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Matters.
            </span>
          </h1>

          {/* Sub-headline */}
          <p
            className="animate-fade-in-up mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-slate-400"
            style={{ animationDelay: "0.3s" }}
          >
            Nexus evaluates human capability across six scientifically validated domains —
            delivering deterministic, governance-aware reports built for hiring and development decisions.
          </p>

          {/* CTAs */}
          <div
            className="animate-fade-in-up mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            style={{ animationDelay: "0.4s" }}
          >
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-brand transition-all duration-200 hover:-translate-y-0.5 hover:from-indigo-500 hover:to-violet-500 hover:shadow-brand-lg"
            >
              Sign In to Platform
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <a
              href="mailto:demo@nexus.io"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-8 py-3.5 text-sm font-semibold text-slate-300 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-600 hover:text-white"
            >
              Request Demo
            </a>
          </div>

          {/* Domain chip row */}
          <div
            className="animate-fade-in-up mt-16 flex flex-wrap items-center justify-center gap-2"
            style={{ animationDelay: "0.55s" }}
          >
            {["D1", "D2", "D3", "D4", "D5", "D6"].map((code) => (
              <span
                key={code}
                className="rounded-lg border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 font-mono text-xs font-bold text-slate-400 backdrop-blur-sm"
              >
                {code}
              </span>
            ))}
            <span className="ml-1 text-xs text-slate-600">· 6 domains · 7 layers · V1</span>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-slate-400">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Bottom blend into next section */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-slate-950" />
      </section>

      {/* ── 2. WHAT NEXUS DOES ──────────────────────────────────────────────── */}
      <section id="what" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
              The Platform
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Assessment built to enterprise standard.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Every Nexus deployment follows the same rigorous three-part model —
              structured measurement, multi-layer scoring, and built-in governance.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {/* Measure */}
            <div className="group rounded-2xl border border-slate-700/60 bg-slate-800/40 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-slate-800/60">
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-brand">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-white">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Measure</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Six psychometric domains. Validated instruments. Multi-format item banks.
                Every response captured with quality monitoring and response-time data.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-indigo-400">
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5">6 domains</span>
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5">D1–D6</span>
              </div>
            </div>

            {/* Score */}
            <div className="group rounded-2xl border border-slate-700/60 bg-slate-800/40 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:bg-slate-800/60">
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-500 shadow-[0_4px_14px_0_rgba(124,58,237,0.35)]">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-white">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Score</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                A 7-layer pipeline processes every response — from quality detection through
                psychometric scoring to profile modeling and contextual interpretation.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-violet-400">
                <span className="rounded-full bg-violet-500/10 px-2 py-0.5">7 layers</span>
                <span className="rounded-full bg-violet-500/10 px-2 py-0.5">theta scoring</span>
              </div>
            </div>

            {/* Govern */}
            <div className="group rounded-2xl border border-slate-700/60 bg-slate-800/40 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-slate-800/60">
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-[0_4px_14px_0_rgba(16,185,129,0.30)]">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-white">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Govern</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Role-aware access controls, release gates, and confidence warnings ensure every
                result is surfaced only when — and to whom — it is appropriate.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-emerald-400">
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5">release gates</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5">role-aware</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. ASSESSMENT JOURNEY ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-900 px-6 py-24">
        {/* Dot-grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgb(99 102 241) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
              Assessment Flow
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              From assignment to insight.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Every Nexus assessment follows a defined five-stage journey — ensuring measurement
              quality, scoring integrity, and appropriate report delivery at each step.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line — desktop only */}
            <div className="absolute left-0 right-0 top-[1.875rem] hidden h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent sm:block" />

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-5">
              {journeySteps.map((step, i) => (
                <div key={step.n} className="flex flex-col items-center text-center">
                  <div
                    className={`relative z-10 flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-full border-2 ${
                      i === 0
                        ? "border-indigo-500 bg-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                        : i === 4
                          ? "border-emerald-500 bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.20)]"
                          : "border-slate-600 bg-slate-800"
                    }`}
                  >
                    <span
                      className={`font-mono text-xs font-bold ${
                        i === 0 ? "text-indigo-300" : i === 4 ? "text-emerald-300" : "text-slate-400"
                      }`}
                    >
                      {step.n}
                    </span>
                  </div>
                  <p
                    className={`mt-3 text-sm font-semibold ${
                      i === 0 ? "text-indigo-300" : i === 4 ? "text-emerald-300" : "text-slate-200"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. SIX DOMAINS ──────────────────────────────────────────────────── */}
      <section id="domains" className="relative bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
              Domain Coverage
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Six dimensions of human capability.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Each domain measures a distinct layer of capability using validated psychometric
              instruments and multi-format item banks.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {domains.map((domain) => (
              <div
                key={domain.code}
                className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:bg-slate-800/60"
              >
                {/* Hover accent line */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="mb-4 flex items-start justify-between">
                  <span className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 font-mono text-xs font-bold text-indigo-300">
                    {domain.code}
                  </span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${domainStatusBadge(domain.status)}`}>
                    {domain.status}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white">{domain.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{domain.description}</p>

                {domain.dimensions && (
                  <p className="mt-3 text-xs text-slate-600">{domain.dimensions} dimensions</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. SEVEN-LAYER ARCHITECTURE ─────────────────────────────────────── */}
      <section id="architecture" className="relative px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
              Technical Architecture
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Seven layers of assessment integrity.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Every assessment flows through a rigorous pipeline — ensuring measurement integrity,
              psychometric precision, and governance compliance before a single result is surfaced.
            </p>
          </div>

          <div className="space-y-3">
            {layers.map((layer, i) => (
              <div
                key={layer.n}
                className="flex items-start gap-5 rounded-xl border border-slate-700/50 bg-slate-800/40 px-6 py-4 backdrop-blur-sm transition-all duration-200 hover:border-indigo-500/30 hover:bg-slate-800/70"
              >
                <span className={`w-8 shrink-0 font-mono text-xl font-bold tabular-nums ${layerNumberColor(i)}`}>
                  {layer.n}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{layer.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{layer.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. TWO ROLES ────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-slate-950 to-slate-900 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
              Two Experiences
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              One platform, built for both sides.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Nexus delivers distinct, role-appropriate experiences for administrators
              who deploy assessments and the candidates who complete them.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Admin */}
            <div className="relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-slate-800/50 p-8">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-600 to-violet-600" />
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-brand">
                  A
                </div>
                <div>
                  <p className="text-xs text-slate-500">Platform Administrator</p>
                  <p className="text-sm font-semibold text-white">Admin Portal</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  "Configure job levels and role families",
                  "Build and assign assessment packages",
                  "Monitor candidate progress and completion",
                  "Review scored results with confidence indicators",
                  "Set governance rules and release permissions",
                  "Export reports for HR and hiring decisions",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Go to Admin Portal
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            {/* Candidate */}
            <div className="relative overflow-hidden rounded-2xl border border-violet-500/25 bg-slate-800/50 p-8">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-violet-600 to-purple-600" />
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-sm font-bold text-white shadow-[0_4px_14px_0_rgba(124,58,237,0.35)]">
                  C
                </div>
                <div>
                  <p className="text-xs text-slate-500">Assessment Candidate</p>
                  <p className="text-sm font-semibold text-white">Candidate Portal</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  "Receive assigned assessments from your organisation",
                  "Complete domain-structured assessment sessions",
                  "View scored results with domain breakdowns",
                  "Read a personalised developmental report",
                  "Access reports through a private candidate portal",
                  "Track assessment history and completion status",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-violet-400">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-violet-400 transition-colors hover:text-violet-300"
              >
                Go to Candidate Portal
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-900 px-6 py-32 text-center">
        <PageAmbient variant="rich" />

        <div className="relative z-10 mx-auto max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
            Get Started
          </p>
          <h2 className="mt-4 text-balance text-3xl font-bold text-white sm:text-4xl">
            Ready to deploy enterprise-grade assessment?
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-slate-400">
            Sign in to access the full Nexus platform, or contact us to arrange a guided
            demo for your organisation.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-brand transition-all duration-200 hover:-translate-y-0.5 hover:from-indigo-500 hover:to-violet-500 hover:shadow-brand-lg"
            >
              Sign In to Platform
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <a
              href="mailto:demo@nexus.io"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-8 py-3.5 text-sm font-semibold text-slate-300 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-600 hover:text-white"
            >
              Request Demo
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-brand">
              N
            </div>
            <span className="text-sm font-semibold text-white">Nexus</span>
            <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500">
              V1
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Enterprise Assessment Platform · © 2026 Nexus · Developmental use only
          </p>
        </div>
      </footer>
    </div>
  );
}
