"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BLUEPRINTS } from "@/lib/mock-data/blueprints";
import { getAssessmentBlueprintByRoleBlueprint } from "@/lib/mock-data/assessment-blueprints";
import { useStore, type CreatedAssignmentRecord } from "@/lib/providers/store-provider";
import type { InvitationStatus, RoleBlueprint } from "@/lib/types/nexus";

// ─── Constants + helpers ──────────────────────────────────────────────────────

const USE_CASE_LABELS: Record<string, string> = {
  developmental: "Developmental Feedback",
  hiring_support_validated_blueprint: "Hiring Support — Validated Blueprint",
};

const APPROVAL_STATUS_CONFIG: Record<string, { label: string; selectable: boolean; note?: string }> = {
  approved: { label: "Approved", selectable: true },
  validated: { label: "Validated", selectable: true },
  reviewed: { label: "Reviewed", selectable: false, note: "Requires admin approval before use" },
  draft: { label: "Draft", selectable: false, note: "Blueprint approval required" },
};

const SAMPLE_CSV = `name, email, job title
Jordan Smith, jordan.smith@example.com, Software Engineer
Priya Patel, priya.patel@example.com, Product Manager
Liam O'Connor, liam.oconnor@example.com
Dana Lee, dana.lee@example.com, Designer
Marcus Webb, not-an-email, Analyst
Jordan Smith, jordan.smith@example.com, Duplicate Row`;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

function fmtDeadline(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Parsing + validation ─────────────────────────────────────────────────────

type ParsedRow = {
  index: number;
  name: string;
  email: string;
  jobTitle?: string;
  errors: string[];
  duplicateReason?: string;
  valid: boolean;
};

/** Splits one CSV line into trimmed cells. Supports comma or tab delimiters. */
function splitLine(line: string): string[] {
  const delimiter = line.includes("\t") && !line.includes(",") ? "\t" : ",";
  return line.split(delimiter).map((c) => c.trim());
}

function looksLikeHeader(cells: string[]): boolean {
  const joined = cells.join(" ").toLowerCase();
  return joined.includes("email") && (joined.includes("name") || joined.includes("candidate"));
}

function parseCandidates(text: string, existingEmails: Set<string>): ParsedRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const rows: ParsedRow[] = [];
  const seenInBatch = new Map<string, number>(); // emailKey -> first row index

  lines.forEach((line, i) => {
    const cells = splitLine(line);
    if (i === 0 && looksLikeHeader(cells)) return; // skip header row

    const [name = "", email = "", jobTitle = ""] = cells;
    const errors: string[] = [];

    if (name.length === 0) errors.push("Name is required");
    if (email.length === 0) errors.push("Email is required");
    else if (!isValidEmail(email)) errors.push("Invalid email format");

    const emailKey = email.toLowerCase();
    let duplicateReason: string | undefined;
    if (email.length > 0 && isValidEmail(email)) {
      if (seenInBatch.has(emailKey)) {
        duplicateReason = `Duplicate of row ${(seenInBatch.get(emailKey) ?? 0) + 1}`;
      } else if (existingEmails.has(emailKey)) {
        duplicateReason = "Already in system";
      } else {
        seenInBatch.set(emailKey, rows.length);
      }
    }

    rows.push({
      index: rows.length,
      name,
      email,
      jobTitle: jobTitle.length > 0 ? jobTitle : undefined,
      errors,
      duplicateReason,
      valid: errors.length === 0 && !duplicateReason,
    });
  });

  return rows;
}

