// Nexus — Frontend API layer barrel.
// Convenience re-exports so pages can later do:
//   import { listBankItems, ApiError, isApiMode } from "@/lib/api";
// Importing this file has no side effects and does NOT wire anything into the UI.

export * from "@/lib/api/config";
export * from "@/lib/api/client";
export * as bankApi from "@/lib/api/bank-client";
export * as blueprintsApi from "@/lib/api/blueprints-client";
export * as assignmentsApi from "@/lib/api/assignments-client";
export * as sessionsApi from "@/lib/api/sessions-client";
export * as scoringApi from "@/lib/api/scoring-client";
export * as reportsApi from "@/lib/api/reports-client";
export * as exportsApi from "@/lib/api/exports-client";
