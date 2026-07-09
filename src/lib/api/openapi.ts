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
  AssessmentAssignmentSchema,
  CreatedAssignmentRecordSchema,
  CreateAssignmentRequestSchema,
  CreateBulkAssignmentRequestSchema,
  UpdateAssignmentRequestSchema,
  AssignmentStatusSchema,
  StartSessionRequestSchema,
  SessionMetadataSchema,
  SessionItemSchema,
  SubmitResponsesRequestSchema,
  RunScoringRequestSchema,
  ScoredResultSchema,
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
      version: "0.6.0",
      description: [
        "Implemented backend surface for the Nexus platform.",
        "",
        "**Implemented (documented below):**",
        "- Auth.js credentials login + session (Sprint 1)",
        "- Read-only Question Bank (Sprint 2), admin-only",
        "- Role & Assessment Blueprints + approval (Sprint 3), admin-only",
        "- Assignments: list/get/create/bulk/update (Sprint 4), admin-only",
        "- Assessment sessions: start/get/questions/answers/submit (Sprint 5), candidate-only",
        "",
        "**Planned / deferred (NOT yet implemented — not listed as operations):**",
        "Scoring, Domain 6, Reports,",
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
      { name: "Assignments", description: "Candidate assignments: list/get/create/bulk/update (admin-only)" },
      { name: "Sessions", description: "Assessment session lifecycle: start/get/questions/answers/submit (candidate-only)" },
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
        AssessmentAssignment: jsonSchema(AssessmentAssignmentSchema),
        CreatedAssignmentRecord: jsonSchema(CreatedAssignmentRecordSchema),
        CreateAssignmentRequest: jsonSchema(CreateAssignmentRequestSchema),
        CreateBulkAssignmentRequest: jsonSchema(CreateBulkAssignmentRequestSchema),
        UpdateAssignmentRequest: jsonSchema(UpdateAssignmentRequestSchema),
        AssignmentListResponse: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/AssessmentAssignment" },
            },
            pagination: {
              type: "object",
              properties: {
                page: { type: "integer", example: 1 },
                page_size: { type: "integer", example: 20 },
                total: { type: "integer", example: 3 },
                total_pages: { type: "integer", example: 1 },
              },
              required: ["page", "page_size", "total", "total_pages"],
            },
          },
          required: ["data", "pagination"],
        },
        BulkAssignmentResponse: {
          type: "object",
          properties: {
            created: {
              type: "array",
              items: { $ref: "#/components/schemas/CreatedAssignmentRecord" },
            },
            rejected: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  index: { type: "integer" },
                  email: { type: "string", nullable: true },
                  reason: {
                    type: "string",
                    enum: ["invalid_row", "duplicate_email_in_batch"],
                  },
                },
                required: ["index", "reason"],
              },
            },
          },
          required: ["created", "rejected"],
        },
        StartSessionRequest: jsonSchema(StartSessionRequestSchema),
        SessionMetadata: jsonSchema(SessionMetadataSchema),
        SessionItem: jsonSchema(SessionItemSchema),
        SubmitResponsesRequest: jsonSchema(SubmitResponsesRequestSchema),
        SaveAnswersResponse: {
          type: "object",
          properties: {
            saved: { type: "integer", example: 3 },
            answered_count: { type: "integer", example: 5 },
            total_items: { type: "integer", example: 22 },
          },
          required: ["saved", "answered_count", "total_items"],
        },
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
      "/api/assignments": {
        get: {
          tags: ["Assignments"],
          summary: "List assignments (admin-only)",
          description:
            "Optional filters (ANDed): status, blueprint_id, candidate_email. " +
            "Paginated via page (default 1) and page_size (default 20, max 100). " +
            "Returns a { data, pagination } envelope.",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "status",
              in: "query",
              required: false,
              schema: { type: "string", enum: [...AssignmentStatusSchema.options] },
            },
            {
              name: "blueprint_id",
              in: "query",
              required: false,
              schema: { type: "string" },
              example: "bp-001",
            },
            {
              name: "candidate_email",
              in: "query",
              required: false,
              schema: { type: "string", format: "email" },
              example: "candidate@nexus.io",
            },
            {
              name: "page",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1, default: 1 },
            },
            {
              name: "page_size",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            },
          ],
          responses: {
            "200": {
              description: "Paginated assignments envelope.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AssignmentListResponse" },
                },
              },
            },
            "400": ERROR_RESPONSES["400"],
            "401": ERROR_RESPONSES["401"],
            "403": ERROR_RESPONSES["403"],
          },
        },
        post: {
          tags: ["Assignments"],
          summary: "Create one assignment (admin-only)",
          description:
            "Validates the role + assessment blueprint exist and match, reuses an " +
            "existing candidate by email or creates one, generates an invitation_link, " +
            "sets invitation_status=not_sent and status=not_started, and writes an " +
            "assignment.created audit event. Never starts a session or sends email.",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateAssignmentRequest" },
              },
            },
          },
          responses: {
            "201": {
              description: "The created assignment.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AssessmentAssignment" },
                },
              },
            },
            "400": {
              description:
                "Validation failed, or the blueprint / assessment blueprint is missing or mismatched.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
            "401": ERROR_RESPONSES["401"],
            "403": ERROR_RESPONSES["403"],
          },
        },
      },
      "/api/assignments/bulk": {
        post: {
          tags: ["Assignments"],
          summary: "Bulk-create assignments (admin-only)",
          description:
            "Validates shared fields + the blueprint pair once, then validates each " +
            "candidate row individually. Malformed rows are rejected (invalid_row) and " +
            "duplicate emails within the batch are rejected (duplicate_email_in_batch); " +
            "the first occurrence wins. Existing candidates are reused by email. Valid " +
            "rows are created with one assignment.created audit event each, in a single " +
            "transaction. Returns created records and rejected rows.",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateBulkAssignmentRequest" },
              },
            },
          },
          responses: {
            "201": {
              description: "Created records + rejected rows.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/BulkAssignmentResponse" },
                },
              },
            },
            "400": {
              description:
                "Shared-field validation failed, or the blueprint / assessment blueprint is missing or mismatched.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
            "401": ERROR_RESPONSES["401"],
            "403": ERROR_RESPONSES["403"],
          },
        },
      },
      "/api/assignments/{id}": {
        get: {
          tags: ["Assignments"],
          summary: "Get a single assignment (admin-only)",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" }, example: "asgn-001" },
          ],
          responses: {
            "200": {
              description: "The assignment.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AssessmentAssignment" },
                },
              },
            },
            "401": ERROR_RESPONSES["401"],
            "403": ERROR_RESPONSES["403"],
            "404": {
              description: "Assignment not found.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
        patch: {
          tags: ["Assignments"],
          summary: "Update an assignment (admin-only)",
          description:
            "Updates ONLY deadline, invitation_status, and/or status (at least one " +
            "required). No candidate/blueprint reassignment, no consent/session mutation. " +
            "Writes an assignment.updated audit event.",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" }, example: "asgn-001" },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateAssignmentRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "The updated assignment.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AssessmentAssignment" },
                },
              },
            },
            "400": ERROR_RESPONSES["400"],
            "401": ERROR_RESPONSES["401"],
            "403": ERROR_RESPONSES["403"],
            "404": {
              description: "Assignment not found.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
      "/api/sessions/start": {
        post: {
          tags: ["Sessions"],
          summary: "Start a session (candidate-only)",
          description:
            "Begins a session for one of the CALLER'S OWN assignments. Validates the " +
            "assignment exists (404) and is owned by the caller (403), that its status " +
            "allows starting (409 if completed/expired), and that no session already " +
            "exists for it (409, returns the existing session_id). Creates the session " +
            "(state=in_progress, started_at set), flips the assignment to in_progress, " +
            "and writes a session.started audit event. Admins are forbidden (403).",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StartSessionRequest" },
              },
            },
          },
          responses: {
            "201": {
              description: "The created session's metadata.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/SessionMetadata" } },
              },
            },
            "400": ERROR_RESPONSES["400"],
            "401": ERROR_RESPONSES["401"],
            "403": {
              description: "Not a candidate, or not the caller's own assignment.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
            "404": {
              description: "Assignment not found.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
            "409": {
              description: "A session already exists, or the assignment cannot be started.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
      "/api/sessions/{sessionId}": {
        get: {
          tags: ["Sessions"],
          summary: "Get session metadata (candidate-only, own session)",
          description:
            "Returns session METADATA only — no items, no scoring data, no keyed answers.",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "sessionId", in: "path", required: true, schema: { type: "string" }, example: "sess-001" },
          ],
          responses: {
            "200": {
              description: "Session metadata.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/SessionMetadata" } },
              },
            },
            "401": ERROR_RESPONSES["401"],
            "403": {
              description: "Not a candidate, or not the caller's own session.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
            "404": {
              description: "Session not found.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
      "/api/sessions/{sessionId}/questions": {
        get: {
          tags: ["Sessions"],
          summary: "Get candidate-safe questions (candidate-only, own session)",
          description:
            "Returns the session's questions in blueprint order (display_order). Each item " +
            "carries only candidate-safe fields (contextualized_text, method_family, " +
            "response_scale, options). keyed_answer, reverse_scored and all scoring " +
            "metadata are NEVER included.",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "sessionId", in: "path", required: true, schema: { type: "string" }, example: "sess-001" },
          ],
          responses: {
            "200": {
              description: "Ordered array of candidate-safe questions.",
              content: {
                "application/json": {
                  schema: { type: "array", items: { $ref: "#/components/schemas/SessionItem" } },
                },
              },
            },
            "401": ERROR_RESPONSES["401"],
            "403": {
              description: "Not a candidate, or not the caller's own session.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
            "404": {
              description: "Session not found.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
      "/api/sessions/{sessionId}/answers": {
        patch: {
          tags: ["Sessions"],
          summary: "Save answers (candidate-only, own session)",
          description:
            "Partially saves answers to an ACTIVE session (upsert by item). Every item_id " +
            "must belong to the session and each answer's method_family must match the " +
            "bank item (else 400). A submitted/scored/expired session is locked (409).",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "sessionId", in: "path", required: true, schema: { type: "string" }, example: "sess-001" },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SubmitResponsesRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Save summary.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/SaveAnswersResponse" } },
              },
            },
            "400": ERROR_RESPONSES["400"],
            "401": ERROR_RESPONSES["401"],
            "403": {
              description: "Not a candidate, or not the caller's own session.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
            "404": {
              description: "Session not found.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
            "409": {
              description: "Session is locked (already submitted/scored/expired).",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
      "/api/sessions/{sessionId}/submit": {
        post: {
          tags: ["Sessions"],
          summary: "Submit a session (candidate-only, own session)",
          description:
            "Finalizes the session. Requires ALL blueprint questions answered (422 with " +
            "missing_item_ids otherwise). Sets state=submitted + submitted_at (locking " +
            "further writes), flips the assignment to completed, and writes a " +
            "session.submitted audit event. Does NOT score or generate a report.",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "sessionId", in: "path", required: true, schema: { type: "string" }, example: "sess-001" },
          ],
          responses: {
            "200": {
              description: "The submitted session's metadata.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/SessionMetadata" } },
              },
            },
            "401": ERROR_RESPONSES["401"],
            "403": {
              description: "Not a candidate, or not the caller's own session.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
            "404": {
              description: "Session not found.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
            "409": {
              description: "Session already submitted/scored, or expired.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
            "422": {
              description: "Not all questions answered.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
    },
  };
}