// ─── Blueprint card ───────────────────────────────────────────────────────────

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
          ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60 dark:border-slate-700/40 dark:bg-slate-800/40"
          : selected
          ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500/40 dark:bg-indigo-600/10"
          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{blueprint.role_context.role_title}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {blueprint.role_context.job_level} · {blueprint.role_context.job_family}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            cfg.selectable
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400"
              : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-500"
          }`}
        >
          {cfg.label}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {blueprint.included_domains.map((d) => (
          <span key={d} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {d}
          </span>
        ))}
        {ab && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {ab.total_items} items · ~{ab.estimated_duration_min} min
          </span>
        )}
      </div>
      {cfg.note && <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{cfg.note}</p>}
    </button>
  );
}

// ─── Invitation status badge ──────────────────────────────────────────────────

const INVITATION_STYLE: Record<InvitationStatus, { label: string; cls: string }> = {
  not_sent: { label: "Not Sent", cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
  sent: { label: "Sent", cls: "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-400" },
  opened: { label: "Opened", cls: "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400" },
};

// ─── Confirmation screen ──────────────────────────────────────────────────────

function ConfirmationScreen({ records }: { records: CreatedAssignmentRecord[] }) {
  const { setInvitationStatus } = useStore();
  const [statuses, setStatuses] = useState<Record<string, InvitationStatus>>(
    () => Object.fromEntries(records.map((r) => [r.assignmentId, r.invitationStatus])),
  );
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function updateStatus(assignmentId: string, status: InvitationStatus) {
    setStatuses((prev) => ({ ...prev, [assignmentId]: status }));
    setInvitationStatus(assignmentId, status);
  }

  function copyAll() {
    const all = records.map((r) => r.invitationLink).join("\n");
    navigator.clipboard.writeText(all).catch(() => {});
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  function copyOne(id: string, link: string) {
    navigator.clipboard.writeText(link).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl py-4">
      {/* Success header */}
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:ring-emerald-500/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-8 w-8 text-emerald-600 dark:text-emerald-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {records.length} assignment{records.length !== 1 ? "s" : ""} created
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Mock invitation links generated below. Each candidate now has a <span className="font-medium text-slate-700 dark:text-slate-300">Not Started</span> assignment.
        </p>
      </div>

      {/* Actions row */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Invitation Links
        </p>
        <button
          type="button"
          onClick={copyAll}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M7 5a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2h-1v-1h1a1 1 0 001-1V5a1 1 0 00-1-1H9a1 1 0 00-1 1v1H7V5z" />
            <path d="M3 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
          {copiedAll ? "Copied all!" : "Copy all links"}
        </button>
      </div>

      {/* Links list */}
      <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-700/60 dark:border-slate-700 dark:bg-slate-800">
        {records.map((r) => {
          const status = statuses[r.assignmentId];
          return (
            <div key={r.assignmentId} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.candidateName}</p>
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{r.candidateEmail}</p>
                  {r.jobTitle && <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{r.jobTitle}</p>}
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${INVITATION_STYLE[status].cls}`}>
                  {INVITATION_STYLE[status].label}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                  {r.invitationLink}
                </code>
                <button
                  type="button"
                  onClick={() => copyOne(r.assignmentId, r.invitationLink)}
                  className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200"
                >
                  {copiedId === r.assignmentId ? "Copied!" : "Copy"}
                </button>
              </div>

              {/* Mock invitation lifecycle controls */}
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Simulate:</span>
                <button
                  type="button"
                  onClick={() => updateStatus(r.assignmentId, "sent")}
                  disabled={status !== "not_sent"}
                  className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:border-blue-500/40 dark:hover:text-blue-400"
                >
                  Mark Sent
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(r.assignmentId, "opened")}
                  disabled={status === "opened"}
                  className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:border-emerald-500/40 dark:hover:text-emerald-400"
                >
                  Mark Opened
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
        Links are mock placeholders. In production they would be emailed to candidates. Invitation status is tracked in-memory only and resets on refresh.
      </p>

      {/* CTAs */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/dashboard/assessments"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Go to Assessments
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        <Link
          href="/dashboard/candidates"
          className="flex flex-1 items-center justify-center rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          View Candidates
        </Link>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BulkAssignPage() {
  const { candidates, createAssignmentsBulk } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [blueprintId, setBlueprintId] = useState("");
  const [csvText, setCsvText] = useState("");
  const [deadline, setDeadline] = useState("");
  const [records, setRecords] = useState<CreatedAssignmentRecord[] | null>(null);

  const selectedBlueprint = useMemo(
    () => BLUEPRINTS.find((b) => b.blueprint_id === blueprintId) ?? null,
    [blueprintId],
  );
  const assessmentBlueprint = useMemo(
    () => (selectedBlueprint ? getAssessmentBlueprintByRoleBlueprint(selectedBlueprint.blueprint_id) : null),
    [selectedBlueprint],
  );

  const existingEmails = useMemo(
    () => new Set(candidates.map((c) => c.candidate_email.toLowerCase())),
    [candidates],
  );

  const parsedRows = useMemo(
    () => parseCandidates(csvText, existingEmails),
    [csvText, existingEmails],
  );

  const validRows = parsedRows.filter((r) => r.valid);
  const invalidCount = parsedRows.filter((r) => r.errors.length > 0).length;
  const duplicateCount = parsedRows.filter((r) => r.errors.length === 0 && r.duplicateReason).length;

  const dateValid = deadline.length > 0 && deadline >= todayString();
  const canConfirm = blueprintId !== "" && dateValid && validRows.length > 0;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCsvText(String(reader.result ?? ""));
    reader.readAsText(file);
    e.target.value = ""; // allow re-uploading the same file
  }

  function handleConfirm() {
    if (!canConfirm || !selectedBlueprint) return;
    const created = createAssignmentsBulk({
      blueprintId: selectedBlueprint.blueprint_id,
      assessmentBlueprintId:
        assessmentBlueprint?.assessment_blueprint_id ?? `abp-${selectedBlueprint.blueprint_id}`,
      deadline,
      useCase: selectedBlueprint.role_context.use_case,
      includedDomains: selectedBlueprint.included_domains,
      candidates: validRows.map((r) => ({ name: r.name, email: r.email, jobTitle: r.jobTitle })),
    });
    setRecords(created);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Confirmation phase ───────────────────────────────────────────
  if (records) {
    return (
      <div className="min-h-full bg-slate-50 p-6 dark:bg-slate-900 sm:p-8">
        <Breadcrumb />
        <ConfirmationScreen records={records} />
      </div>
    );
  }

  // ── Form phase ───────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-slate-50 p-6 dark:bg-slate-900 sm:p-8">
      <Breadcrumb />

      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Bulk Assignment</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Assign to Multiple Candidates</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Select an approved blueprint, add candidates by CSV or paste, then review before assigning.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Left: form ────────────────────────────────────────── */}
        <div className="space-y-8 lg:col-span-2">
          {/* Step 1 — Blueprint */}
          <section>
            <StepHeader n={1} done={blueprintId !== ""} title="Select Role Blueprint" />
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

          {/* Step 2 — Candidates */}
          <section>
            <StepHeader n={2} done={validRows.length > 0} title="Add Candidates" />
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="csv" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  CSV format: <span className="font-mono">name, email, job title</span> (one per line)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCsvText(SAMPLE_CSV)}
                    className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200"
                  >
                    Load sample
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200"
                  >
                    Upload CSV
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv,text/plain"
                    onChange={handleFile}
                    className="hidden"
                  />
                </div>
              </div>
              <textarea
                id="csv"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={8}
                placeholder={"Jordan Smith, jordan.smith@example.com, Software Engineer\nPriya Patel, priya.patel@example.com, Product Manager"}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-mono text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900/40 dark:text-white dark:placeholder-slate-500"
              />
              {parsedRows.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
                    {validRows.length} valid
                  </span>
                  {invalidCount > 0 && (
                    <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-400">
                      {invalidCount} invalid
                    </span>
                  )}
                  {duplicateCount > 0 && (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400">
                      {duplicateCount} duplicate
                    </span>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Step 3 — Deadline */}
          <section>
            <StepHeader n={3} done={dateValid} title="Deadline" />
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <label htmlFor="deadline" className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Assessment Deadline <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                id="deadline"
                type="date"
                value={deadline}
                min={todayString()}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900/40 dark:text-white dark:[color-scheme:dark]"
              />
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                Use case is inherited from the blueprint:{" "}
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {selectedBlueprint
                    ? USE_CASE_LABELS[selectedBlueprint.role_context.use_case] ?? selectedBlueprint.role_context.use_case
                    : "select a blueprint"}
                </span>
              </p>
            </div>
          </section>
        </div>

        {/* ── Right: preview ────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Preview ({parsedRows.length} row{parsedRows.length !== 1 ? "s" : ""})
          </h2>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            {parsedRows.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Add candidates above to preview them here before assigning.
                </p>
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/60">
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      {["#", "Candidate", "Status"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {parsedRows.map((row) => (
                      <tr
                        key={row.index}
                        className={row.valid ? "" : "bg-red-50/50 dark:bg-red-500/5"}
                      >
                        <td className="px-3 py-2.5 align-top text-xs tabular-nums text-slate-400 dark:text-slate-500">
                          {row.index + 1}
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="text-xs font-medium text-slate-900 dark:text-white">
                            {row.name || <span className="italic text-slate-400">(no name)</span>}
                          </p>
                          <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {row.email || <span className="italic">(no email)</span>}
                          </p>
                          {row.jobTitle && <p className="text-[11px] text-slate-400 dark:text-slate-500">{row.jobTitle}</p>}
                          {(row.errors.length > 0 || row.duplicateReason) && (
                            <p className="mt-1 text-[11px] font-medium text-red-600 dark:text-red-400">
                              {[...row.errors, row.duplicateReason].filter(Boolean).join(" · ")}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          {row.valid ? (
                            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
                              Valid
                            </span>
                          ) : row.duplicateReason && row.errors.length === 0 ? (
                            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400">
                              Duplicate
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-400">
                              Invalid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary + confirm */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="space-y-2 text-xs">
              <SummaryRow label="Blueprint" value={selectedBlueprint?.role_context.role_title ?? "—"} />
              <SummaryRow label="Deadline" value={dateValid ? fmtDeadline(deadline) : "—"} />
              <SummaryRow label="Will create" value={`${validRows.length} assignment${validRows.length !== 1 ? "s" : ""}`} highlight />
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="mt-4 w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Confirm & Assign {validRows.length > 0 ? `(${validRows.length})` : ""}
            </button>
            {!canConfirm && (
              <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
                Select a blueprint, set a deadline, and add at least one valid candidate.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Small presentational helpers ─────────────────────────────────────────────

function Breadcrumb() {
  return (
    <div className="mb-6">
      <Link
        href="/dashboard/assessments"
        className="flex w-fit items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Assessments
      </Link>
    </div>
  );
}

function StepHeader({ n, done, title }: { n: number; done: boolean; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white transition-colors ${done ? "bg-emerald-600" : "bg-indigo-600"}`}>
        {done ? "✓" : n}
      </div>
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
    </div>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className={highlight ? "font-semibold text-indigo-600 dark:text-indigo-400" : "font-medium text-slate-900 dark:text-white"}>
        {value}
      </span>
    </div>
  );
}
