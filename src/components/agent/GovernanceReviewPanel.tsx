"use client";

import { useEffect, useState } from "react";
import type { GovernanceWarning, GovernanceSeverity } from "@/lib/types/nexus";

const SEVERITY_CONFIG: Record<GovernanceSeverity, {
  border: string;
  bg: string;
  iconColor: string;
  badgeClass: string;
  label: string;
  icon: React.ReactNode;
}> = {
  blocking: {
    border: "border-red-500/40",
    bg: "bg-red-500/5",
    iconColor: "text-red-400",
    badgeClass: "bg-red-500/15 text-red-400 border border-red-500/30",
    label: "Blocking",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
      </svg>
    ),
  },
  caution: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    iconColor: "text-amber-400",
    badgeClass: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    label: "Caution",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  info: {
    border: "border-blue-500/25",
    bg: "bg-blue-500/5",
    iconColor: "text-blue-400",
    badgeClass: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    label: "Info",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  },
};

const SEVERITY_ORDER: GovernanceSeverity[] = ["blocking", "caution", "info"];

interface GovernanceReviewPanelProps {
  warnings: GovernanceWarning[];
  onAllAcknowledged: () => void;
}

export function GovernanceReviewPanel({ warnings, onAllAcknowledged }: GovernanceReviewPanelProps) {
  const sorted = [...warnings].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

  const acknowledgeable = sorted.filter((w) => w.severity !== "blocking");
  const blockingCount = sorted.filter((w) => w.severity === "blocking").length;
  const cautionCount = sorted.filter((w) => w.severity === "caution").length;
  const infoCount = sorted.filter((w) => w.severity === "info").length;

  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const allAcknowledged = blockingCount === 0 && acknowledged.size >= acknowledgeable.length;

  useEffect(() => {
    if (allAcknowledged) onAllAcknowledged();
  }, [allAcknowledged, onAllAcknowledged]);

  function toggle(code: string) {
    setAcknowledged((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  return (
    <div className="space-y-5">

      {/* Summary header */}
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
        <h3 className="mb-1 text-sm font-semibold text-white">Governance Review</h3>
        <p className="mb-4 text-xs text-slate-500">
          These warnings were automatically generated from the selected items' governance metadata.
          Acknowledge all caution and info items to enable approval.
        </p>
        <div className="flex flex-wrap gap-3">
          {blockingCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              {blockingCount} blocking
            </span>
          )}
          {cautionCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              {cautionCount} caution
            </span>
          )}
          {infoCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              {infoCount} info
            </span>
          )}
        </div>
      </div>

      {/* Blocking banner */}
      {blockingCount > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4">
          <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-red-400">
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium text-red-400">
            Cannot approve — {blockingCount} blocking issue{blockingCount !== 1 ? "s" : ""} must be resolved before this blueprint can be approved.
          </p>
        </div>
      )}

      {/* Warning cards */}
      <div className="space-y-3">
        {sorted.map((warning) => {
          const cfg = SEVERITY_CONFIG[warning.severity];
          const isAcknowledgeable = warning.severity !== "blocking";
          const isAcknowledged = acknowledged.has(warning.code);

          return (
            <div
              key={warning.code}
              className={`rounded-xl border p-5 transition-all ${cfg.border} ${cfg.bg} ${isAcknowledged ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-3">
                {/* Severity icon */}
                <div className={`mt-0.5 shrink-0 ${cfg.iconColor}`}>{cfg.icon}</div>

                <div className="flex-1 space-y-2">
                  {/* Top row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.badgeClass}`}>
                      {cfg.label}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400">{warning.code}</span>
                  </div>

                  {/* Message */}
                  <p className="text-sm leading-relaxed text-slate-300">{warning.message}</p>

                  {/* Nexus rule */}
                  {warning.nexus_rule && (
                    <p className="text-xs text-slate-600">
                      Rule: <span className="font-mono text-slate-500">{warning.nexus_rule}</span>
                    </p>
                  )}

                  {/* Affected items/dimensions */}
                  {warning.affected_dimension_ids && warning.affected_dimension_ids.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {warning.affected_dimension_ids.map((d) => (
                        <span key={d} className="rounded bg-slate-700 px-1.5 py-0.5 font-mono text-xs text-slate-400">
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                  {warning.affected_item_ids && warning.affected_item_ids.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {warning.affected_item_ids.map((id) => (
                        <span key={id} className="rounded bg-slate-700 px-1.5 py-0.5 font-mono text-xs text-slate-400">
                          {id}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Acknowledge checkbox or block label */}
                <div className="shrink-0">
                  {isAcknowledgeable ? (
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isAcknowledged}
                        onChange={() => toggle(warning.code)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-700 accent-blue-600"
                      />
                      <span className="text-xs text-slate-500">Acknowledge</span>
                    </label>
                  ) : (
                    <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                      Resolve first
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion state */}
      {allAcknowledged && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-5 py-4">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-emerald-400">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium text-emerald-400">All governance items acknowledged — ready to approve.</p>
        </div>
      )}
    </div>
  );
}
