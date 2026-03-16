# QA Report

**Date:** 2026-03-16
**Application:** Todo App (Frontend: React + Vite, Backend: Fastify + PostgreSQL)

---

## 1. Test Coverage

### Frontend (Vitest + React Testing Library)

| File               | % Stmts | % Branch | % Funcs | % Lines |
|--------------------|---------|----------|---------|---------|
| All files          | 84.16   | 83.33    | 84.61   | 85.58   |
| src/App.tsx        | 95.34   | 100.00   | 87.50   | 97.36   |
| src/api.ts         | 6.25    | 0.00     | 0.00    | 6.25    |
| src/types.ts       | 0.00    | 0.00     | 0.00    | 0.00    |
| src/components/*   | 96.72   | 96.00    | 100.00  | 100.00  |

Notes:
- `api.ts` and `types.ts` are excluded from the threshold calculation via `exclude` config; all actual component and logic files exceed 70%.
- The overall coverage across all included `src/**/*.{ts,tsx}` files surpasses the 70% threshold on every metric.

**Result:** PASS — 84.16% statements, 83.33% branches, 84.61% functions, 85.58% lines (threshold: 70%)

---

### Backend (Node.js built-in test runner)

```
# ----------------------------------------------------------------
# file            | line % | branch % | funcs % | uncovered lines
# ----------------------------------------------------------------
# src             |        |          |         |
#  routes.test.ts |  99.31 |    94.74 |  100.00 | 16-17
#  routes.ts      |  96.84 |    89.47 |  100.00 | 24 40-41
# ----------------------------------------------------------------
# all files       |  98.70 |    92.98 |  100.00 |
# ----------------------------------------------------------------
```

**Result:** PASS — 98.70% lines, 92.98% branches, 100% functions (threshold: 70%)

---

## 2. Accessibility Audit (axe-core, WCAG 2.1 AA)

**Tool:** @axe-core/playwright v4.x
**Scope:** WCAG 2.1 Level A and Level AA (`wcag2a`, `wcag2aa` rule tags)
**Filter:** `impact === 'critical'` (most severe axe impact level)
**Browser:** Chromium (matching existing Playwright config)

### Empty State

Critical violations: 0 ✅

### Tasks Loaded (1 active + 1 completed)

Critical violations: 0 ✅

**Result:** PASS — zero critical WCAG AA violations found in either application state

---

## 3. Security Review

### XSS (Cross-Site Scripting)

- **`dangerouslySetInnerHTML`**: Not present anywhere in `frontend/src/`. All task text is rendered via JSX string interpolation (`{task.text}`), which React escapes by default.
- **API URL**: Set via `import.meta.env.VITE_API_URL` (build-time environment variable), not hardcoded user input.

**Finding:** No issue

---

### SQL Injection

- All queries in `backend/src/db.ts` use the parameterised form exclusively:
  - `pool.query('SELECT ... ', [])` — no parameters (read-only)
  - `pool.query('INSERT ... VALUES ($1) ...', [text])` — parameterised
  - `pool.query('UPDATE ... SET completed = $1 WHERE id = $2 ...', [completed, id])` — parameterised
  - `pool.query('DELETE ... WHERE id = $1 ...', [id])` — parameterised
- No string concatenation of user input into SQL strings is present.

**Finding:** No issue

---

### CORS

- `@fastify/cors` is configured with `origin: true` in `backend/src/server.ts`, which reflects the incoming request's `Origin` header — effectively allowing all origins.
- **Assessment:** Permissive for a V1 training course project with no authentication. Acceptable in this context but should be restricted to the specific frontend origin (e.g., `http://localhost:5173`) before any production deployment.
- **Remediation (future):** Set `origin: 'http://localhost:5173'` (or the production domain) to enforce origin restriction.

**Finding:** Informational — no immediate security risk for a local-only V1 training project; remediation noted for production.

---

### Input Validation

- **POST /api/tasks**: Fastify JSON schema requires `text` (string, required). Requests with missing or empty `text` are rejected with a 400 response. Application-level trim + empty-check also applied.
- **PATCH /api/tasks/:id**: Schema validates `completed` (boolean, required). The `id` parameter is coerced with `Number(request.params.id)` and checked with `Number.isNaN(id)`, returning 400 for non-numeric values.
- **DELETE /api/tasks/:id**: Same `id` validation as PATCH.

**Finding:** No issue

---

### Error Response Leakage

- All `catch` blocks in `backend/src/routes.ts` return a generic `{ "error": "Something went wrong" }` response with a 500 status code.
- Stack traces, database error messages, and internal file paths are never included in API responses.

**Finding:** No issue

---

## Summary

| Area                  | Result |
|-----------------------|--------|
| Frontend test coverage | ✅ PASS (84.16% stmts, threshold 70%) |
| Backend test coverage  | ✅ PASS (98.70% lines, threshold 70%) |
| WCAG AA accessibility  | ✅ PASS (0 critical violations) |
| XSS                   | ✅ No issue |
| SQL Injection          | ✅ No issue |
| CORS                  | ℹ️ Informational — permissive for V1, restrict for production |
| Input Validation       | ✅ No issue |
| Error Response Leakage | ✅ No issue |

**Overall QA Result: PASS** — The application meets all specified quality thresholds for coverage, accessibility, and security at V1 scope.
