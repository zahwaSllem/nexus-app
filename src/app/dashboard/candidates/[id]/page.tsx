"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useStore } from "@/lib/providers/store-provider";
import type { AssignmentStatus } from "@/lib/types/nexus";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<
  AssignmentStatus,
  { label: string; variant: "success" | "warning" | "default" | "info" }
> = {
  not_started: { label: "Not Started", variant: "default"  },
  in_progress:  { label: "In Progress", variant: "warning"  },
  completed:    { label: "Completed",   variant: "success"  },
  expired:      { label: "Expired",     variant: "info"     },
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ─── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
  params: { id: string };
}

export default function CandidateProfilePage({ params }: PageProps) {
  const { candidates, assignments } = useStore();
  const candidate = candidates.find((c) => c.candidate_id === params.id);

  if (!candidate) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Link
            href="/dashboard/candidates"
            className="text-sm text-slate-500 transition-colors hover:text-slate-700 dark:hover:text-slate-300"
          >
            ← Candidates
          </Link>
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          Candidate not found. They may have been created in a different session.
        </p>
      </div>
    );
  }

  const candidateAssignments = assignments.filter((a) => a.candidate_id === params.id);
  const statusCfg = STATUS_BADGE[candidate.latest_status];

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/dashboard/candidates"
          className="text-sm text-slate-500 transition-colors hover:text-slate-700 dark:hover:text-slate-300"
        >
          ← Candidates
        </Link>
      </div>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {candidate.candidate_name}
          </h1>
          <p className="mt-1 font-mono text-sm text-slate-500 dark:text-slate-400">
            {candidate.candidate_email}
          </p>
        </div>
        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Left column */}
        <div className="space-y-5 lg:col-span-2">

          {/* Assignments */}
          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
            </CardHeader>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {candidateAssignments.map((a) => {
                const cfg = STATUS_BADGE[a.status];
                return (
                  <div key={a.assignment_id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                        {a.assignment_id}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Assigned {fmtDate(a.assigned_at)} · Deadline {fmtDate(a.deadline)}
                      </p>
                    </div>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                );
              })}
              {candidateAssignments.length === 0 && (
                <div className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                  No assignments found.
                </div>
              )}
            </div>
          </Card>

          {/* Domains */}
          <Card>
            <CardHeader>
              <CardTitle>Domains Covered</CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-2 px-6 py-4">
              {candidate.domains.length > 0 ? (
                candidate.domains.map((d) => (
                  <span
                    key={d}
                    className="rounded bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                  >
                    {d}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500 dark:text-slate-400">No domains assigned.</span>
              )}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Candidate ID", value: candidate.candidate_id },
                { label: "Name",         value: candidate.candidate_name },
                { label: "Email",        value: candidate.candidate_email },
                { label: "Assignments",  value: String(candidateAssignments.length) },
              ].map((item) => (
                <div key={item.label} className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                  <span className="break-all text-right font-medium text-slate-900 dark:text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href="/dashboard/reports"
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/30"
              >
                <span>View Reports</span>
                <span className="text-slate-400">→</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
