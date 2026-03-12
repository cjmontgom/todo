# Story 1.2: View Tasks on App Load

Status: review

## Story

As a user,
I want to see my task list immediately when I open the app,
So that I can see what I need to do.

## Acceptance Criteria

1. **Given** tasks exist in the database
   **When** the user opens the app
   **Then** all tasks are displayed with text and creation timestamp via `GET /api/tasks` returning `200` with `[{ id, text, completed, createdAt }]`

2. **Given** no tasks exist in the database
   **When** the user opens the app
   **Then** the EmptyState component is shown with a warm, inviting message (e.g. "Nothing here yet. What's on your mind?")

3. **Given** the API request is in flight
   **When** the user opens the app
   **Then** a subtle LoadingState (skeleton or gentle pulse) is displayed

4. **Given** the app is open with tasks displayed
   **When** the user refreshes the page
   **Then** the same tasks are displayed — data persists across page refreshes and browser sessions

## Tasks / Subtasks

- [x] Task 1: Implement `GET /api/tasks` backend route (AC: #1, #4)
  - [x] Replace placeholder `GET /api/tasks` in `backend/src/routes.ts` with real database query
  - [x] Add query function to `backend/src/db.ts` that selects all tasks ordered by `created_at ASC`
  - [x] Transform `snake_case` columns to `camelCase` in `db.ts` before returning (`created_at` → `createdAt`)
  - [x] Return `200` with `[{ id, text, completed, createdAt }]`
  - [x] Handle database errors: return `500` with `{ "error": "Something went wrong" }`
- [x] Task 2: Create AppShell component (AC: #1)
  - [x] Create `frontend/src/components/AppShell.tsx`
  - [x] Outer `<div>` container: `min-h-screen bg-background font-sans`
  - [x] Inner content wrapper: `mx-auto` with `max-w-[640px]`, horizontal padding `px-4 sm:px-6 md:px-8`
- [x] Task 3: Create AppHeader component (AC: #1)
  - [x] Create `frontend/src/components/AppHeader.tsx`
  - [x] Display "To-do list" as `<h1>` (not "Todo")
  - [x] Styling: `text-lg sm:text-xl font-semibold text-text-primary`, vertical padding `py-6 sm:py-8`
- [x] Task 4: Create EmptyState component (AC: #2)
  - [x] Create `frontend/src/components/EmptyState.tsx`
  - [x] Display warm message: "Nothing here yet. What's on your mind?"
  - [x] Styling: `text-text-secondary text-center`, vertically centred in the list area with generous padding
- [x] Task 5: Create LoadingState component (AC: #3)
  - [x] Create `frontend/src/components/LoadingState.tsx`
  - [x] Subtle skeleton/pulse animation — 3–4 placeholder lines mimicking task rows
  - [x] Use `animate-pulse` with `bg-border` rectangles for skeleton effect
- [x] Task 6: Create ErrorState component (AC: implicit — load failure path)
  - [x] Create `frontend/src/components/ErrorState.tsx`
  - [x] Full-page error for initial load failure
  - [x] Warm message (e.g. "Something went wrong. Let's try again.")
  - [x] Coral retry button: `bg-coral text-white` with `hover:opacity-90`, 44x44px minimum tap target
  - [x] Accept `onRetry` callback prop
- [x] Task 7: Create Checkbox component (AC: #1 — visual only for this story)
  - [x] Create `frontend/src/components/Checkbox.tsx`
  - [x] 20px circle within 44x44px tap target area
  - [x] Unchecked: empty circle with `border-border` (2px border)
  - [x] Checked: `bg-coral` fill with white checkmark SVG
  - [x] Accept `checked: boolean` prop — display only, no toggle handler in this story
  - [x] Accessibility: `role="checkbox"`, `aria-checked`, `aria-label="Mark [task text] as complete"`
- [x] Task 8: Create TaskItem component (AC: #1)
  - [x] Create `frontend/src/components/TaskItem.tsx`
  - [x] Layout: Checkbox | task text | (delete button placeholder for future story)
  - [x] Active state: full opacity text in `text-text-primary`
  - [x] Completed state: `line-through text-completed`
  - [x] Bottom border: `border-b border-border` (ruled-line effect)
  - [x] Vertical padding: `py-3 sm:py-4`
  - [x] Display task text — no timestamp display in the UI (stored in data model only)
  - [x] Accept `task: Task` prop
- [x] Task 9: Create TaskList component (AC: #1, #2, #3)
  - [x] Create `frontend/src/components/TaskList.tsx`
  - [x] Accept `tasks`, `loading`, `error`, `onRetry` props
  - [x] Sort: active tasks first (by creation order), completed tasks below
  - [x] Render LoadingState when `loading` is true
  - [x] Render ErrorState when `error` is non-null (pass `onRetry`)
  - [x] Render EmptyState when `tasks` is empty and not loading/error
  - [x] Render `<ul>` with `<li>` wrapping each TaskItem when tasks exist
  - [x] Semantic: `aria-label="Task list, X items"` on `<ul>`
- [x] Task 10: Rewrite App.tsx to compose all components (AC: #1, #2, #3, #4)
  - [x] State: `tasks` (Task[]), `loading` (boolean, initially true), `error` (string | null)
  - [x] On mount: set `loading = true`, call `fetchTasks()`, on success set tasks + `loading = false`, on failure set error + `loading = false`
  - [x] Render: AppShell > AppHeader + TaskList
  - [x] Implement `handleRetry` that resets error, sets loading, re-fetches
  - [x] Remove current minimal placeholder UI entirely
- [x] Task 11: Create test files (AC: #1, #2, #3)
  - [x] Create `frontend/src/App.test.tsx` — tests: renders loading then tasks, shows empty state, shows error with retry
  - [x] Create `frontend/src/components/TaskList.test.tsx` — tests: sorts active before completed, renders empty/loading/error states
  - [x] Create `frontend/src/components/TaskItem.test.tsx` — tests: renders active vs completed visual states
  - [x] Create `backend/src/routes.test.ts` — tests: GET /api/tasks returns tasks, returns empty array, handles DB error
  - [x] Install test deps if not present: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`

## Dev Notes

### Existing Codebase (from Story 1.1)

Story 1.1 created the full project skeleton. Key files already in place:

- `frontend/src/api.ts` — has `fetchTasks()` using `fetch` against `VITE_API_URL/api/tasks`. Returns `Promise<Task[]>`.
- `frontend/src/types.ts` — `Task` interface: `{ id: number, text: string, completed: boolean, createdAt: string }`
- `frontend/src/index.css` — Tailwind v4 `@theme` tokens already configured (all colours, font-sans)
- `frontend/src/App.tsx` — minimal placeholder that calls `fetchTasks()` on mount. **Replace entirely**.
- `backend/src/routes.ts` — placeholder `GET /api/tasks` returning `[]`. **Replace with real DB query**.
- `backend/src/db.ts` — `pg.Pool` exported as default, using `DATABASE_URL`
- `backend/src/types.ts` — `Task` type with DB column names: `{ id, text, completed, created_at: Date }`
- `backend/src/server.ts` — Fastify instance with CORS and route registration. **Do not modify**.

### Critical: Tailwind CSS v4 (No Config File)

Tailwind v4 does **not** use `tailwind.config.js`. All design tokens are in `frontend/src/index.css` via the `@theme` directive. Use the generated utility classes directly:

- `bg-background` → `#FAFAF8`
- `bg-surface` → `#FFFFFF`
- `text-text-primary` → `#2D2D2D`
- `text-text-secondary` → `#8B8B8B`
- `border-border` → `#E8E6E3`
- `text-completed` → `#B0AEA9`
- `bg-coral` → `#E8927C`
- `text-coral-dark` → `#C4705A`
- `bg-hover` → `#F3EEEB`
- `bg-error-bg` → `#F0D4CE`
- `text-error-text` → `#C4705A`
- `font-sans` → `'Inter', sans-serif`

### snake_case → camelCase Transform

The transform happens in `backend/src/db.ts`, NOT in route handlers. The `db.ts` query function must return objects with `camelCase` keys. For V1 the only mapped field is `created_at` → `createdAt`. Example:

```typescript
export async function getAllTasks() {
  const result = await pool.query('SELECT id, text, completed, created_at FROM tasks ORDER BY created_at ASC')
  return result.rows.map(row => ({
    id: row.id,
    text: row.text,
    completed: row.completed,
    createdAt: row.created_at,
  }))
}
```

### API Response Format

`GET /api/tasks` returns:
- **200** — `[{ id: number, text: string, completed: boolean, createdAt: string }]`
- **500** — `{ "error": "Something went wrong" }`

Dates are ISO 8601 strings (`"2026-03-12T14:30:00.000Z"`). PostgreSQL `TIMESTAMPTZ` serialises as ISO 8601 by default via `pg` driver.

### Task List Ordering

Active tasks first in creation order (`created_at ASC`), completed tasks below. The sorting should happen on the frontend in the TaskList component so the backend query remains simple (just `ORDER BY created_at ASC`). Frontend sort:

```typescript
const sorted = [...tasks].sort((a, b) => {
  if (a.completed !== b.completed) return a.completed ? 1 : -1
  return 0 // preserve original DB order within each group
})
```

### Component Hierarchy

```
App.tsx (state owner)
└── AppShell (layout wrapper)
    ├── AppHeader ("To-do list")
    └── TaskList (conditional rendering)
        ├── LoadingState (when loading)
        ├── ErrorState (when error, with retry)
        ├── EmptyState (when no tasks)
        └── <ul> (when tasks exist)
            └── <li> × N
                └── TaskItem
                    └── Checkbox (display only)
```

### UX Specifications

- **App header:** displays "To-do list" (not "Todo")
- **Mobile-first** with single breakpoint at `sm:` (640px)
- **Max-width:** 640px centred on desktop
- **Ruled-line effect:** 1px warm borders between task items (`border-b border-border`)
- **No timestamps displayed in UI** — stored in data model but not shown to user per UX spec
- **Loading state:** subtle skeleton/pulse, NOT a spinner. Nearly invisible on fast connections.
- **Empty state:** warm text-only message, centred, `text-text-secondary`
- **Error state:** full-page with warm message + coral retry button
- **All transitions:** 200ms ease-out (`transition-all duration-200 ease-out`)
- **Touch targets:** 44x44px minimum on all interactive elements
- **Focus indicators:** visible 2px coral outlines (`focus:outline-2 focus:outline-coral focus:outline-offset-2`)

### Checkbox Visual Spec

- **Size:** 20px circle (`w-5 h-5 rounded-full`)
- **Tap target:** 44x44px wrapper (`w-11 h-11 flex items-center justify-center`)
- **Unchecked:** `border-2 border-border` empty circle
- **Checked:** `bg-coral` filled circle with white checkmark (inline SVG or Unicode ✓)
- **Transition:** `transition-colors duration-200 ease-out`

### Fastify v5 Route Pattern

Routes must use JSON schema with `type` property. Example for GET /api/tasks:

```typescript
import { FastifyInstance } from 'fastify'
import { getAllTasks } from './db.js'

export async function taskRoutes(server: FastifyInstance) {
  server.get('/api/tasks', async (_request, reply) => {
    try {
      const tasks = await getAllTasks()
      return reply.send(tasks)
    } catch {
      return reply.status(500).send({ error: 'Something went wrong' })
    }
  })
}
```

Note: import paths must use `.js` extension for ESM compatibility with `NodeNext` module resolution (even though source files are `.ts`).

### Testing Setup

**Frontend testing** — Vitest + React Testing Library:
- Install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- Add to `vite.config.ts`:
  ```typescript
  /// <reference types="vitest/config" />
  import { defineConfig } from 'vite'
  // ... existing config
  export default defineConfig({
    plugins: [react(), tailwindcss()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test-setup.ts',
    },
  })
  ```
- Create `frontend/src/test-setup.ts`:
  ```typescript
  import '@testing-library/jest-dom'
  ```
- Add `"test": "vitest"` script to `frontend/package.json`

**Backend testing** — Node built-in test runner (`node:test`):
- No additional deps needed
- Run with: `node --test --import tsx src/routes.test.ts`
- Add `"test": "node --test --import tsx src/routes.test.ts"` script to `backend/package.json`

### What This Story Does NOT Include

- No TaskInput (created in Story 2.1)
- No delete button (created in Story 4.1)
- No completion toggle handler (created in Story 3.1) — Checkbox is display-only
- No Toast component (created in Story 5.1)
- No error handling beyond initial load failure
- No click/tap handlers on Checkbox or DeleteButton — visual display only

### Anti-Patterns to Avoid

- **Do NOT use optimistic UI** — API confirms before UI commits
- **Do NOT create `tailwind.config.js`** — Tailwind v4 uses CSS-first `@theme`
- **Do NOT install an ORM** — raw SQL with `pg`
- **Do NOT show a spinner** — use skeleton/pulse loading state
- **Do NOT pre-seed the database** — app starts empty, EmptyState handles first-use experience
- **Do NOT display timestamps in the task UI** — stored in data, not shown per UX spec
- **Do NOT add routing** — single-page app, single view
- **Do NOT put SQL in route handlers** — all queries go through `db.ts`
- **Do NOT use `import { Pool } from 'pg'`** — use `import pg from 'pg'` then `pg.Pool` (ESM compatibility)
- **Do NOT add a `components/` directory index file** — import each component directly

### Project Structure Notes

This story creates the `frontend/src/components/` directory with the first batch of components. File structure after completion:

```
frontend/src/
├── main.tsx
├── index.css
├── App.tsx                 ← Rewritten: state + component composition
├── App.test.tsx            ← New: integration tests
├── api.ts                  ← Unchanged from 1.1
├── types.ts                ← Unchanged from 1.1
├── test-setup.ts           ← New: testing library setup
└── components/
    ├── AppShell.tsx         ← New
    ├── AppHeader.tsx        ← New
    ├── TaskList.tsx         ← New
    ├── TaskList.test.tsx    ← New
    ├── TaskItem.tsx         ← New
    ├── TaskItem.test.tsx    ← New
    ├── Checkbox.tsx         ← New
    ├── EmptyState.tsx       ← New
    ├── LoadingState.tsx     ← New
    └── ErrorState.tsx       ← New

backend/src/
├── server.ts               ← Unchanged from 1.1
├── routes.ts               ← Modified: real DB query
├── routes.test.ts          ← New
├── db.ts                   ← Modified: add getAllTasks() with camelCase mapping
└── types.ts                ← Unchanged from 1.1
```

### References

- [Source: architecture.md#API Response Formats] — GET /api/tasks returns 200 with camelCase task array
- [Source: architecture.md#Frontend State Pattern] — set loading → fetch → on success update state → on failure show error
- [Source: architecture.md#Error Handling Pattern] — load failure → full-page ErrorState with retry
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — naming, file patterns, co-located tests
- [Source: architecture.md#Project Structure & Boundaries] — complete directory tree and file responsibilities
- [Source: ux-design-specification.md#Design Direction] — Direction A Clean Ruled, "To-do list" header, ruled-line borders
- [Source: ux-design-specification.md#Color System] — full colour palette with hex values
- [Source: ux-design-specification.md#Typography System] — Inter font, type scale
- [Source: ux-design-specification.md#Spacing & Layout Foundation] — 8px base unit, padding scale, max-width 640px
- [Source: ux-design-specification.md#Component Strategy] — all 11 component specs
- [Source: ux-design-specification.md#Responsive Strategy] — mobile-first, single breakpoint sm: 640px
- [Source: ux-design-specification.md#Accessibility Strategy] — ARIA roles, keyboard nav, focus indicators
- [Source: ux-design-specification.md#Empty State Pattern] — warm message, text-only, centred
- [Source: ux-design-specification.md#State Transition Patterns] — no optimistic UI, 200ms transitions
- [Source: epics.md#Story 1.2] — acceptance criteria and story requirements

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (via Cursor)

### Debug Log References

- Backend `mock.module` requires `--experimental-test-module-mocks` flag on Node 22; updated test script accordingly
- Module mock must be declared before dynamic `import()` of the module under test for proper interception

### Completion Notes List

- Implemented `getAllTasks()` in `backend/src/db.ts` with snake_case → camelCase transform
- Replaced placeholder route in `backend/src/routes.ts` with real DB query + 500 error handling
- Created 8 frontend components: AppShell, AppHeader, EmptyState, LoadingState, ErrorState, Checkbox, TaskItem, TaskList
- Rewrote `App.tsx` with loading/error/data states, retry mechanism, and full component composition
- All components follow UX spec: mobile-first, Tailwind v4 tokens, 44px tap targets, ARIA attributes
- TaskList sorts active tasks before completed, preserving creation order within groups
- 14 frontend tests (Vitest + React Testing Library): App integration, TaskList states/sorting, TaskItem visual states
- 3 backend tests (node:test): GET returns tasks, empty array, and 500 on DB error
- Installed test deps: vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom

### Change Log

- 2026-03-12: Implemented Story 1.2 — View Tasks on App Load. Added backend GET /api/tasks with real DB query, created 8 UI components, rewrote App.tsx with full state management, added 17 tests (14 frontend, 3 backend).

### File List

**Modified:**
- `backend/src/db.ts` — Added `getAllTasks()` function with camelCase mapping
- `backend/src/routes.ts` — Replaced placeholder with real DB query route + error handling
- `backend/package.json` — Added test script
- `frontend/src/App.tsx` — Rewritten: state management, component composition, retry
- `frontend/vite.config.ts` — Added Vitest test configuration
- `frontend/package.json` — Added test script + test dependencies

**New:**
- `frontend/src/test-setup.ts` — Testing library setup
- `frontend/src/App.test.tsx` — App integration tests
- `frontend/src/components/AppShell.tsx` — Layout wrapper component
- `frontend/src/components/AppHeader.tsx` — App header with "To-do list" heading
- `frontend/src/components/EmptyState.tsx` — Empty state message
- `frontend/src/components/LoadingState.tsx` — Skeleton loading animation
- `frontend/src/components/ErrorState.tsx` — Error state with retry button
- `frontend/src/components/Checkbox.tsx` — Display-only checkbox (circle + checkmark)
- `frontend/src/components/TaskItem.tsx` — Individual task row
- `frontend/src/components/TaskList.tsx` — Task list with conditional rendering
- `frontend/src/components/TaskList.test.tsx` — TaskList unit tests
- `frontend/src/components/TaskItem.test.tsx` — TaskItem unit tests
- `backend/src/routes.test.ts` — Backend route tests
