"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BLUEPRINTS } from "@/lib/mock-data/blueprints";
import { getAssessmentBlueprintByRoleBlueprint } from "@/lib/mock-data/assessment-blueprints";
import { useStore } from "@/lib/providers/store-provider";
import type { RoleBlueprint } from "@/lib/types/nexus";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const USE_CASE_LABELS: Record<string, string> = {
  developmental:                     "Developmental Feedback",
  hiring_support_validated_blueprint: "Hiring Support — Validated Blueprint",
};

const APPROVAL_STATUS_CONFIG: Record<string, { label: string; selectable: boolean; note?: string }> = {
  approved:  { label: "Approved",  selectable: true  },
  validated: { label: "Validated", selectable: true  },
  reviewed:  { label: "Reviewed",  selectable: false, note: "Requires admin approval before use" },
  draft:     { label: "Draft",     selectable: false, note: "Blueprint approval required" },
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function fmtDeadline(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function BlueprintCard({
  blueprint,
  selected,
  onSelect,
}: {
  blueprint: RoleBlueprint;
  selected: boolean;
  onSelect: () => void;
}) {
  const cfg = APPROVAL_STATUS_CONFIG[blueprint.approval_status] ?? { label: blueprint.approval_status, selectable: false };
  const ab = getAssessmentBlueprintByRoleBlueprint(blueprint.blueprint_id);

  return (
    <button
      type="button"
      disabled={!cfg.selectable}
      onClick={cfg.selectable ? onSelect : undefined}
      className={`w-full rounded-xl border p-4 text-left transition-all ${
        !cfg.selectable
          ? "cursor-not-allowed border-slate-700/40 bg-slate-800/40 opacity-50"
          : selected
          ? "border-blue-500 bg-blue-600/10 ring-1 ring-blue-500/40"
          : "border-slate-700 bg-slate-800 hover:border-slate-600"
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{blueprint.role_context.role_title}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {blueprint.role_context.job_level} · {blueprint.role_context.job_family}
            {blueprint.role_context.industry ? ` · ${blueprint.role_context.industry}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              cfg.selectable
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-700 text-slate-500"
            }`}
          >
            {cfg.label}
          </span>
          {selected && (
            <span className="flex items-center gap-1 text-xs text-blue-400">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Selected
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {blueprint.included_domains.map((d) => (
          <span key={d} className="rounded bg-slate-700 px-1.5 py-0.5 font-mono text-xs font-bold text-slate-300">
            {d}
          </span>
        ))}
        {ab && (
          <span className="text-xs text-slate-600">
            {ab.total_items} items · ~{ab.estimated_duration_min} min
          </span>
        )}
      </div>

      {cfg.note && (
        <p className="mt-2 text-xs text-slate-600">{cfg.note}</p>
      )}
    </button>
  );
}

// ─── Confirmation view ─────────────────────────────────────────────────────────

function ConfirmationView({ assignmentId, candidateEmail }: { assignmentId: string; candidateEmail: string }) {
  const [copied, setCopied] = useState(false);
  const inviteUrl = `https://nexus.io/candidate/accept/${assignmentId.toLowerCase()}`;

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-lg py-8 text-center">

      {/* Success icon */}
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-8 w-8 text-emerald-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-white">Assessment Assigned</h2>
      <p className="mt-2 text-sm text-slate-400">
        The assessment has been assigned to{" "}
        <span className="font-medium text-slate-200">{candidateEmail}</span>.
      </p>

      {/* Assignment record */}
      <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800 p-5 text-left">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">Assignment Record</p>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Assignment ID</span>
            <span className="font-mono text-xs font-bold text-white">{assignmentId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Candidate</span>
            <span className="font-mono text-xs text-slate-300">{candidateEmail}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Status</span>
            <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300">
              Not Started
            </span>
          </div>
        </div>
      </div>

      {/* Invitation link */}
      <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-left">
        <p className="mb-2 text-xs font-medium text-blue-400">Mock Invitation Link</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 break-all rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-400">
            {inviteUrl}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-600">
          This link is a mock placeholder. In production it would be sent to the candidate by email.
          Progress saving requires backend integration.
        </p>
      </div>

      {/* CTAs */}
      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/dashboard/assessments"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
        >
          View All Assignments
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        <Link
          href="/dashboard/assessments/new"
          className="flex w-full items-center justify-center rounded-lg border border-slate-700 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-slate-200"
        >
          Create Another Assignment
        </Link>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function NewAssessmentPage() {
  const { createAssignment } = useStore();
  const [blueprintId, setBlueprintId]     = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [deadline, setDeadline]           = useState("");
  const [confirmed, setConfirmed]         = useState(false);
  const [assignmentId, setAssignmentId]   = useState("");

  const selectedBlueprint = useMemo(
    () => BLUEPRINTS.find((b) => b.blueprint_id === blueprintId) ?? null,
    [blueprintId]
  );

  const assessmentBlueprint = useMemo(
    () => (selectedBlueprint ? getAssessmentBlueprintByRoleBlueprint(selectedBlueprint.blueprint_id) : null),
    [selectedBlueprint]
  );

  // Form validity — all required fields
  const nameValid  = candidateName.trim().length > 0;
  const emailValid = isValidEmail(candidateEmail);
  const dateValid  = deadline.length > 0 && deadline >= todayString();
  const formValid  = blueprintId !== "" && nameValid && emailValid && dateValid;

  function handleSubmit() {
    if (!formValid || !selectedBlueprint) return;
    const id = createAssignment({
      blueprintId: selectedBlueprint.blueprint_id,
      assessmentBlueprintId: assessmentBlueprint?.assessment_blueprint_id ?? `abp-${selectedBlueprint.blueprint_id}`,
      candidateName,
      candidateEmail,
      deadline,
      useCase: selectedBlueprint.role_context.use_case,
      includedDomains: selectedBlueprint.included_domains,
    });
    setAssignmentId(id);
    setConfirmed(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Confirmation view ────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="min-h-full bg-slate-900 p-8">
        <div className="mb-6">
          <Link
            href="/dashboard/assessments"
            className="flex w-fit items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-300"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Assessments
          </Link>
        </div>
        <ConfirmationView assignmentId={assignmentId} candidateEmail={candidateEmail} />
      </div>
    );
  }

  // ── Form view ────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-slate-900 p-8">

      {/* Breadcrumb + header */}
      <div className="mb-6">
        <Link
          href="/dashboard/assessments"
          className="flex w-fit items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-300"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Assessments
        </Link>
      </div>

      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-blue-400">
          New Assignment
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Assign Assessment</h1>
        <p className="mt-1 text-sm text-slate-400">
          Select an approved blueprint and assign it to a candidate.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">

        {/* ── Form (left 2/3) ─────────────────────────────────────── */}
        <div className="space-y-8 lg:col-span-2">

          {/* Step 1: Blueprint selection */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                1
              </div>
              <h2 className="text-sm font-semibold text-white">Select Role Blueprint</h2>
            </div>
            <div className="space-y-3">
              {BLUEPRINTS.map((bp) => (
                <BlueprintCard
                  key={bp.blueprint_id}
                  blueprint={bp}
                  selected={blueprintId === bp.blueprint_id}
                  onSelect={() => setBlueprintId(bp.blueprint_id)}
                />
              ))}
            </div>
          </section>

          {/* Step 2: Candidate details */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white transition-colors ${blueprintId ? "bg-blue-600" : "bg-slate-700"}`}>
                2
              </div>
              <h2 className="text-sm font-semibold text-white">Candidate Details</h2>
            </div>
            <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-800 p-5">
              <div>
                <label htmlFor="candidate-name" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Candidate Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="candidate-name"
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  className="w-full rounded-lg border border-slate-700 bg-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40"
                />
              </div>
              <div>
                <label htmlFor="candidate-email" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Candidate Email <span className="text-red-400">*</span>
                </label>
                <input
                  id="candidate-email"
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="e.g. candidate@example.com"
                  className={`w-full rounded-lg border bg-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:ring-1 focus:ring-blue-500/40 ${
                    candidateEmail.length > 0 && !emailValid
                      ? "border-red-500/50 focus:border-red-500"
                      : "border-slate-700 focus:border-blue-500"
                  }`}
                />
                {candidateEmail.length > 0 && !emailValid && (
                  <p className="mt-1 text-xs text-red-400">Enter a valid email address.</p>
                )}
              </div>
            </div>
          </section>

          {/* Step 3: Assignment settings */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white transition-colors ${nameValid && emailValid ? "bg-blue-600" : "bg-slate-700"}`}>
                3
              </div>
              <h2 className="text-sm font-semibold text-white">Assignment Settings</h2>
            </div>
            <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-800 p-5">

              {/* Deadline */}
              <div>
                <label htmlFor="deadline" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Deadline <span className="text-red-400">*</span>
                </label>
                <input
                  id="deadline"
                  type="date"
                  value={deadline}
                  min={todayString()}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-700/50 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 [color-scheme:dark]"
                />
              </div>

              {/* Use case — read from blueprint */}
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-400">Use Case</p>
                <div className="rounded-lg border border-slate-700/50 bg-slate-700/20 px-4 py-2.5">
                  {selectedBlueprint ? (
                    <p className="text-sm text-slate-200">
                      {USE_CASE_LABELS[selectedBlueprint.role_context.use_case] ?? selectedBlueprint.role_context.use_case}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-600">Auto-filled from selected blueprint</p>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Use case is determined by the blueprint and cannot be changed here.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* ── Preview sidebar (right 1/3) ──────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Assignment Preview
          </h2>

          <div className={`rounded-xl border bg-slate-800 p-5 transition-all ${formValid ? "border-blue-500/30" : "border-slate-700"}`}>

            {!formValid ? (
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-700">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-slate-500">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-xs text-slate-600">
                  Complete all required fields to preview the assignment.
                </p>
                <div className="space-y-1.5 text-left">
                  {[
                    { done: blueprintId !== "",  label: "Blueprint selected"  },
                    { done: nameValid,           label: "Candidate name"      },
                    { done: emailValid,          label: "Valid email"         },
                    { done: dateValid,           label: "Deadline set"        },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${item.done ? "bg-emerald-500" : "bg-slate-700"}`} />
                      <span className={`text-xs ${item.done ? "text-slate-400" : "text-slate-600"}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-medium text-emerald-400">Ready to assign</p>

                {[
                  { label: "Blueprint",  value: selectedBlueprint?.role_context.role_title ?? "—" },
                  { label: "Domains",
                    value: (
                      <div className="flex gap-1">
                        {selectedBlueprint?.included_domains.map((d) => (
                          <span key={d} className="rounded bg-slate-700 px-1.5 py-0.5 font-mono text-xs font-bold text-slate-300">{d}</span>
                        ))}
                      </div>
                    )
                  },
                  { label: "Items",      value: assessmentBlueprint ? `${assessmentBlueprint.total_items} items · ~${assessmentBlueprint.estimated_duration_min} min` : "—" },
                  { label: "Candidate",  value: candidateName },
                  { label: "Email",      value: candidateEmail },
                  { label: "Deadline",   value: fmtDeadline(deadline) },
                  { label: "Use Case",   value: selectedBlueprint ? (USE_CASE_LABELS[selectedBlueprint.role_context.use_case] ?? "—") : "—" },
                ].map((row) => (
                  <div key={row.label}>
                    <p className="text-xs text-slate-500">{row.label}</p>
                    {typeof row.value === "string" ? (
                      <p className="mt-0.5 text-sm text-slate-200">{row.value}</p>
                    ) : (
                      <div className="mt-0.5">{row.value}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!formValid}
            className="w-full rounded-lg bg-blue-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Confirm & Assign
          </button>

          {formValid && (
            <p className="text-center text-xs text-slate-600">
              This creates a mock assignment. No data is persisted to a database.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
