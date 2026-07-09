// Nexus — API auth guards
// ─────────────────────────────────────────────────────────────────────────────
// Server-side role checks for Route Handlers (defense in depth — the middleware
// already gates pages, but every API handler re-checks; never trust middleware
// alone). Returns a ready-to-send error response when access is denied, or null
// when the caller is an authenticated admin.
//
//   401 Unauthenticated · 403 wrong role (per docs/API_CONTRACT.md).
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Returns an error response if the caller is not an authenticated admin, else null. */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  if (session.user.role_type !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

type AdminUser = NonNullable<Session["user"]>;

export type AdminAuthResult =
  | { ok: true; user: AdminUser }
  | { ok: false; response: NextResponse };

/**
 * Like requireAdmin(), but on success returns the admin user (for audit actor
 * attribution). Use in handlers that must record who performed an action.
 */
export async function authorizeAdmin(): Promise<AdminAuthResult> {
  const session = await auth();

  if (!session?.user) {
    return { ok: false, response: NextResponse.json({ error: "Unauthenticated" }, { status: 401 }) };
  }
  if (session.user.role_type !== "admin") {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true, user: session.user };
}

export type CandidateAuthResult =
  | { ok: true; user: AdminUser; candidate: { candidate_id: string } }
  | { ok: false; response: NextResponse };

/**
 * Authorize a CANDIDATE and resolve their candidate profile. Session endpoints
 * are candidate-only (admins must never answer/submit assessments), so this
 * returns 403 for admins and 401 when unauthenticated. The candidate profile is
 * resolved by the linked user_id, falling back to a matching candidate_email —
 * it is required for any per-candidate ownership check.
 */
export async function authorizeCandidate(): Promise<CandidateAuthResult> {
  const session = await auth();

  if (!session?.user) {
    return { ok: false, response: NextResponse.json({ error: "Unauthenticated" }, { status: 401 }) };
  }
  if (session.user.role_type !== "candidate") {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const candidate = await prisma.candidate.findFirst({
    where: {
      OR: [
        { user_id: session.user.user_id },
        { candidate_email: (session.user.email ?? "").toLowerCase() },
      ],
    },
    select: { candidate_id: true },
  });
  if (!candidate) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No candidate profile for this user" }, { status: 403 }),
    };
  }

  return { ok: true, user: session.user, candidate };
}
