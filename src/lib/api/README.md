# Frontend API layer (integration foundation)

A dormant, typed service layer for the Nexus backend. **Nothing here is wired into
any page yet** — pages still read the in-memory mock store. This exists so pages can
be migrated to the real API **one endpoint at a time**.

## Files

| File | Purpose |
|------|---------|
| `config.ts` | Data-source toggle + base URL (`DATA_SOURCE`, `API_BASE_URL`, `isApiMode`/`isMockMode`). |
| `client.ts` | `apiFetch` + typed `ApiError` + `statusToCode`. The one fetch helper. |
| `bank-client.ts` | Question Bank (admin). |
| `blueprints-client.ts` | Role/Assessment blueprints + approval (admin). |
| `assignments-client.ts` | Assignments list/get/create/bulk/update (admin). |
| `sessions-client.ts` | Session lifecycle: start/get/questions/answers/submit (candidate). |
| `scoring-client.ts` | Scoring run/read (admin). |
| `reports-client.ts` | Reports generate/read + `getMyReport` (candidate-safe). |
| `exports-client.ts` | Report exports create/read. |
| `index.ts` | Barrel re-export. |
| `schemas.ts` | (existing) Zod schemas + inferred DTO types — the single source of types. |

Types are **not** duplicated: request/response types come from `schemas.ts` DTOs
(`z.infer`) and `@/lib/types/nexus`. Only thin response *envelopes* (pagination,
bulk result, save summary) are declared locally next to the service that returns them.

## Environment variables

Both are `NEXT_PUBLIC_*` (inlined into the browser bundle). See `.env.example`.

| Var | Default | Meaning |
|-----|---------|---------|
| `NEXT_PUBLIC_DATA_SOURCE` | `mock` | `mock` = current mock store; `api` = real backend. **Stays `mock`** until pages are integrated. |
| `NEXT_PUBLIC_API_BASE_URL` | `""` | Empty → same-origin (relative fetch). Set only for a cross-origin backend. |

Unset ⇒ mock + same-origin, i.e. current behavior is unchanged.

## `apiFetch` behavior

- Prepends `API_BASE_URL` (empty ⇒ same-origin).
- **`credentials: "include"`** on every request → the Auth.js session cookie is always sent.
- `json` option → serializes the body and sets `Content-Type: application/json`.
- `query` option → appends URL params (skips `undefined`/`null`).
- Parses the JSON response; tolerates empty bodies (e.g. 204).
- On any non-2xx, throws a typed **`ApiError`** — never returns a bad status silently.

### `ApiError` shape

```ts
class ApiError {
  status: number;        // HTTP status (0 for network failures)
  code: ApiErrorCode;    // 'bad_request' | 'unauthenticated' | 'forbidden'
                         // | 'not_found' | 'conflict' | 'unprocessable'
                         // | 'server_error' | 'network_error' | 'http_error'
  message: string;       // backend `error`/`message`, or a fallback
  issues?: unknown;      // backend Zod issues[], when present (400/422)
  body?: unknown;        // raw parsed error body
}
```

Status → code mapping (`statusToCode`): 400→`bad_request`, 401→`unauthenticated`,
403→`forbidden`, 404→`not_found`, 409→`conflict`, 422→`unprocessable`,
5xx→`server_error`, fetch throw→`network_error`, else→`http_error`.

## Service → endpoint map

- **bank**: `listBankItems` → `GET /api/bank`; `getBankItem` → `GET /api/bank/:itemId`
- **blueprints**: `listBlueprints` → `GET /api/blueprints`; `getBlueprint` → `GET /api/blueprints/:id`;
  `getAssessmentBlueprint` → `GET /api/blueprints/:id/assessment`;
  `getBlueprintGovernance` → `GET /api/blueprints/:id/governance`;
  `approveBlueprint` → `POST /api/blueprints/:id/approve`
- **assignments**: `listAssignments` → `GET /api/assignments`; `getAssignment` → `GET /api/assignments/:id`;
  `createAssignment` → `POST /api/assignments`; `createAssignmentsBulk` → `POST /api/assignments/bulk`;
  `updateAssignment` → `PATCH /api/assignments/:id`
- **sessions**: `startSession` → `POST /api/sessions/start`; `getSession` → `GET /api/sessions/:id`;
  `getSessionQuestions` → `GET /api/sessions/:id/questions`; `saveAnswers` → `PATCH /api/sessions/:id/answers`;
  `submitSession` → `POST /api/sessions/:id/submit`
- **scoring**: `runScoring` → `POST /api/scoring/run`; `getScoringRun` → `GET /api/scoring/:id`;
  `getSessionScoring` → `GET /api/sessions/:id/scoring`
- **reports**: `generateReport` → `POST /api/reports/generate`; `listReports` → `GET /api/reports`;
  `getReport` → `GET /api/reports/:id`; `getReportsByCandidate` → `GET /api/reports/by-candidate/:candidateId`;
  `getReportByScoringRun` → `GET /api/reports/by-scoring-run/:scoringRunId`; `getMyReport` → `GET /api/me/report`
- **exports**: `createExport` → `POST /api/reports/:reportId/export`; `getExport` → `GET /api/exports/:exportId`

## Testing (non-UI)

### 1. Error normalization (pure, no server)

`statusToCode` is exported. Quick check via `npx tsx`:

```bash
npx tsx -e "import('./src/lib/api/client.ts').then(m=>console.log(m.statusToCode(401), m.statusToCode(409), m.statusToCode(422), m.statusToCode(500)))"
# → unauthenticated conflict unprocessable server_error
```

### 2. Cookies are sent + session works (browser console)

With the dev server running (`npm run dev`) and **logged in**, open DevTools console on the app origin and paste:

```js
const s = await import('/src/lib/api/sessions-client.ts'); // or use the bundled module in app code
// Simplest: call the endpoint directly with the same options apiFetch uses:
const r = await fetch('/api/auth/session', { credentials: 'include' });
console.log('session:', await r.json()); // shows the logged-in user → cookie was sent
```

Because `apiFetch` sets `credentials: "include"`, any client call (e.g.
`getSession(id)`) carries the session cookie automatically.

### 3. Cookie requirement (PowerShell, proves the client must send cookies)

```powershell
# Without a session cookie → 401 (normalized to 'unauthenticated' by apiFetch)
(Invoke-WebRequest -Uri http://localhost:3001/api/assignments -SkipHttpErrorCheck).StatusCode  # PS7
```

An admin-authenticated request (with the `authjs.session-token` cookie) returns 200 —
demonstrating that `credentials: "include"` is what makes the client work.

> The clients are intentionally unused by the app. Flipping `NEXT_PUBLIC_DATA_SOURCE=api`
> does nothing until pages are migrated to call them.
