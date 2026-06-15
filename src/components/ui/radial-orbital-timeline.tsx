"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "input" | "processing" | "output";

interface Layer {
  id: string;
  title: string;
  description: string;
  phase: Phase;
  energy: number;
  related: string[];
}

// ─── Nexus architecture data ──────────────────────────────────────────────────

const LAYERS: Layer[] = [
  {
    id: "01",
    title: "Session Orchestration",
    description:
      "Manages assessment path selection, module sequencing, and candidate routing to ensure each session follows the correct adaptive structure for the target job level.",
    phase: "input",
    energy: 90,
    related: ["02", "07"],
  },
  {
    id: "02",
    title: "Measurement",
    description:
      "Handles item administration, raw response capture, and response-time recording. The primary data collection layer that feeds all downstream processing.",
    phase: "input",
    energy: 95,
    related: ["01", "03"],
  },
  {
    id: "03",
    title: "Response Quality",
    description:
      "Detects careless responding, internal inconsistency, and impression management before any scoring occurs — protecting the integrity of all downstream output.",
    phase: "processing",
    energy: 85,
    related: ["02", "04"],
  },
  {
    id: "04",
    title: "Psychometric Scoring",
    description:
      "Computes theta ability estimates and precision/confidence intervals using item response theory models on quality-filtered response data.",
    phase: "processing",
    energy: 92,
    related: ["03", "05"],
  },
  {
    id: "05",
    title: "Profile Modeling",
    description:
      "Synthesises scored facets into domain-level profiles, identifying pattern relationships and trait clusters across the six assessment domains.",
    phase: "processing",
    energy: 88,
    related: ["04", "06"],
  },
  {
    id: "06",
    title: "Contextual Interpretation",
    description:
      "Maps domain profiles to job levels, role families, and use cases — translating psychometric scores into business-relevant, actionable insight.",
    phase: "output",
    energy: 82,
    related: ["05", "07"],
  },
  {
    id: "07",
    title: "Governance",
    description:
      "Enforces use permissions, applies result redactions, and attaches confidence warnings — ensuring every result is surfaced appropriately and only when permitted.",
    phase: "output",
    energy: 96,
    related: ["06", "01"],
  },
];

// ─── Per-phase styling (all static strings — safe for Tailwind JIT scan) ──────

const PHASE_STYLES: Record<Phase, {
  number: string;
  dot: string;
  energy: string;
  badge: string;
  nodeIdle: string;
  nodeActive: string;
  nodeRelated: string;
  detail: string;
  svgLine: string;
  svgRelLine: string;
}> = {
  input: {
    number:      "text-indigo-400",
    dot:         "bg-indigo-400",
    energy:      "bg-indigo-500",
    badge:       "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
    nodeIdle:    "border-slate-600/60 bg-slate-800/60 hover:border-indigo-500/50",
    nodeActive:  "border-indigo-400 bg-indigo-500/20 shadow-[0_0_24px_rgba(99,102,241,0.45)]",
    nodeRelated: "border-indigo-500/40 bg-indigo-500/10",
    detail:      "border-indigo-500/25",
    svgLine:     "rgba(99,102,241,0.65)",
    svgRelLine:  "rgba(99,102,241,0.28)",
  },
  processing: {
    number:      "text-violet-400",
    dot:         "bg-violet-400",
    energy:      "bg-violet-500",
    badge:       "border-violet-500/30 bg-violet-500/10 text-violet-300",
    nodeIdle:    "border-slate-600/60 bg-slate-800/60 hover:border-violet-500/50",
    nodeActive:  "border-violet-400 bg-violet-500/20 shadow-[0_0_24px_rgba(139,92,246,0.45)]",
    nodeRelated: "border-violet-500/40 bg-violet-500/10",
    detail:      "border-violet-500/25",
    svgLine:     "rgba(139,92,246,0.65)",
    svgRelLine:  "rgba(139,92,246,0.28)",
  },
  output: {
    number:      "text-emerald-400",
    dot:         "bg-emerald-400",
    energy:      "bg-emerald-500",
    badge:       "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    nodeIdle:    "border-slate-600/60 bg-slate-800/60 hover:border-emerald-500/50",
    nodeActive:  "border-emerald-400 bg-emerald-500/20 shadow-[0_0_24px_rgba(16,185,129,0.40)]",
    nodeRelated: "border-emerald-500/40 bg-emerald-500/10",
    detail:      "border-emerald-500/25",
    svgLine:     "rgba(16,185,129,0.65)",
    svgRelLine:  "rgba(16,185,129,0.28)",
  },
};

