// Nexus — Prisma client singleton
// ─────────────────────────────────────────────────────────────────────────────
// A single PrismaClient reused across hot-reloads in development (Next.js remounts
// modules on every change, which would otherwise open a new pool each time).
//
// Sprint 1 scope: this client exists ONLY for authentication (verifying the seeded
// users at login). It is NOT used to serve blueprints, assignments, reports, or any
// other business data — those still come from the frontend mock store, untouched.
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
