// Nexus — password verification
// ─────────────────────────────────────────────────────────────────────────────
// Verifies a plaintext password against the hash format written by `prisma/seed.ts`.
//
// Seed format (see prisma/seed.ts → hashPassword):
//   "scrypt:<saltHex>:<hashHex>"
//   where hashHex = scryptSync(plain, saltHex, 64).toString("hex")
//
// IMPORTANT: the seed passes the salt as its HEX STRING (not decoded bytes) to
// scryptSync, so verification must do the same — pass `saltHex` directly as the salt.
// Comparison is constant-time (timingSafeEqual) to avoid leaking timing information.
// ─────────────────────────────────────────────────────────────────────────────

import { scryptSync, timingSafeEqual } from "node:crypto";

export function verifyPassword(plain: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  const saltHex = parts[1];
  const hashHex = parts[2];

  let expected: Buffer;
  try {
    expected = Buffer.from(hashHex, "hex");
  } catch {
    return false;
  }
  if (expected.length === 0) return false;

  let actual: Buffer;
  try {
    // salt is the hex STRING, matching prisma/seed.ts hashPassword()
    actual = scryptSync(plain, saltHex, expected.length);
  } catch {
    return false;
  }

  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
