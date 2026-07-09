// Nexus — Auth.js (NextAuth v5) EDGE-SAFE config
// ─────────────────────────────────────────────────────────────────────────────
// This config is imported by BOTH `src/middleware.ts` (Edge runtime) and
// `src/auth.ts` (Node runtime). It must therefore contain NO Prisma and NO Node
// `crypto` — those live only in `src/auth.ts`, which adds the Credentials provider.
//
// Responsibilities:
//   • session shape (JWT strategy — required for Credentials + Edge middleware)
//   • jwt/session callbacks that carry user_id + role_type into the session
//   • the `authorized` callback that enforces role-based route protection
//
// Route protection (two roles only — admin, candidate):
//   /dashboard/*, /admin/*      → admin only
//   /candidate/*, /assessment/* → candidate only
// Unauthenticated → /login?redirect=<path>. Wrong role → sent to own home.
// ─────────────────────────────────────────────────────────────────────────────

import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

type NexusRole = "admin" | "candidate";

const ADMIN_PREFIXES = ["/dashboard", "/admin"];
const CANDIDATE_PREFIXES = ["/candidate", "/assessment"];

const ADMIN_HOME = "/dashboard/agent";
const CANDIDATE_HOME = "/candidate/dashboard";

export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  // Real provider (Credentials + Prisma + scrypt) is added in src/auth.ts.
  // Kept empty here so the Edge middleware never pulls in Node-only code.
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.user_id = user.user_id;
        token.role_type = user.role_type;
        token.email = user.email ?? token.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        // token fields are written by the jwt() callback above; cast on read
        // because the next-auth/jwt augmentation does not merge under
        // moduleResolution: "bundler".
        session.user.user_id = token.user_id as string;
        session.user.role_type = token.role_type as NexusRole;
        if (typeof token.email === "string") session.user.email = token.email;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const path = nextUrl.pathname;

      const isAdminArea = ADMIN_PREFIXES.some((p) => path.startsWith(p));
      const isCandidateArea = CANDIDATE_PREFIXES.some((p) => path.startsWith(p));

      // Public / unmatched routes: always allow.
      if (!isAdminArea && !isCandidateArea) return true;

      const user = auth?.user;

      // Not signed in → send to login, preserving the intended destination.
      if (!user) {
        const url = new URL("/login", nextUrl);
        url.searchParams.set("redirect", path);
        return NextResponse.redirect(url);
      }

      // Signed in but wrong role → redirect to that role's home.
      if (isAdminArea && user.role_type !== "admin") {
        return NextResponse.redirect(new URL(CANDIDATE_HOME, nextUrl));
      }
      if (isCandidateArea && user.role_type !== "candidate") {
        return NextResponse.redirect(new URL(ADMIN_HOME, nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
