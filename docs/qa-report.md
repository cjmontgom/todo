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

## 4. Performance Analysis (Chrome DevTools — 2026-03-16)

**Tool:** Chrome DevTools Performance Trace + Lighthouse (desktop, navigation mode)
**Environment:** Local dev server (Vite HMR), unthrottled CPU and network

### 4.1 Core Web Vitals

| Metric | Value | Rating |
|--------|-------|--------|
| LCP (Largest Contentful Paint) | **155 ms** | ✅ Excellent (threshold: <2500 ms) |
| CLS (Cumulative Layout Shift) | **0.00** | ✅ Perfect (threshold: <0.1) |
| TTFB (Time to First Byte) | **9 ms** | ✅ Excellent |
| LCP Render Delay | **146 ms** (94.2% of LCP) | ℹ️ See note below |

**LCP Element:** `<span class="flex-1 line-through text-completed">` — inline text node, no network fetch required.

**Note on Render Delay:** 94.2% of LCP time is render delay (JavaScript execution + React hydration), not network. This is expected for a React SPA where the LCP element is rendered client-side after JS runs. There is no LCP image or resource to optimise. The absolute time (146 ms) is well within acceptable bounds.

---

### 4.2 Network Dependency Tree

**Max critical path latency: 138 ms**

The longest request chain at page load:

```
HTML (17 ms)
  └─ main.tsx (19 ms)
       └─ App.tsx (28 ms)
            └─ api.ts (36 ms)
                 └─ GET /api/tasks (138 ms) ← end of critical path
```

All component `.tsx` files are fetched individually (dev mode). In a production build, Vite bundles these into a small number of chunks — the 14 individual module requests seen here will not appear in production.

**Preconnect hints:** `fonts.googleapis.com` and `fonts.gstatic.com` are correctly preconnected in the HTML.

---

### 4.3 Third-Party Resources

| Resource | Size | Render-Blocking | Impact |
|----------|------|-----------------|--------|
| Google Fonts CSS (`Inter`) | ~0.2 ms download | Yes (5 ms total) | ℹ️ Low impact locally; estimated savings: 0 ms |
| Inter woff2 font | ~56 kB | No | ℹ️ Loaded after render |

**Finding:** Google Fonts is technically render-blocking but has zero measured impact on FCP/LCP in this application. For production, this could be further optimised by self-hosting the font or adding `font-display: optional`.

---

### 4.4 Lighthouse Scores

| Category | Score |
|----------|-------|
| Accessibility | 96 / 100 |
| Best Practices | 100 / 100 |
| SEO | 82 / 100 |

**Performance note:** Lighthouse performance score is not included as per project scope (see story 8.1 — performance auditing excluded).

---

### 4.5 Findings and Remediations

#### FINDING 1 — Color Contrast Failure (Accessibility, WCAG 1.4.3) 🔴 Fixed

- **Selector:** `span.flex-1.text-completed` (completed task text)
- **Original colour:** `#B0AEA9` on `#FAFAF8` background
- **Contrast ratio:** 2.12:1 — **fails** WCAG AA minimum of 4.5:1 for normal text
- **Remediation applied:** Updated `--color-completed` in `frontend/src/index.css` from `#B0AEA9` → `#6E6C6A`
- **New contrast ratio:** 5.00:1 — **passes** WCAG AA ✅
- **Visual impact:** Completed tasks remain visually muted/struck-through but are now legible for low-vision users

#### FINDING 2 — No `<meta name="description">` Tag (SEO) 🟡 Informational

- **Lighthouse audit:** `meta-description` — score 0
- **Detail:** The page has no meta description. This reduces discoverability in search engine results.
- **Remediation (future):** Add `<meta name="description" content="A simple, accessible to-do list application.">` to `frontend/index.html`. Low priority for a local training project, but required for any public deployment.

#### FINDING 3 — `/robots.txt` Returns HTML (SEO) 🟡 Informational

- **Lighthouse audit:** `robots-txt` — 21 parse errors
- **Detail:** The Vite dev server returns `index.html` for all unmatched routes, including `/robots.txt`. This is expected in local development and not a code defect.
- **Remediation (future):** Add a `public/robots.txt` file to the frontend. Vite automatically serves files from `public/` at the root path. Content for a training app: `User-agent: *\nDisallow: /`. This resolves the Lighthouse audit and is also required for production.

#### FINDING 4 — Double API Request on Load (Development Only) ℹ️ No Action Required

- **Observed:** Two identical `GET /api/tasks` requests fired on initial page load
- **Cause:** React 18 `StrictMode` intentionally double-invokes `useEffect` in development to surface side effects
- **Production impact:** None — `StrictMode`'s double-invoke only occurs in development builds. A production build (`npm run build`) fires the API call once.
- **Recommendation:** No code change required. Keep `StrictMode` enabled as it is a valuable development safety net.

#### FINDING 5 — Google Fonts Render-Blocking Request ℹ️ Low Priority

- **Observed:** `fonts.googleapis.com` CSS is render-blocking (5 ms, 0 ms estimated savings)
- **Detail:** Zero measured impact on LCP or FCP at current scale. The font loads very quickly from cache on repeat visits.
- **Remediation (future, production):** Self-host the Inter font or add `font-display: swap` / `font-display: optional` to the `@font-face` declaration to prevent render-blocking entirely. Only relevant if deploying to production with real network latency.

---

## Summary

| Area                       | Result |
|----------------------------|--------|
| Frontend test coverage     | ✅ PASS (84.16% stmts, threshold 70%) |
| Backend test coverage      | ✅ PASS (98.70% lines, threshold 70%) |
| WCAG AA accessibility      | ✅ PASS (0 critical violations) |
| XSS                        | ✅ No issue |
| SQL Injection               | ✅ No issue |
| CORS                       | ℹ️ Informational — permissive for V1, restrict for production |
| Input Validation            | ✅ No issue |
| Error Response Leakage     | ✅ No issue |
| LCP                        | ✅ 155 ms (excellent) |
| CLS                        | ✅ 0.00 (perfect) |
| Lighthouse Accessibility   | ✅ 96/100 |
| Lighthouse Best Practices  | ✅ 100/100 |
| Lighthouse SEO             | ⚠️ 82/100 (meta description + robots.txt — both informational for V1) |
| Contrast: completed tasks  | ✅ Fixed — `#6E6C6A` gives 5.00:1 (was 2.12:1 with `#B0AEA9`) |

**Overall QA Result: PASS** — The application meets all specified quality thresholds for coverage, accessibility, and security at V1 scope. One colour contrast failure discovered via performance audit was remediated.
