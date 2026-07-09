// Nexus — route protection middleware (Auth.js v5, Edge runtime)
// ─────────────────────────────────────────────────────────────────────────────
// Delegates to the edge-safe `authConfig.authorized` callback, which enforces:
//   /dashboard/*, /admin/*      → admin only
//   /candidate/*, /assessment/* → candidate only
// Unauthenticated users are redirected to /login?redirect=<path>; wrong-role users
// are redirected to their own home. No Prisma/crypto here (Edge-safe by design).
// ─────────────────────────────────────────────────────────────────────────────

import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/assessment/:path*",
    "/candidate/:path*",
  ],
};
