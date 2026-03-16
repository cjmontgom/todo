# Story 8.1: QA Reports

Status: review

## Story

As a developer delivering a training course project,
I want documented quality reports,
so that I can demonstrate the application meets quality standards.

## Acceptance Criteria

1. **Given** the test suites exist
   **When** coverage analysis is run
   **Then** meaningful code coverage is at minimum 70%

2. **Given** the application is running
   **When** an accessibility audit is performed (axe-core)
   **Then** zero critical WCAG AA violations are found

3. **Given** the application codebase
   **When** a security review is performed
   **Then** common vulnerabilities (XSS, injection) are documented with findings and remediations

## Tasks / Subtasks

- [x] Task 1: Configure and run frontend test coverage (AC: #1)
  - [x] Install `@vitest/coverage-v8` in `frontend/`
  - [x] Add `coverage` config block to `frontend/vite.config.ts`
  - [x] Add `test:coverage` script to `frontend/package.json`
  - [x] Run coverage and verify ≥70% across lines/functions/branches/statements

- [x] Task 2: Configure and run backend test coverage (AC: #1)
  - [x] Add `test:coverage` script to `backend/package.json` using `--experimental-test-coverage`
  - [x] Run coverage and verify ≥70%

- [x] Task 3: Run automated accessibility audit with axe-core (AC: #2)
  - [x] Install `@axe-core/playwright` in the root `package.json`
  - [x] Create `e2e/epic-8-accessibility-audit.spec.ts` with tests for empty state and tasks-loaded state
  - [x] Confirm zero critical WCAG AA violations in both states

- [x] Task 4: Perform security review (AC: #3)
  - [x] Review frontend for XSS risks (dangerouslySetInnerHTML, unescaped output)
  - [x] Review backend for SQL injection (parameterised queries)
  - [x] Review CORS, input validation, and error response leakage
  - [x] Document findings and remediations

- [x] Task 5: Write QA report (AC: #1–#3)
  - [x] Create `docs/qa-report.md` with coverage results, accessibility findings, and security review

## Dev Notes

### What Is Already in Place

**Do NOT set up testing infrastructure from scratch — the following is already fully configured:**

- **Frontend:** Vitest `^4.0.18` with `@testing-library/react`, `jsdom` environment. Test files: `App.test.tsx`, `TaskInput.test.tsx`, `TaskList.test.tsx`, `TaskItem.test.tsx`, `Toast.test.tsx`, `AppShell.test.tsx`. Run with `npm test` from `frontend/`.
- **Backend:** Node built-in test runner (`node:test`). Test file: `routes.test.ts`. Run with `npm test` from `backend/`.
- **E2E:** Playwright with 60+ tests across 8 spec files in `e2e/`. Run with `npm run test:e2e` from the repo root. `@playwright/test ^1.58.2` installed at root.

### Task 1: Frontend Coverage — Exact Implementation

**Step 1 — Install the coverage provider:**

```bash
cd frontend && npm install -D @vitest/coverage-v8
```

**Step 2 — Update `frontend/vite.config.ts`** to add a `coverage` block inside `test`:

```ts
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './src/test-setup.ts',
  coverage: {
    provider: 'v8',
    reporter: ['text', 'lcov'],
    include: ['src/**/*.{ts,tsx}'],
    exclude: ['src/main.tsx', 'src/test-setup.ts', 'src/**/*.test.{ts,tsx}'],
    thresholds: {
      lines: 70,
      branches: 70,
      functions: 70,
      statements: 70,
    },
  },
},
```

**Step 3 — Add script to `frontend/package.json`:**

```json
"test:coverage": "vitest run --coverage"
```

**Step 4 — Run and capture output:**

```bash
cd frontend && npm run test:coverage
```

Vitest will print a coverage table to stdout. Copy the summary table (lines/branches/functions/statements percentages) into `docs/qa-report.md`. If any threshold is below 70%, write additional unit tests to bring it up before moving on.

### Task 2: Backend Coverage — Exact Implementation

**Step 1 — Add script to `backend/package.json`:**

```json
"test:coverage": "node --experimental-test-module-mocks --experimental-test-coverage --test --import tsx src/routes.test.ts"
```

**Step 2 — Run and capture output:**

```bash
cd backend && npm run test:coverage
```

Node will print a coverage summary. Copy the relevant lines/branches/functions/statements percentages into `docs/qa-report.md`. Backend coverage is typically high because `routes.test.ts` exercises all four endpoints.

### Task 3: Accessibility Audit — Exact Implementation

**Step 1 — Install axe-core Playwright integration at the root:**

```bash
npm install -D @axe-core/playwright
```

**Step 2 — Create `e2e/epic-8-accessibility-audit.spec.ts`:**

```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { deleteAllTasks, seedTask } from './helpers'

test.describe('Epic 8: Accessibility Audit (WCAG 2.1 AA)', () => {
  test.beforeEach(async () => {
    await deleteAllTasks()
  })

  test('has no critical WCAG AA violations on empty state', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText("Nothing here yet. What's on your mind?")).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const criticalViolations = results.violations.filter(v => v.impact === 'critical')
    expect(
      criticalViolations,
      `Critical violations found:\n${criticalViolations.map(v => `- ${v.id}: ${v.description}`).join('\n')}`
    ).toEqual([])
  })

  test('has no critical WCAG AA violations with tasks loaded', async ({ page }) => {
    await seedTask('First task')
    await seedTask('Completed task', true)
    await page.goto('/')
    await expect(page.getByText('First task')).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const criticalViolations = results.violations.filter(v => v.impact === 'critical')
    expect(
      criticalViolations,
      `Critical violations found:\n${criticalViolations.map(v => `- ${v.id}: ${v.description}`).join('\n')}`
    ).toEqual([])
  })
})
```

**Critical notes for axe-core:**
- `withTags(['wcag2a', 'wcag2aa'])` scopes the audit to WCAG 2.1 Level A and AA rules — the correct scope for AC #2
- Filter by `impact === 'critical'` (the most severe axe impact level) — this matches the AC wording "zero critical WCAG AA violations"
- The error message in `expect(...)` includes the violation details so failures are self-describing
- `@axe-core/playwright` wraps the axe-core engine and integrates directly with the Playwright `page` object — no additional browser setup needed
- Run with `npm run test:e2e` from the root — the new spec is auto-discovered by `testDir: './e2e'`

**If any critical violations are found:** Fix the underlying accessibility issue in the relevant component before marking this story done. Do not suppress or skip the violation.

### Task 4: Security Review — What to Check

The security review is a manual code inspection. Check the following and document findings:

**XSS (Cross-Site Scripting):**
- Search `frontend/src/` for `dangerouslySetInnerHTML` — should not be present; React escapes JSX by default
- Confirm task text is rendered via JSX (`{task.text}`) not via `innerHTML`
- Confirm the API URL is set via environment variable, not hardcoded user input

**SQL Injection:**
- Review all queries in `backend/src/db.ts` — all must use parameterised form (`$1`, `$2`, etc.) with `pg`'s `pool.query(sql, [params])` syntax
- No string concatenation of user input into SQL strings is acceptable

**CORS:**
- Review `@fastify/cors` config in `backend/src/server.ts` — note the configured `origin` value and whether it restricts access to the expected frontend origin

**Input Validation:**
- Confirm Fastify JSON schema validation in `backend/src/routes.ts` rejects missing/empty `text` on `POST /api/tasks` (400 response)
- Confirm `id` parameters in `PATCH` and `DELETE` are integers (schema coercion or explicit validation)

**Error Response Leakage:**
- Confirm the backend's 500 handler returns `{ "error": "Something went wrong" }` and does NOT include stack traces, database error messages, or internal file paths in responses

Document each finding as either **No issue** or **Issue found + remediation**.

### Task 5: QA Report — Structure

Create `docs/qa-report.md` with the following structure:

```markdown
# QA Report

**Date:** YYYY-MM-DD
**Application:** Todo App (Frontend: React + Vite, Backend: Fastify + PostgreSQL)

## 1. Test Coverage

### Frontend (Vitest + React Testing Library)

[Paste Vitest coverage table here]

**Result:** PASS / FAIL — X% line coverage (threshold: 70%)

### Backend (Node.js built-in test runner)

[Paste Node coverage summary here]

**Result:** PASS / FAIL — X% line coverage (threshold: 70%)

## 2. Accessibility Audit (axe-core, WCAG 2.1 AA)

**Tool:** @axe-core/playwright
**Scope:** WCAG 2.1 Level A and Level AA

### Empty State

Critical violations: 0 ✅

### Tasks Loaded (active + completed)

Critical violations: 0 ✅

**Result:** PASS — zero critical WCAG AA violations found

## 3. Security Review

### XSS

[Finding and status]

### SQL Injection

[Finding and status]

### CORS

[Finding and status]

### Input Validation

[Finding and status]

### Error Response Leakage

[Finding and status]

**Result:** [Overall status and any remediations applied]
```

### Project Structure Notes

- New files created by this story: `e2e/epic-8-accessibility-audit.spec.ts`, `docs/qa-report.md`
- Modified files: `frontend/vite.config.ts` (coverage config), `frontend/package.json` (test:coverage script), `backend/package.json` (test:coverage script), root `package.json` (@axe-core/playwright dependency)
- No changes to any application source code (frontend or backend components, routes, db) unless a security or accessibility issue is discovered that requires a fix
- No changes to existing spec files

### What This Story Does NOT Include

- CI/CD integration — coverage reports run locally only
- Visual regression testing
- Performance auditing (Lighthouse performance, Core Web Vitals)
- Penetration testing or automated security scanning (e.g., OWASP ZAP)
- Multi-browser accessibility testing — Chromium only, matching the existing Playwright config
- Backend coverage for `db.ts` or `server.ts` — only `routes.test.ts` is the current backend test file

### References

- [Source: epics.md#Story 8.1] — acceptance criteria and story definition
- [Source: architecture.md#Testing] — "Frontend testing: Vitest + React Testing Library. Backend testing: Node built-in test runner"
- [Source: architecture.md#Authentication & Security] — CORS setup, no auth for V1
- [Source: architecture.md#API & Communication Patterns] — error response format (no stack traces to client)
- [Source: architecture.md#Data Architecture] — Fastify JSON schema validation
- [Source: e2e/helpers.ts] — deleteAllTasks(), seedTask() API used in new accessibility spec

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking (Cursor Agent)

### Debug Log References

- Frontend tests had 3 pre-existing failures: `Toast.test.tsx` used `getByRole('status')` on a `visibility: hidden` element (fixed with `{ hidden: true }`); two `App.test.tsx` tests used `getByRole('alert')` but Toast renders `role="status"` (fixed role query). These were existing bugs, not regressions.
- `npm run test:e2e` failed with `reuseExistingServer` when run in CI-like sandbox — resolved by unsetting `CI` env var (`export CI=''`) to allow Playwright to reuse the already-running dev servers.

### Completion Notes List

- ✅ Task 1: Installed `@vitest/coverage-v8`, configured coverage thresholds in `vite.config.ts`, added `test:coverage` script. Result: 84.16% stmts / 83.33% branch / 84.61% funcs / 85.58% lines — all ≥70%. Fixed 3 pre-existing test failures as part of making coverage run clean.
- ✅ Task 2: Added `test:coverage` script to `backend/package.json` with `--experimental-test-coverage`. Result: 98.70% lines / 92.98% branch / 100% funcs — all ≥70%.
- ✅ Task 3: Installed `@axe-core/playwright`, created `e2e/epic-8-accessibility-audit.spec.ts`. Both tests pass with 0 critical WCAG AA violations.
- ✅ Task 4: Completed manual security review of frontend (`api.ts`, components) and backend (`db.ts`, `routes.ts`, `server.ts`). Findings: No XSS risks, no SQL injection, no error leakage, input validation correct. CORS uses `origin: true` (permissive, acceptable for V1, informational note added).
- ✅ Task 5: Created `docs/qa-report.md` with full coverage tables, accessibility audit results, and security review findings.

### File List

- `frontend/package.json` — added `test:coverage` script
- `frontend/vite.config.ts` — added `coverage` config block
- `frontend/src/components/Toast.test.tsx` — fixed pre-existing test: added `{ hidden: true }` to `getByRole('status')` for null-message case
- `frontend/src/App.test.tsx` — fixed 2 pre-existing tests: changed `getByRole('alert')` to `getByRole('status')` to match Toast component's role
- `backend/package.json` — added `test:coverage` script
- `e2e/epic-8-accessibility-audit.spec.ts` — new: axe-core WCAG 2.1 AA audit spec
- `docs/qa-report.md` — new: full QA report with coverage, accessibility, and security findings
- `_bmad-output/implementation-artifacts/8-1-qa-reports.md` — story file updates
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — status updated

### Change Log

- 2026-03-16: Implemented story 8-1-qa-reports — configured frontend and backend test coverage (both ≥70%), added axe-core accessibility audit (0 critical WCAG AA violations), completed security review (no critical findings), created comprehensive QA report.
