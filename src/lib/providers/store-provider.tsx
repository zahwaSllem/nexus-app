"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ASSIGNMENTS } from "@/lib/mock-data/assignments";
import { BLUEPRINTS } from "@/lib/mock-data/blueprints";
import type { AssessmentAssignment, AssignmentStatus } from "@/lib/types/nexus";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type StoredCandidate = {
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  assignment_ids: string[];
  latest_status: AssignmentStatus;
  domains: string[];
  blueprint_id: string;
  assessment_blueprint_id: string;
  assigned_at: string;
};

type CreateAssignmentParams = {
  blueprintId: string;
  assessmentBlueprintId: string;
  candidateName: string;
  candidateEmail: string;
  deadline: string;
  useCase: "developmental" | "hiring_support_validated_blueprint";
  includedDomains: string[];
};

type StoreContextValue = {
  assignments: AssessmentAssignment[];
  candidates: StoredCandidate[];
  createAssignment: (params: CreateAssignmentParams) => string;
};

// ─── Seed helpers ───────────────────────────────────────────────────────────────

function seedCandidates(assignments: AssessmentAssignment[]): StoredCandidate[] {
  const map = new Map<string, StoredCandidate>();

  for (const a of assignments) {
    const blueprint = BLUEPRINTS.find((b) => b.blueprint_id === a.blueprint_id);
    const domains = blueprint?.included_domains ?? [];
    const existing = map.get(a.candidate_id);

    if (existing) {
      existing.assignment_ids.push(a.assignment_id);
      if (a.assigned_at > existing.assigned_at) {
        existing.latest_status = a.status;
        existing.assigned_at = a.assigned_at;
        existing.blueprint_id = a.blueprint_id;
        existing.assessment_blueprint_id = a.assessment_blueprint_id;
        existing.domains = domains;
      }
    } else {
      map.set(a.candidate_id, {
        candidate_id: a.candidate_id,
        candidate_name: a.candidate_name,
        candidate_email: a.candidate_email,
        assignment_ids: [a.assignment_id],
        latest_status: a.status,
        domains,
        blueprint_id: a.blueprint_id,
        assessment_blueprint_id: a.assessment_blueprint_id,
        assigned_at: a.assigned_at,
      });
    }
  }

  return Array.from(map.values());
}

// ─── Context ────────────────────────────────────────────────────────────────────

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<AssessmentAssignment[]>(ASSIGNMENTS);
  const [candidates, setCandidates] = useState<StoredCandidate[]>(() =>
    seedCandidates(ASSIGNMENTS),
  );

  function createAssignment(params: CreateAssignmentParams): string {
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    const assignmentId = `ASGN-${suffix}`;
    const candidateId = `cand-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const newAssignment: AssessmentAssignment = {
      assignment_id: assignmentId,
      blueprint_id: params.blueprintId,
      assessment_blueprint_id: params.assessmentBlueprintId,
      candidate_id: candidateId,
      candidate_name: params.candidateName,
      candidate_email: params.candidateEmail,
      use_case: params.useCase,
      status: "not_started",
      consent_confirmed: false,
      deadline: params.deadline,
      assigned_at: now,
      assigned_by: "admin@nexus.io",
    };

    const newCandidate: StoredCandidate = {
      candidate_id: candidateId,
      candidate_name: params.candidateName,
      candidate_email: params.candidateEmail,
      assignment_ids: [assignmentId],
      latest_status: "not_started",
      domains: params.includedDomains,
      blueprint_id: params.blueprintId,
      assessment_blueprint_id: params.assessmentBlueprintId,
      assigned_at: now,
    };

    setAssignments((prev) => [...prev, newAssignment]);
    setCandidates((prev) => [...prev, newCandidate]);

    return assignmentId;
  }

  return (
    <StoreContext.Provider value={{ assignments, candidates, createAssignment }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
