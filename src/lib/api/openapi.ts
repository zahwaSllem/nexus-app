// Nexus — OpenAPI 3.0 spec builder (documentation only)
// ─────────────────────────────────────────────────────────────────────────────
// Describes the CURRENTLY IMPLEMENTED backend surface (Sprint 1 Auth + Sprint 2
// Question Bank). Component schemas are generated from the existing Zod schemas
// (z.toJSONSchema, Zod 4 native) so the docs never drift from validation.
//
// This module is documentation only — it defines no routes and touches no data.
// Not-yet-built endpoints are intentionally NOT listed as operations; they are
// summarized as text under info.description so the spec stays honest.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import {
  BankItemSchema,
  LoginRequestSchema,
  MethodFamilySchema,
  UseStatusSchema,
  RoleBlueprintSchema,
  AssessmentBlueprintSchema,
  GovernanceWarningSchema,
  ApproveBlueprintRequestSchema,
} from "@/lib/api/schemas";

/** Convert a Zod schema to an OpenAPI-embeddable JSON Schema (drop the $schema key). */
function jsonSchema(schema: z.ZodType): Record<string, unknown> {
  const s = z.toJSONSchema(schema) as Record<string, unknown>;
  delete s.$schema;
  return s;
}

const ERROR_RESPONSES = {
  "400": {
    description: "Invalid query parameters (Zod validation failed).",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
  },
  "401": {
    description: "Not authenticated (no valid session).",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
  },
  "403": {
    description: "Authenticated but not an admin (candidates cannot read bank metadata).",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
  },
} as const;

