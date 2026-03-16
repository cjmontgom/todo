# Story 7.1: Playwright E2E Test Suite

Status: done

## Story

As a developer,
I want automated end-to-end tests covering all core user journeys,
so that I can verify the full application works correctly in a real browser.

## Acceptance Criteria

1. **Given** the application is running (frontend + backend + database)
   **When** the Playwright test suite is executed
   **Then** a minimum of 5 tests pass covering: create a task, complete a task, delete a task, empty state display, and error handling

2. **Given** a new user opens the app with no tasks
   **When** the page loads
   **Then** the empty state is displayed

3. **Given** the user types a task and submits
   **When** the task is created
   **Then** it appears in the task list

4. **Given** an active task exists
   **When** the user clicks its checkbox
   **Then** the task moves to the completed section with visual changes

5. **Given** a task exists
   **When** the user clicks delete
   **Then** the task is removed from the list

6. **Given** the backend is unavailable
   **When** the app attempts to load tasks
   **Then** the error state is displayed with a retry button

## Tasks / Subtasks

- [x] Task 1: Create `e2e/epic-7-e2e-test-suite.spec.ts` with all 5 required core user journey tests (AC: #1–#6)
  - [x] Test 1 — empty state: navigate to `/`, assert `"Nothing here yet. What's on your mind?"` is visible
  - [x] Test 2 — create a task: fill input, press Enter, assert task text is visible in the list
  - [x] Test 3 — complete a task: seed a task via `seedTask()`, navigate, click checkbox, assert `aria-checked="true"` and `line-through` class
  - [x] Test 4 — delete a task: seed a task, navigate, click delete button, assert task text is no longer visible
  - [x] Test 5 — error state: use `page.route()` to intercept `GET /api/tasks` with a 500, navigate to `/`, assert error message and Retry button are visible

## Dev Notes

### What Is Already in Place

**Do NOT set up Playwright from scratch — it is already fully configured.**

- **`playwright.config.ts`** (root) — already configured: `testDir: './e2e'`, `baseURL: 'http://localhost:5173'`, `workers: 1`, `fullyParallel: false`, Chromium only. Web servers auto-start both frontend (port 5173) and backend (port 3001) via `webServer` config.
- **`package.json`** (root) — scripts already present:
  - `npm run test:e2e` → `playwright test`
  - `npm run test:e2e:ui` → `playwright test --ui`
  - `npm run test:e2e:headed` → `playwright test --headed`
- **`e2e/helpers.ts`** — provides `deleteAllTasks()` and `seedTask(text, completed?)`. Use these in `beforeEach` and test setup. No need to call the API manually.
- **`e2e/smoke.spec.ts`** — 2 existing basic tests (app title + input visibility).
- **`e2e/epic-1-task-display.spec.ts`** through **`e2e/epic-6-accessibility.spec.ts`** — 50+ E2E tests already exist across all prior epics. They collectively satisfy the "minimum 5 tests" requirement. **Do NOT delete or modify them.**

The only file to create is `e2e/epic-7-e2e-test-suite.spec.ts`.

### Exact Implementation — `e2e/epic-7-e2e-test-suite.spec.ts`

```typescript
import { test, expect } from '@playwright/test'
import { deleteAllTasks, seedTask } from './helpers'

const API = 'http://localhost:3001'

test.describe('Epic 7: Core User Journeys', () => {
  test.beforeEach(async () => {
    await deleteAllTasks()
  })

  test('shows empty state when no tasks exist', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByText("Nothing here yet. What's on your mind?")
    ).toBeVisible()
  })

  test('creates a task and displays it in the list', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByText("Nothing here yet. What's on your mind?")
    ).toBeVisible()

    await page.getByPlaceholder('Add a task...').fill('Buy groceries')
    await page.keyboard.press('Enter')

    await expect(page.getByText('Buy groceries')).toBeVisible()
  })

  test('completes a task with visual feedback and sorts to bottom', async ({ page }) => {
    await seedTask('Walk the dog')
    await page.goto('/')
    await expect(page.getByText('Walk the dog')).toBeVisible()

    const checkbox = page.getByRole('checkbox', { name: 'Mark Walk the dog as complete' })
    await expect(checkbox).toHaveAttribute('aria-checked', 'false')
    await checkbox.click()

    await expect(
      page.getByRole('checkbox', { name: 'Mark Walk the dog as incomplete' })
    ).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByText('Walk the dog')).toHaveClass(/line-through/)
  })

  test('deletes a task and removes it from the list', async ({ page }) => {
    await seedTask('Read a book')
    await page.goto('/')
    await expect(page.getByText('Read a book')).toBeVisible()

    await page.getByRole('button', { name: 'Delete task: Read a book' }).click()

    await expect(page.getByText('Read a book')).not.toBeVisible()
    await expect(
      page.getByText("Nothing here yet. What's on your mind?")
    ).toBeVisible()
  })

  test('shows error state with retry button when backend is unavailable', async ({ page }) => {
    await page.route(`${API}/api/tasks`, (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      } else {
        route.continue()
      }
    })

    await page.goto('/')

    await expect(
      page.getByText("Something went wrong. Let's try again.")
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
  })
})
```

### Critical Implementation Details

**`deleteAllTasks()` in `beforeEach`:** Always call `await deleteAllTasks()` in `test.beforeEach` so each test starts with a clean database state. This is the established pattern across all existing spec files.

**`seedTask(text, completed?)`:** Use for pre-populating data before navigating to the page. Do NOT create tasks via the UI when you only need them to exist — use `seedTask()` to keep tests fast and deterministic.

**Page route interception for error simulation:** The pattern used in `epic-5-error-handling.spec.ts` is the established approach:
```typescript
const API = 'http://localhost:3001'
// ...
await page.route(`${API}/api/tasks`, (route) => {
  if (route.request().method() === 'GET') {
    route.fulfill({ status: 500, body: 'Internal Server Error' })
  } else {
    route.continue()
  }
})
```
Always call `page.route()` **before** `page.goto()` so the intercept is in place before the request fires.

**Delete button visibility:** On desktop (≥640px), the delete button is revealed on hover (CSS opacity transition). Playwright's `.click()` on the button element works directly without needing an explicit hover — Playwright triggers pointer events that reveal the button. If a test fails because the button isn't found, add `await page.hover(...)` on the task row first.

**Error message exact text:** The ErrorState component renders `"Something went wrong. Let's try again."` — match this exactly, including the apostrophe in `Let's`. Confirmed in `epic-5-error-handling.spec.ts`.

**Completed task visual class:** The completed task text receives `line-through` and `text-completed` CSS classes. Use `toHaveClass(/line-through/)` for the strikethrough assertion (regex match, avoids coupling to full class string).

**No optimistic UI:** There is deliberately no optimistic update pattern in this app. All visual changes happen **after** the API responds. This means `checkbox.click()` followed immediately by an assertion will wait for the API response before the class is applied — Playwright's auto-waiting handles this correctly.

**Test command:** Run the full suite from the repo root:
```bash
npm run test:e2e
```
Both frontend and backend dev servers start automatically via the `webServer` config — do NOT start them manually.

### Project Structure Notes

- Alignment: `e2e/epic-7-e2e-test-suite.spec.ts` follows the per-epic naming pattern: `epic-{N}-{slug}.spec.ts`
- The `e2e/` folder is flat — no nesting
- No new dependencies required; `@playwright/test ^1.58.2` is already installed in the root `devDependencies`
- No `playwright.config.ts` changes needed — `testDir: './e2e'` already picks up any `*.spec.ts` file in `e2e/`

### What This Story Does NOT Include

- No changes to any existing spec files (`epic-1` through `epic-6`, `smoke.spec.ts`)
- No changes to `e2e/helpers.ts` — the existing `deleteAllTasks()` and `seedTask()` utilities are sufficient
- No changes to `playwright.config.ts` — already fully configured
- No frontend or backend changes
- No new Playwright plugins or dependencies
- No visual regression tests (out of scope for V1)
- No multi-browser testing (Chromium only, per `playwright.config.ts`)

### References

- [Source: epics.md#Story 7.1] — acceptance criteria and story definition
- [Source: epics.md#Epic 7] — "Automated browser tests validating all core user journeys work correctly from the user's perspective. Training deliverable: Minimum 5 passing Playwright tests"
- [Source: playwright.config.ts] — baseURL, testDir, webServer, workers config
- [Source: e2e/helpers.ts] — deleteAllTasks(), seedTask() API
- [Source: e2e/epic-1-task-display.spec.ts] — established test structure: describe + beforeEach + deleteAllTasks()
- [Source: e2e/epic-5-error-handling.spec.ts] — page.route() pattern for error simulation
- [Source: architecture.md#Testing] — "Frontend testing: Vitest + React Testing Library. Backend testing: Node built-in test runner" (E2E Playwright is separate from both)
- [Source: architecture.md#API & Communication Patterns] — API endpoints and error response format

## Dev Agent Record

### Agent Model Used

claude-4-sonnet-medium

### Debug Log References

_No debug issues encountered._

### Completion Notes List

- Created `e2e/epic-7-e2e-test-suite.spec.ts` following the exact implementation from Dev Notes
- All 5 core user journey tests pass: empty state, create task, complete task, delete task, error state with retry
- Used `deleteAllTasks()` in `beforeEach` for clean state; `seedTask()` for pre-populating test data
- Used `page.route()` to intercept `GET /api/tasks` with a 500 response before `page.goto()` for the error state test
- Pre-existing 4 failures in `epic-5-error-handling.spec.ts` (toast role assertions) confirmed to be pre-existing — not introduced by this story
- All 6 Acceptance Criteria satisfied; 62 of 66 total tests pass (4 pre-existing failures unrelated to this story)

### File List

- `e2e/epic-7-e2e-test-suite.spec.ts` (created)

## Senior Developer Review (AI)

**Reviewer:** chlo | **Date:** 2026-03-16

**Outcome:** Approved with fixes applied

### Findings

| # | Severity | Issue | Resolution |
|---|----------|-------|------------|
| H1 | HIGH | Test title `'completes a task with visual feedback and sorts to bottom'` claimed ordering behavior but only one task was seeded — positional sorting cannot be verified with a single item. False confidence in AC #4 coverage. | Fixed: renamed to `'completes a task with visual feedback'` |
| M1 | MEDIUM | `page.keyboard.press('Enter')` in the create-task test fires on global keyboard state rather than the input locator — fragile if focus shifts. | Fixed: changed to `page.getByPlaceholder('Add a task...').press('Enter')` |
| M2 | MEDIUM | Create-task test verified the task appeared but did not assert the empty state was gone — could silently pass with both UI states simultaneously visible. | Fixed: added `not.toBeVisible()` assertion on empty state after creation |
| L1 | LOW | `const API = 'http://localhost:3001'` duplicates `API_URL` from `helpers.ts` — systemic pattern across the test suite; deferred pending a `helpers.ts` export refactor | Not fixed (scope: all epics) |
| L2 | LOW | `not.toBeVisible()` on deleted task is weaker than `not.toBeAttached()` — consistent with established codebase pattern | Not fixed (consistency) |
| L3 | LOW | Input field clear assertion missing after task creation — covered by unit tests in `TaskInput.test.tsx` | Not fixed (ACs satisfied at unit level) |

**Issues Fixed:** 3 (1 HIGH, 2 MEDIUM)
**Action Items Created:** 0

All ACs verified as implemented. All HIGH and MEDIUM issues resolved.

### Change Log

- 2026-03-16: Created `e2e/epic-7-e2e-test-suite.spec.ts` with 5 core user journey E2E tests covering AC #1–#6
- 2026-03-16: Code review — fixed misleading test title (H1), locator-scoped key press (M1), empty state disappears assertion (M2); status → done
