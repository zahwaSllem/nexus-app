// Nexus — Auth.js (NextAuth v5) NODE config
// ─────────────────────────────────────────────────────────────────────────────
// Adds the Credentials provider to the edge-safe `authConfig`. This module runs
// only in the Node runtime (API route handler + server actions) because it uses
// Prisma and Node `crypto` (via verifyPassword). The middleware never imports it.
//
// Sprint 1 scope: authentication only. The provider verifies the seeded users
// (admin@nexus.io / candidate@nexus.io) against the scrypt hashes in the DB.
// ─────────────────────────────────────────────────────────────────────────────

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        if (!verifyPassword(password, user.password_hash)) return null;

        // Best-effort last-login stamp; never blocks sign-in.
        await prisma.user
          .update({
            where: { user_id: user.user_id },
            data: { last_login_at: new Date() },
          })
          .catch(() => undefined);

        // Returned object becomes the NextAuth `User` → flows into jwt() callback.
        return {
          id: user.user_id,
          user_id: user.user_id,
          email: user.email,
          role_type: user.role_type,
          name: user.display_name ?? undefined,
        };
      },
    }),
  ],
});