export function buildOpenApiSpec() {
  return {
    openapi: "3.0.3",
    info: {
      title: "Nexus Assessment Platform API",
      version: "0.3.0",
      description: [
        "Implemented backend surface for the Nexus platform.",
        "",
        "**Implemented (documented below):**",
        "- Auth.js credentials login + session (Sprint 1)",
        "- Read-only Question Bank (Sprint 2), admin-only",
        "- Role & Assessment Blueprints + approval (Sprint 3), admin-only",
        "",
        "**Planned / deferred (NOT yet implemented — not listed as operations):**",
        "Assignments, Candidate sessions, Scoring, Domain 6, Reports,",
        "PDF export, and the AI Agent. See docs/API_CONTRACT.md for the full contract.",
        "",
        "**Auth:** endpoints marked with a lock require the Auth.js session cookie",
        "(`authjs.session-token`), obtained by logging in via the credentials flow.",
      ].join("\n"),
    },
    servers: [{ url: "/", description: "Current origin" }],
    tags: [
      { name: "Auth", description: "Authentication & session (Auth.js / NextAuth v5)" },
      { name: "Question Bank", description: "Governed 543-item bank (admin-only, read-only)" },
      { name: "Blueprints", description: "Role & Assessment blueprints + approval (admin-only)" },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "authjs.session-token",
          description:
            "Auth.js JWT session cookie. Set automatically after a successful credentials login.",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
            issues: { type: "array", items: { type: "object" }, nullable: true },
          },
          required: ["error"],
        },
        LoginRequest: jsonSchema(LoginRequestSchema),
        BankItem: jsonSchema(BankItemSchema),
        RoleBlueprint: jsonSchema(RoleBlueprintSchema),
        AssessmentBlueprint: jsonSchema(AssessmentBlueprintSchema),
        GovernanceWarning: jsonSchema(GovernanceWarningSchema),
        ApproveBlueprintRequest: jsonSchema(ApproveBlueprintRequestSchema),
        Session: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                user_id: { type: "string", example: "user-admin" },
                email: { type: "string", example: "admin@nexus.io" },
                role_type: { type: "string", enum: ["admin", "candidate"] },
                name: { type: "string", nullable: true },
              },
            },
            expires: { type: "string", format: "date-time" },
          },
        },
      },
    },
    paths: {
      "/api/auth/callback/credentials": {
        post: {
          tags: ["Auth"],
          summary: "Log in with email + password (Auth.js credentials)",
          description:
            "Handled by Auth.js. Requires a CSRF token from `GET /api/auth/csrf`. " +
            "On success sets the session cookie and returns a 302 redirect. " +
            "Verifies the password against the seeded scrypt hash.",
          requestBody: {
            required: true,
            content: {
              "application/x-www-form-urlencoded": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/LoginRequest" },
                    {
                      type: "object",
                      properties: { csrfToken: { type: "string" } },
                      required: ["csrfToken"],
                    },
                  ],
                },
              },
            },
          },
          responses: {
            "302": { description: "Success → session cookie set; failure → redirect with error." },
          },
        },
      },
      "/api/auth/session": {
        get: {
          tags: ["Auth"],
          summary: "Get the current session",
          description: "Returns the authenticated user (with user_id + role_type), or null.",
          responses: {
            "200": {
              description: "Current session, or null when not authenticated.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/Session" } },
              },
            },
          },
        },
      },
      "/api/bank": {
        get: {
          tags: ["Question Bank"],
          summary: "List question bank items (admin-only)",
          description:
            "Returns governed bank items. Optional filters are combined with AND. " +
            "Candidates never receive raw bank items (they carry scoring keys).",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "domain_id",
              in: "query",
              required: false,
              schema: { type: "string" },
              example: "D1",
            },
            {
              name: "dimension_id",
              in: "query",
              required: false,
              schema: { type: "string" },
              example: "D1-CE",
            },
            {
              name: "method_family",
              in: "query",
              required: false,
              schema: { type: "string", enum: [...MethodFamilySchema.options] },
            },
            {
              name: "use_status",
              in: "query",
              required: false,
              schema: { type: "string", enum: [...UseStatusSchema.options] },
            },
          ],
          responses: {
            "200": {
              description: "Array of bank items.",
              content: {
                "application/json": {
                  schema: { type: "array", items: { $ref: "#/components/schemas/BankItem" } },
                },
              },
            },
            "400": ERROR_RESPONSES["400"],
            "401": ERROR_RESPONSES["401"],
            "403": ERROR_RESPONSES["403"],
          },
        },
      },
      "/api/bank/{itemId}": {
        get: {
          tags: ["Question Bank"],
          summary: "Get a single question bank item (admin-only)",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "itemId",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "NEX-GMB-001",
            },
          ],
          responses: {
            "200": {
              description: "The bank item.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/BankItem" } },
              },
            },
            "401": ERROR_RESPONSES["401"],
            "403": ERROR_RESPONSES["403"],
            "404": {
              description: "Item not found.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
      "/api/blueprints": {
        get: {
          tags: ["Blueprints"],
          summary: "List role blueprints (admin-only)",
          description: "Optional ?approved=true returns only approved|validated blueprints.",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "approved",
              in: "query",
              required: false,
              schema: { type: "boolean" },
              description: "When true, return only approved or validated blueprints.",
            },
          ],
          responses: {
            "200": {
              description: "Array of role blueprints.",
              content: {
                "application/json": {
                  schema: { type: "array", items: { $ref: "#/components/schemas/RoleBlueprint" } },
                },
              },
            },
            "401": ERROR_RESPONSES["401"],
            "403": ERROR_RESPONSES["403"],
          },
        },
      },
      "/api/blueprints/{id}": {
        get: {
          tags: ["Blueprints"],
          summary: "Get a role blueprint (admin-only)",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" }, example: "bp-001" },
          ],
          responses: {
            "200": {
              description: "The role blueprint.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/RoleBlueprint" } },
              },
            },
            "401": ERROR_RESPONSES["401"],
            "403": ERROR_RESPONSES["403"],
            "404": {
              description: "Blueprint not found.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
      "/api/blueprints/{id}/assessment": {
        get: {
          tags: ["Blueprints"],
          summary: "Get the assessment blueprint for a role blueprint (admin-only)",
          description: "The {id} is the ROLE blueprint id. Includes contextualized items.",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" }, example: "bp-001" },
          ],
          responses: {
            "200": {
              description: "The assessment blueprint.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/AssessmentBlueprint" } },
              },
            },
            "401": ERROR_RESPONSES["401"],
            "403": ERROR_RESPONSES["403"],
            "404": {
              description: "No assessment blueprint for this role blueprint.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
      "/api/blueprints/{id}/governance": {
        get: {
          tags: ["Blueprints"],
          summary: "Get a blueprint's governance warnings (admin-only)",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" }, example: "bp-002" },
          ],
          responses: {
            "200": {
              description: "Array of governance warnings.",
              content: {
                "application/json": {
                  schema: { type: "array", items: { $ref: "#/components/schemas/GovernanceWarning" } },
                },
              },
            },
            "401": ERROR_RESPONSES["401"],
            "403": ERROR_RESPONSES["403"],
            "404": {
              description: "Blueprint not found.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
      "/api/blueprints/{id}/approve": {
        post: {
          tags: ["Blueprints"],
          summary: "Approve a role blueprint (admin-only)",
          description:
            "Transitions approval_status to approved|validated, stamps approved_at/by, " +
            "and writes a blueprint.approved audit event (fail-closed). Returns 422 if " +
            "any blocking governance warning remains unresolved.",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" }, example: "bp-002" },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApproveBlueprintRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "The updated role blueprint.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/RoleBlueprint" } },
              },
            },
            "400": ERROR_RESPONSES["400"],
            "401": ERROR_RESPONSES["401"],
            "403": ERROR_RESPONSES["403"],
            "404": {
              description: "Blueprint not found.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
            "422": {
              description: "Blocking governance warnings must be resolved before approval.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
    },
  };
}
