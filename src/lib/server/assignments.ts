// Nexus — Assignment serializers + creation helpers (server-only)
// ─────────────────────────────────────────────────────────────────────────────
// Convert Prisma Assignment rows into the AssessmentAssignmentSchema DTO and the
// CreatedAssignmentRecordSchema record, and generate the same id / invitation-link
// shapes the mock store used, so the frontend can later swap store→API with no
// shape changes (see src/lib/providers/store-provider.tsx).
//
//  • DateTime columns → ISO strings (schemas expect strings). null → undefined.
//  • Emails are normalized (trim + lowercase) for candidate de-duplication, matching
//    the auth flow which lowercases email at login.
//  • These helpers never touch question-bank metadata and never start sessions.
// ─────────────────────────────────────────────────────────────────────────────

import type { Assignment } from "@prisma/client";
import {
  AssessmentAssignmentSchema,
  type AssessmentAssignmentDTO,
} from "@/lib/api/schemas";

/** Normalize an email for candidate de-duplication + storage. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** `ASGN-XXXXXX` — matches the mock store's makeAssignmentId(). */
export function makeAssignmentId(): string {
  return `ASGN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/** `cand-xxxxx` — matches the mock store's makeCandidateId(). */
export function makeCandidateId(): string {
  return `cand-${Math.random().toString(36).slice(2, 7)}`;
}

/** Candidate invite URL — matches the mock store's makeInvitationLink(). */
export function makeInvitationLink(assignmentId: string): string {
  return `https://nexus.io/candidate/accept/${assignmentId.toLowerCase()}`;
}

/** Prisma Assignment row → AssessmentAssignment DTO (validated). */
export function toAssignmentDTO(row: Assignment): AssessmentAssignmentDTO {
  return AssessmentAssignmentSchema.parse({
    assignment_id: row.assignment_id,
    blueprint_id: row.blueprint_id,
    assessment_blueprint_id: row.assessment_blueprint_id,
    candidate_id: row.candidate_id,
    candidate_name: row.candidate_name,
    candidate_email: row.candidate_email,
    job_title: row.job_title ?? undefined,
    use_case: row.use_case,
    status: row.status,
    consent_confirmed: row.consent_confirmed,
    consent_date: row.consent_date ? row.consent_date.toISOString() : undefined,
    deadline: row.deadline.toISOString(),
    assigned_at: row.assigned_at.toISOString(),
    assigned_by: row.assigned_by,
    session_id: row.session_id ?? undefined,
    completed_at: row.completed_at ? row.completed_at.toISOString() : undefined,
    invitation_link: row.invitation_link ?? undefined,
    invitation_status: row.invitation_status ?? undefined,
  });
}
