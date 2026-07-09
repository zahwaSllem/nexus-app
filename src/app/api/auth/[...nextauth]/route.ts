// Nexus — Auth.js (NextAuth v5) route handler
// Exposes /api/auth/* (signin, callback, session, csrf, signout).
// Runs in the Node runtime (default for route handlers) so Prisma + scrypt work.
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
