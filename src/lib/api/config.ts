// Nexus — Frontend API configuration + data-source toggle
// ─────────────────────────────────────────────────────────────────────────────
// Central switch for endpoint-by-endpoint integration. Nothing here flips the app
// to the API yet — DATA_SOURCE defaults to "mock", and no page reads these clients.
//
//   • NEXT_PUBLIC_DATA_SOURCE = "mock" (default) | "api"
//       "mock" → pages keep reading the in-memory mock store (current behavior).
//       "api"  → pages will read the real backend (future, per-endpoint rollout).
//   • NEXT_PUBLIC_API_BASE_URL = "" (default → same-origin) | absolute base URL
//
// NEXT_PUBLIC_* vars are inlined into the browser bundle at build time.
// ─────────────────────────────────────────────────────────────────────────────

export type DataSource = "mock" | "api";

/** Active data source. Defaults to "mock" so current behavior is unchanged. */
export const DATA_SOURCE: DataSource =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "api" ? "api" : "mock";

/** Base URL prepended to API paths. "" means same-origin (relative fetch). */
export const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/** True when the app should read from the real backend APIs. */
export const isApiMode = (): boolean => DATA_SOURCE === "api";

/** True when the app should read from the in-memory mock store (current default). */
export const isMockMode = (): boolean => DATA_SOURCE === "mock";
