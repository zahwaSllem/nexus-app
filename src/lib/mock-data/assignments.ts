import type { AssessmentAssignment } from "@/lib/types/nexus";

// ─── Assignment 1 — Not started (linked to Blueprint A / Assessment Blueprint A) ──

export const ASSIGNMENT_1: AssessmentAssignment = {
  assignment_id: "asgn-001",
  blueprint_id: "bp-001",
  assessment_blueprint_id: "abp-001",
  candidate_id: "cand-001",
  candidate_name: "Alex Jordan",
  candidate_email: "candidate@nexus.io",
  use_case: "hiring_support_validated_blueprint",
  status: "not_started",
  consent_confirmed: false,
  deadline: "2026-06-20",
  assigned_at: "2026-06-10T11:00:00Z",
  assigned_by: "admin@nexus.io",
};

// ─── Assignment 2 — Completed (linked to Blueprint A / Assessment Blueprint A) ──

export const ASSIGNMENT_2: AssessmentAssignment = {
  assignment_id: "asgn-002",
  blueprint_id: "bp-001",
  assessment_blueprint_id: "abp-001",
  candidate_id: "cand-002",
  candidate_name: "Sam Rivera",
  candidate_email: "sam.rivera@example.com",
  use_case: "hiring_support_validated_blueprint",
  status: "completed",
  consent_confirmed: true,
  consent_date: "2026-06-08T09:30:00Z",
  deadline: "2026-06-15",
  assigned_at: "2026-06-07T14:00:00Z",
  assigned_by: "admin@nexus.io",
  session_id: "sess-001",
  completed_at: "2026-06-08T10:15:00Z",
};

export const ASSIGNMENTS = [ASSIGNMENT_1, ASSIGNMENT_2];

export function getAssignmentById(id: string): AssessmentAssignment | undefined {
  return ASSIGNMENTS.find((a) => a.assignment_id === id);
}

export function getAssignmentForCandidate(candidateId: string): AssessmentAssignment | undefined {
  return ASSIGNMENTS.find((a) => a.candidate_id === candidateId);
}

export function getPendingAssignments(): AssessmentAssignment[] {
  return ASSIGNMENTS.filter((a) => a.status === "not_started" || a.status === "in_progress");
}

export function getCompletedAssignments(): AssessmentAssignment[] {
  return ASSIGNMENTS.filter((a) => a.status === "completed");
}
