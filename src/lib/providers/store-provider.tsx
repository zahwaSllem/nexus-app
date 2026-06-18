"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ASSIGNMENTS } from "@/lib/mock-data/assignments";
import { BLUEPRINTS } from "@/lib/mock-data/blueprints";
import type {
  AssessmentAssignment,
  AssignmentStatus,
  InvitationStatus,
} from "@/lib/types/nexus";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type StoredCandidate = {
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  job_title?: string;
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

// One row of validated candidate input for a bulk assignment.
export type BulkCandidateInput = {
  name: string;
  email: string;
  jobTitle?: string;
};

type CreateBulkParams = {
  blueprintId: string;
  assessmentBlueprintId: string;
  deadline: string;
  useCase: "developmental" | "hiring_support_validated_blueprint";
  includedDomains: string[];
  candidates: BulkCandidateInput[];
};

// What the bulk flow hands back to the confirmation screen.
export type CreatedAssignmentRecord = {
  assignmentId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle?: string;
  invitationLink: string;
  invitationStatus: InvitationStatus;
};

type StoreContextValue = {
  assignments: AssessmentAssignment[];
  candidates: StoredCandidate[];
  createAssignment: (params: CreateAssignmentParams) => string;
  createAssignmentsBulk: (params: CreateBulkParams) => CreatedAssignmentRecord[];
  setInvitationStatus: (assignmentId: string, status: InvitationStatus) => void;
};

// ─── ID + link helpers ───────────────────────────────────────────────────────

function makeAssignmentId(): string {
  return `ASGN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function makeCandidateId(): string {
  return `cand-${Math.random().toString(36).slice(2, 7)}`;
}

function makeInvitationLink(assignmentId: string): string {
  return `https://nexus.io/candidate/accept/${assignmentId.toLowerCase()}`;
}

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
    const assignmentId = makeAssignmentId();
    const candidateId = makeCandidateId();
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
      invitation_link: makeInvitationLink(assignmentId),
      invitation_status: "not_sent",
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

  // Creates N assignments + candidates in a single batched state update.
  // Re-uses an existing candidate record when the email already matches one
  // (update), otherwise creates a new candidate.
  function createAssignmentsBulk(params: CreateBulkParams): CreatedAssignmentRecord[] {
    const now = new Date().toISOString();
    const newAssignments: AssessmentAssignment[] = [];
    const newCandidates: StoredCandidate[] = [];
    const records: CreatedAssignmentRecord[] = [];

    // Index existing candidates by email for the "update vs create" decision.
    const existingByEmail = new Map(
      candidates.map((c) => [c.candidate_email.toLowerCase(), c]),
    );

    for (const input of params.candidates) {
      const assignmentId = makeAssignmentId();
      const emailKey = input.email.trim().toLowerCase();
      const existing = existingByEmail.get(emailKey);
      const candidateId = existing?.candidate_id ?? makeCandidateId();
      const invitationLink = makeInvitationLink(assignmentId);

      newAssignments.push({
        assignment_id: assignmentId,
        blueprint_id: params.blueprintId,
        assessment_blueprint_id: params.assessmentBlueprintId,
        candidate_id: candidateId,
        candidate_name: input.name.trim(),
        candidate_email: input.email.trim(),
        job_title: input.jobTitle?.trim() || undefined,
        use_case: params.useCase,
        status: "not_started",
        consent_confirmed: false,
        deadline: params.deadline,
        assigned_at: now,
        assigned_by: "admin@nexus.io",
        invitation_link: invitationLink,
        invitation_status: "not_sent",
      });

      if (!existing) {
        newCandidates.push({
          candidate_id: candidateId,
          candidate_name: input.name.trim(),
          candidate_email: input.email.trim(),
          job_title: input.jobTitle?.trim() || undefined,
          assignment_ids: [assignmentId],
          latest_status: "not_started",
          domains: params.includedDomains,
          blueprint_id: params.blueprintId,
          assessment_blueprint_id: params.assessmentBlueprintId,
          assigned_at: now,
        });
      }

      records.push({
        assignmentId,
        candidateId,
        candidateName: input.name.trim(),
        candidateEmail: input.email.trim(),
        jobTitle: input.jobTitle?.trim() || undefined,
        invitationLink,
        invitationStatus: "not_sent",
      });
    }

    setAssignments((prev) => [...prev, ...newAssignments]);
    setCandidates((prev) => {
      // Append new candidates and refresh the assignment list / status of any
      // existing candidate that received a new assignment in this batch.
      const updated = prev.map((c) => {
        const added = newAssignments.filter(
          (a) => a.candidate_id === c.candidate_id,
        );
        if (added.length === 0) return c;
        return {
          ...c,
          assignment_ids: [...c.assignment_ids, ...added.map((a) => a.assignment_id)],
          latest_status: "not_started" as AssignmentStatus,
          assigned_at: now,
        };
      });
      return [...updated, ...newCandidates];
    });

    return records;
  }

  function setInvitationStatus(assignmentId: string, status: InvitationStatus): void {
    setAssignments((prev) =>
      prev.map((a) =>
        a.assignment_id === assignmentId ? { ...a, invitation_status: status } : a,
      ),
    );
  }

  return (
    <StoreContext.Provider
      value={{
        assignments,
        candidates,
        createAssignment,
        createAssignmentsBulk,
        setInvitationStatus,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
