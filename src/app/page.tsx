import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const domains = [
  {
    code: "D1",
    name: "Personality Architecture",
    description:
      "Core personality traits across 6 dimensions — Conscientious Execution, Exploratory Openness, Emotional Steadiness, Interpersonal Orientation, and Social Assertiveness. The sixth dimension (Integrity Orientation / D1-IN) is governance-restricted in V1.",
    status: "Operational",
    statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dimensions: 6,
  },
  {
    code: "D2",
    name: "Cognition",
    description:
      "Cognitive reasoning patterns and mental agility measured under real-world constraints and time pressure.",
    status: "Available",
    statusClass: "bg-sky-50 text-sky-700 border border-sky-200",
    dimensions: null,
  },
  {
    code: "D3",
    name: "Motivations",
    description:
      "Underlying drive patterns that predict engagement, commitment, and long-term role-fit across job levels.",
    status: "Available",
    statusClass: "bg-sky-50 text-sky-700 border border-sky-200",
    dimensions: null,
  },
  {
    code: "D4",
    name: "Emotional & Social",
    description:
      "Emotional regulation, interpersonal sensitivity, and social adaptability under varying conditions.",
    status: "Available",
    statusClass: "bg-sky-50 text-sky-700 border border-sky-200",
    dimensions: null,
  },
  {
    code: "D5",
    name: "Workplace Effectiveness",
    description:
      "Synthesis layer translating foundational traits into 8 business-facing behavioral dimensions. Deferred to Phase 2.",
    status: "Phase 2",
    statusClass: "bg-violet-50 text-violet-700 border border-violet-200",
    dimensions: 8,
  },
  {
    code: "D6",
    name: "Domain 6",
    description:
      "Extended capability dimensions for specialized enterprise assessment contexts. Detail finalized in roadmap.",
    status: "Roadmap",
    statusClass: "bg-slate-100 text-slate-500",
    dimensions: null,
  },
];

const layers = [
  { n: "01", name: "Session Orchestration", desc: "Assessment path, module sequence, and routing" },
  { n: "02", name: "Measurement", desc: "Item administration, raw response & response-time capture" },
  { n: "03", name: "Response Quality", desc: "Detects careless, inconsistent, or impression-managed responding" },
  { n: "04", name: "Psychometric Scoring", desc: "Theta scores and precision / confidence estimates" },
  { n: "05", name: "Profile Modeling", desc: "Domain profiles and facet pattern synthesis" },
  { n: "06", name: "Contextual Interpretation", desc: "Maps scores to job levels, role families, and use cases" },
  { n: "07", name: "Governance", desc: "Enforces use permissions, redactions, and confidence warnings" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-slate-900 px-6 py-28 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-blue-400">
            Enterprise Assessment Platform
          </span>
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-white">
            Measure What Matters
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-400 text-balance">
            Nexus evaluates human capability across six scientifically validated domains to produce
            deterministic, audience-specific reports for hiring and development decisions.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Sign In
            </Link>
            <a
              href="mailto:demo@nexus.io"
              className="rounded-lg border border-slate-600 px-8 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-slate-400 hover:text-white"
            >
              Request Demo
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-200 bg-slate-50 px-6 py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
          {[
            { value: "6", label: "Assessment Domains" },
            { value: "7", label: "System Layers" },
            { value: "3", label: "Job-Level Routes" },
            { value: "V1", label: "Current Release" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Domains */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Six Assessment Domains</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-500">
              Each domain measures a distinct layer of human capability using validated
              psychometric instruments and multi-format item banks.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {domains.map((domain) => (
              <div
                key={domain.code}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <span className="rounded-lg bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-blue-700">
                    {domain.code}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${domain.statusClass}`}>
                    {domain.status}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{domain.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{domain.description}</p>
                {domain.dimensions && (
                  <p className="mt-3 text-xs text-slate-400">{domain.dimensions} dimensions</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="about" className="bg-slate-900 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white">Seven-Layer Architecture</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Every assessment flows through a rigorous pipeline ensuring measurement integrity,
              psychometric precision, and governance compliance before a single result is surfaced.
            </p>
          </div>
          <div className="space-y-2.5">
            {layers.map((layer) => (
              <div
                key={layer.n}
                className="flex items-center gap-5 rounded-xl border border-slate-700 bg-slate-800 px-6 py-4"
              >
                <span className="w-8 shrink-0 font-mono text-xl font-bold text-blue-400">
                  {layer.n}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{layer.name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{layer.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-slate-900">Ready to get started?</h2>
          <p className="mt-4 text-slate-500">
            Sign in to access the platform, or contact us to arrange a guided demo for your organisation.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="rounded-lg bg-blue-700 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
            >
              Sign In
            </Link>
            <a
              href="mailto:demo@nexus.io"
              className="rounded-lg border border-slate-300 px-8 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Request Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 font-bold text-xs text-white">
              N
            </div>
            <span className="text-sm font-semibold text-slate-700">Nexus</span>
          </div>
          <p className="text-xs text-slate-400">Enterprise Assessment Platform · V1</p>
        </div>
      </footer>
    </div>
  );
}
