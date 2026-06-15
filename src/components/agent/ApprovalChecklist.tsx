"use client";

import { useState } from "react";
import Link from "next/link";

const CHECKLIST_ITEMS = [
  {
    id: "calibration",
    text: "I confirm calibration status is acknowledged. All scores will carry scoring_version: 1.0.0-provisional and are not normatively validated.",
  },
  {
    id: "use_case",
    text: "I confirm this blueprint is approved for the use case: Hiring Support — Validated Blueprint. It may not be used for other purposes without a separate blueprint.",
  },
  {
    id: "consent",
    text: "I confirm that per-use-case informed consent will be collected from each candidate before their assessment session begins.",
  },
] as const;

interface ApprovalChecklistProps {
  blueprintId: string;
  useCaseLabel: string;
  onApprove: () => void;
}

export function ApprovalChecklist({ blueprintId, useCaseLabel, onApprove }: ApprovalChecklistProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [approved, setApproved] = useState(false);
  const [approvedAt] = useState(() => new Date().toISOString());

  const allChecked = checked.size >= CHECKLIST_ITEMS.length;

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleApprove() {
    if (!allChecked) return;
    setApproved(true);
    onApprove();
  }

  if (approved) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-8 text-center">
        {/* Success mark */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-8 w-8 text-emerald-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Blueprint Approved</h2>
          <p className="mt-2 text-sm text-slate-400">
            This blueprint is now available for candidate assignment.
          </p>
        </div>

        {/* Approval details */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-left">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">Approval Record</p>
          <div className="space-y-2.5">
            {[
              { label: "Blueprint ID", value: blueprintId },
              { label: "Use Case", value: useCaseLabel },
              { label: "Approved by", value: "admin@nexus.io" },
              { label: "Approved at", value: new Date(approvedAt).toLocaleString() },
              { label: "Scoring version", value: "1.0.0-provisional" },
              { label: "Status", value: "approved" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-500">{row.label}</span>
                <span className="font-mono text-xs font-medium text-slate-300">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard/assessments/new"
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition-all duration-200 hover:from-indigo-700 hover:to-violet-700 hover:shadow-brand-lg active:scale-[0.97]"
          >
            Assign Assessment
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link
            href="/dashboard/blueprints"
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white"
          >
            View in Blueprint Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Preamble */}
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-sm">
            N
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Final approval confirmation</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              By approving this blueprint, you confirm that it is ready for operational use under the stated use case.
              Blueprint ID: <span className="font-mono text-slate-300">{blueprintId}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Compliance Checklist — all three required
        </p>
        {CHECKLIST_ITEMS.map((item) => {
          const isChecked = checked.has(item.id);
          return (
            <label
              key={item.id}
              className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all duration-200 ${
                isChecked
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-slate-700 bg-slate-800 hover:-translate-y-0.5 hover:border-slate-600 hover:shadow-md"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(item.id)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-700 accent-emerald-500"
                />
              </div>
              <p className={`text-sm leading-relaxed ${isChecked ? "text-slate-200" : "text-slate-400"}`}>
                {item.text}
              </p>
            </label>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{checked.size} of {CHECKLIST_ITEMS.length} confirmed</span>
        {allChecked && <span className="text-emerald-400">All items confirmed</span>}
      </div>

      {/* Approve button */}
      <button
        type="button"
        onClick={handleApprove}
        disabled={!allChecked}
        className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-brand transition-all duration-200 hover:from-indigo-700 hover:to-violet-700 hover:shadow-brand-lg active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Approve Blueprint
      </button>

      <p className="text-center text-xs text-slate-700">
        This action moves the blueprint status to <span className="font-mono">approved</span>.
        The blueprint will be available for candidate assignment.
      </p>
    </div>
  );
}
