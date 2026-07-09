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