// ─── Orbital geometry ─────────────────────────────────────────────────────────

const N  = LAYERS.length; // 7
const OX = 240;           // center x (480px container)
const OY = 240;           // center y
const OR = 175;           // orbit radius
const NS = 52;            // node size (diameter px)

function nodePos(i: number) {
  const a = ((-90 + (360 / N) * i) * Math.PI) / 180;
  return {
    left: OX + OR * Math.cos(a) - NS / 2,
    top:  OY + OR * Math.sin(a) - NS / 2,
    cx:   OX + OR * Math.cos(a),
    cy:   OY + OR * Math.sin(a),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RadialOrbitalTimeline({ className }: { className?: string }) {
  const [sel, setSel] = useState("01");

  const active   = LAYERS.find((l) => l.id === sel) ?? LAYERS[0];
  const activeI  = LAYERS.findIndex((l) => l.id === sel);
  const phase    = PHASE_STYLES[active.phase];
  const activePt = nodePos(activeI);

  const prev = () => setSel(LAYERS[(activeI - 1 + N) % N].id);
  const next = () => setSel(LAYERS[(activeI + 1) % N].id);

  return (
    <div className={cn("w-full", className)}>

      {/* ── Desktop: orbital layout (lg+) ──────────────────────────────── */}
      <div className="hidden lg:flex items-start gap-10">

        {/* ── Orbital ring ── */}
        <div className="relative h-[480px] w-[480px] shrink-0">

          {/* SVG: ring paths + connection lines */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 480 480"
            fill="none"
          >
            {/* Outer decorative ring */}
            <circle cx="240" cy="240" r="215" stroke="rgba(99,102,241,0.06)" strokeWidth="1" />
            {/* Orbit path — dashed */}
            <circle cx="240" cy="240" r="175" stroke="rgba(99,102,241,0.20)" strokeWidth="1" strokeDasharray="3 8" />
            {/* Inner reference ring */}
            <circle cx="240" cy="240" r="90" stroke="rgba(139,92,246,0.10)" strokeWidth="1" strokeDasharray="2 6" />

            {/* Connector dots on orbit */}
            {LAYERS.map((l, i) => {
              const p = nodePos(i);
              return <circle key={l.id} cx={p.cx} cy={p.cy} r="2.5" fill="rgba(99,102,241,0.18)" />;
            })}

            {/* Lines to related nodes */}
            {active.related.map((rId) => {
              const ri = LAYERS.findIndex((l) => l.id === rId);
              if (ri === -1) return null;
              const rp = nodePos(ri);
              return (
                <line
                  key={rId}
                  x1="240" y1="240"
                  x2={rp.cx} y2={rp.cy}
                  stroke={phase.svgRelLine}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Line to selected node */}
            <line
              x1="240" y1="240"
              x2={activePt.cx} y2={activePt.cy}
              stroke={phase.svgLine}
              strokeWidth="1.5"
            />
          </svg>

          {/* Center hub */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-[172px] w-[172px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-slate-700/70 bg-slate-800/90 px-5 text-center backdrop-blur-md">
            <span className={cn("font-mono text-3xl font-bold tabular-nums leading-none", phase.number)}>
              {active.id}
            </span>
            <p className="mt-2 text-[11px] font-semibold leading-tight text-white">{active.title}</p>
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", phase.dot)} />
              <span className={cn("text-[9px] font-bold uppercase tracking-widest", phase.number)}>
                {active.phase}
              </span>
            </div>
          </div>

          {/* Orbital nodes */}
          {LAYERS.map((layer, i) => {
            const p      = nodePos(i);
            const isSel  = layer.id === sel;
            const isRel  = active.related.includes(layer.id);
            const lp     = PHASE_STYLES[layer.phase];
            return (
              <button
                key={layer.id}
                onClick={() => setSel(layer.id)}
                style={{ position: "absolute", left: p.left, top: p.top, width: NS, height: NS }}
                className={cn(
                  "z-20 flex flex-col items-center justify-center rounded-full border-2 transition-all duration-300",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                  isSel ? lp.nodeActive : isRel ? lp.nodeRelated : lp.nodeIdle,
                )}
                title={layer.title}
                aria-label={`Layer ${layer.id}: ${layer.title}`}
                aria-pressed={isSel}
              >
                <span className={cn(
                  "font-mono text-xs font-bold leading-none",
                  isSel ? lp.number
                        : isRel ? cn(lp.number, "opacity-70")
                                : "text-slate-400",
                )}>
                  {layer.id}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Detail panel ── */}
        <div className="min-w-0 flex-1 pt-2">
          <div className={cn(
            "rounded-2xl border bg-slate-800/50 p-6 backdrop-blur-sm transition-all duration-300",
            phase.detail,
          )}>
            {/* Phase chip */}
            <span className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
              "text-[10px] font-bold uppercase tracking-widest",
              phase.badge,
            )}>
              <span className={cn("h-1.5 w-1.5 rounded-full", phase.dot)} />
              {active.phase} phase
            </span>

            {/* Number + title */}
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className={cn("font-mono text-4xl font-bold tabular-nums leading-none", phase.number)}>
                {active.id}
              </span>
              <h3 className="text-xl font-bold leading-snug text-white">{active.title}</h3>
            </div>

            {/* Description */}
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              {active.description}
            </p>

            {/* System weight bar */}
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  System Weight
                </span>
                <span className={cn("font-mono text-xs font-bold", phase.number)}>
                  {active.energy}%
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-slate-700/60">
                <div
                  className={cn("h-1 rounded-full transition-all duration-500", phase.energy)}
                  style={{ width: `${active.energy}%` }}
                />
              </div>
            </div>

            {/* Connected layers */}
            <div className="mt-5">
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Connected Layers
              </p>
              <div className="flex flex-wrap gap-2">
                {active.related.map((rId) => {
                  const rel = LAYERS.find((l) => l.id === rId);
                  if (!rel) return null;
                  const rp = PHASE_STYLES[rel.phase];
                  return (
                    <button
                      key={rId}
                      onClick={() => setSel(rId)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-medium",
                        "transition-all duration-200 hover:-translate-y-0.5",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                        rp.badge,
                      )}
                    >
                      <span className="font-mono font-bold">{rel.id}</span>
                      {" · "}
                      {rel.title.split(" ").slice(0, 2).join(" ")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Progress dots + prev/next */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-1.5">
                {LAYERS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSel(l.id)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      "focus:outline-none",
                      l.id === sel
                        ? cn("w-6", phase.energy)
                        : "w-1.5 bg-slate-700 hover:bg-slate-600",
                    )}
                    aria-label={`Layer ${l.id}`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={prev}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    "border border-slate-700/60 bg-slate-800/40 text-slate-400",
                    "transition-all duration-200 hover:border-indigo-500/40 hover:text-white",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  )}
                  aria-label="Previous layer"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={next}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    "border border-slate-700/60 bg-slate-800/40 text-slate-400",
                    "transition-all duration-200 hover:border-indigo-500/40 hover:text-white",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  )}
                  aria-label="Next layer"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: stacked expandable list (< lg) ───────────────────────── */}
      <div className="space-y-3 lg:hidden">
        {LAYERS.map((layer) => {
          const lp    = PHASE_STYLES[layer.phase];
          const isSel = layer.id === sel;
          return (
            <button
              key={layer.id}
              onClick={() => setSel(layer.id)}
              className={cn(
                "w-full text-left",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
              )}
            >
              <div className={cn(
                "rounded-xl border px-5 py-4 transition-all duration-200",
                isSel
                  ? cn("border bg-slate-800/70", lp.detail)
                  : "border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/60",
              )}>
                <div className="flex items-start gap-4">
                  <span className={cn(
                    "shrink-0 font-mono text-xl font-bold tabular-nums",
                    lp.number,
                  )}>
                    {layer.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{layer.title}</p>
                    {isSel && (
                      <p className="mt-2 text-xs leading-relaxed text-slate-400">
                        {layer.description}
                      </p>
                    )}
                  </div>
                  <span className={cn(
                    "ml-auto shrink-0 rounded-full border px-2 py-0.5",
                    "text-[9px] font-bold uppercase tracking-widest",
                    lp.badge,
                  )}>
                    {layer.phase}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
