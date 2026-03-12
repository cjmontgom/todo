# Story 2.1: Create a New Task

Status: review

## Story

As a user,
I want to type a task and add it to my list,
So that I can capture what's on my mind instantly.

## Acceptance Criteria

1. **Given** the app is loaded
   **When** the user types text in the TaskInput field and presses Enter or clicks the coral "+" button
   **Then** a `POST /api/tasks` request is sent, the new task appears in the list as active with clear visual distinction, and the input field clears

2. **Given** the user submits empty or whitespace-only text
   **When** they press Enter or click "+"
   **Then** nothing happens — no error message, no empty task created

3. **Given** a new task is created
   **When** it appears in the list
   **Then** it is visually distinguished as active (full opacity, no strikethrough) with its creation timestamp stored

4. **Given** the app is viewed on a mobile device
   **When** the user interacts with TaskInput
   **Then** the "+" button and input field are touch-friendly with 44x44px minimum tap targets

5. **Given** the task is being submitted
   **When** the API call is in flight
   **Then** the submit button is disabled to prevent duplicate submissions

## Tasks / Subtasks

- [x] Task 1: Add `createTask()` to `backend/src/db.ts` (AC: #1, #3)
  - [x] Add function that INSERTs a row with `text` and returns the created task with all columns
  - [x] Map `created_at` → `createdAt` in the return (same pattern as `getAllTasks`)
  - [x] Return full task object: `{ id, text, completed, createdAt }`
- [x] Task 2: Add `POST /api/tasks` route to `backend/src/routes.ts` (AC: #1, #2)
  - [x] Add route handler with Fastify JSON schema validation on request body (`{ text: string }`)
  - [x] Schema must include `type` property (Fastify v5 requirement)
  - [x] Reject empty/whitespace-only text with `400` and `{ "error": "Task text is required" }`
  - [x] Trim whitespace from text before insertion
  - [x] On success return `201` with the created task object
  - [x] Catch DB errors and return `500` with `{ "error": "Something went wrong" }`
- [x] Task 3: Add `createTask()` to `frontend/src/api.ts` (AC: #1)
  - [x] POST to `${API_URL}/api/tasks` with `Content-Type: application/json` body `{ text }`
  - [x] Return the created `Task` from the response
  - [x] Throw on non-ok response
- [x] Task 4: Create `TaskInput` component (AC: #1, #2, #4, #5)
  - [x] Create `frontend/src/components/TaskInput.tsx`
  - [x] Text input field with placeholder text (e.g. "Add a task...")
  - [x] Coral "+" submit button
  - [x] Local `text` state and `submitting` state
  - [x] Submit on Enter key press OR "+" button click
  - [x] Silently ignore empty/whitespace-only submissions (no error message)
  - [x] Clear input on successful submission
  - [x] Disable submit button while API call is in flight
  - [x] 44x44px minimum tap targets on both input and button
  - [x] Focus ring: 2px coral outline on input focus
  - [x] Accessibility: `aria-label` on submit button ("Add task")
- [x] Task 5: Wire TaskInput into App.tsx (AC: #1, #3)
  - [x] Add `handleCreateTask(text: string)` to App.tsx
  - [x] Call `createTask(text)` from api.ts
  - [x] On success: prepend new task to `tasks` state (active tasks appear first)
  - [x] Pass `onCreateTask` callback to TaskInput
  - [x] Render TaskInput between AppHeader and TaskList
- [x] Task 6: Handle creation error state (AC: #1)
  - [x] On API failure, display inline error below TaskInput in `text-error-text` on `bg-error-bg`
  - [x] Preserve typed text in the input field on failure
  - [x] Dismiss error when user starts typing again
  - [x] Add `createError` state to App.tsx, pass to TaskInput
- [x] Task 7: Add tests (AC: #1, #2, #5)
  - [x] Add `POST /api/tasks` backend tests in `backend/src/routes.test.ts`: success (201), empty text (400), DB error (500)
  - [x] Create `frontend/src/components/TaskInput.test.tsx`: submits on Enter, submits on button click, ignores empty input, clears on success, preserves text on error, disables button during submission
  - [x] Update `frontend/src/App.test.tsx`: add test for create task flow (new task appears in list)

## Dev Notes

### Existing Codebase (from Stories 1.1 & 1.2)

**Backend files already in place:**
- `backend/src/db.ts` — `pg.Pool` exported as default + `getAllTasks()` with camelCase mapping. **Add `createTask()` here.**
- `backend/src/routes.ts` — `GET /api/tasks` route. **Add `POST /api/tasks` here.**
- `backend/src/server.ts` — Fastify instance with CORS and route registration. **Do NOT modify.**
- `backend/src/types.ts` — `Task` type with DB column names: `{ id, text, completed, created_at: Date }`

**Frontend files already in place:**
- `frontend/src/api.ts` — `fetchTasks()` function. **Add `createTask()` here.**
- `frontend/src/types.ts` — `Task` interface: `{ id: number, text: string, completed: boolean, createdAt: string }`
- `frontend/src/App.tsx` — State owner with `tasks`, `loading`, `error` state. Renders `AppShell > AppHeader + TaskList`. **Add TaskInput + create handler here.**
- `frontend/src/components/TaskList.tsx` — Sorts active before completed, renders list/loading/error/empty states
- `frontend/src/components/TaskItem.tsx` — Individual task row with Checkbox (display-only)
- `frontend/src/components/Checkbox.tsx` — Circle checkbox, currently display-only (no click handler)
- `frontend/src/index.css` — Tailwind v4 `@theme` tokens (all colours, `font-sans`)

### Backend Implementation Patterns

**db.ts function pattern** (follow `getAllTasks` exactly):
```typescript
export async function createTask(text: string) {
  const result = await pool.query(
    'INSERT INTO tasks (text) VALUES ($1) RETURNING id, text, completed, created_at',
    [text]
  )
  const row = result.rows[0]
  return {
    id: row.id,
    text: row.text,
    completed: row.completed,
    createdAt: row.created_at,
  }
}
```

**Route handler pattern** (follow existing GET route):
```typescript
server.post<{ Body: { text: string } }>('/api/tasks', {
  schema: {
    body: {
      type: 'object',
      required: ['text'],
      properties: {
        text: { type: 'string' },
      },
    },
  },
}, async (request, reply) => {
  const { text } = request.body
  const trimmed = text.trim()
  if (!trimmed) {
    return reply.status(400).send({ error: 'Task text is required' })
  }
  try {
    const task = await createTask(trimmed)
    return reply.status(201).send(task)
  } catch {
    return reply.status(500).send({ error: 'Something went wrong' })
  }
})
```

**Import paths must use `.js` extension** for ESM compatibility with `NodeNext` module resolution (e.g., `import { createTask } from './db.js'`).

### Frontend Implementation Patterns

**api.ts function pattern** (follow `fetchTasks` exactly):
```typescript
export async function createTask(text: string): Promise<Task> {
  const response = await fetch(`${API_URL}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!response.ok) {
    throw new Error('Failed to create task')
  }
  return response.json()
}
```

**App.tsx state pattern** — Every CRUD operation follows the same sequence established in Story 1.2:
1. Set loading/disabled state on the UI element
2. Make `fetch` call via api.ts
3. On success: update local state, clear loading
4. On failure: revert UI, show error, clear loading

No optimistic UI — the API confirms before the UI commits.

### TaskInput Component Specification

**From UX spec — TaskInput is a custom component:**
- Text field + coral "+" add button
- States: empty (placeholder visible), typing (text visible), error (inline error message below), disabled (during submission)
- Enter key and "+" button both submit
- Clears on success, preserves text on failure
- Accessibility: labelled input, coral focus ring, `aria-label` on submit button

**Layout:**
- Input and button on the same row
- Input takes remaining width, button is fixed width
- Mobile: both elements must have 44x44px minimum tap targets
- Desktop: same layout, input may already have visual weight

**Styling tokens (from index.css @theme):**
- Input background: `bg-surface` (`#FFFFFF`)
- Input border: `border-border` (`#E8E6E3`)
- Input text: `text-text-primary` (`#2D2D2D`)
- Input placeholder: `placeholder:text-text-secondary` (`#8B8B8B`)
- Input focus: `focus:outline-2 focus:outline-coral focus:outline-offset-2`
- Button background: `bg-coral` (`#E8927C`)
- Button icon/text: `text-white`
- Button hover: `hover:opacity-90`
- Button disabled: `disabled:opacity-50 disabled:cursor-not-allowed`
- Error text: `text-error-text` (`#C4705A`) on `bg-error-bg` (`#F0D4CE`)
- Transitions: `transition-all duration-200 ease-out`

**Error display:**
- Inline error below the input row, NOT a toast
- `text-error-text` text colour (`#C4705A`) on `bg-error-bg` background (`#F0D4CE`)
- Dismisses when user starts typing again
- Error message text: "Something went wrong. Give it another try."

### Component Hierarchy After This Story

```
App.tsx (state owner — tasks, loading, error, createError)
└── AppShell (layout wrapper)
    ├── AppHeader ("To-do list")
    ├── TaskInput (NEW — local text + submitting state, receives onCreateTask + createError)
    │   └── Inline error display (conditional)
    └── TaskList (conditional rendering)
        ├── LoadingState (when loading)
        ├── ErrorState (when error, with retry)
        ├── EmptyState (when no tasks)
        └── <ul> (when tasks exist)
            └── <li> × N
                └── TaskItem
                    └── Checkbox (display only)
```

### API Response Formats

**POST /api/tasks:**
- Request body: `{ "text": "My new task" }`
- **201** — `{ id: number, text: string, completed: boolean, createdAt: string }`
- **400** — `{ "error": "Task text is required" }` (empty/whitespace text)
- **500** — `{ "error": "Something went wrong" }` (server error)

Dates are ISO 8601 strings. `completed` defaults to `false`. `createdAt` is auto-generated by the DB (`DEFAULT NOW()`).

### Task Ordering After Creation

When a new task is created, it should appear in the active section of the task list. The approach: add the new task to the `tasks` state array and let `TaskList`'s existing sort logic handle placement (active tasks first by creation order, completed tasks below).

To maintain correct ordering: either append the new task to the array (it has the latest `createdAt` so sort is preserved), or re-fetch all tasks. Appending is preferred for responsiveness.

### Tailwind v4 Reminder

- No `tailwind.config.js` — all tokens in `frontend/src/index.css` via `@theme`
- Use generated utility classes: `bg-coral`, `text-error-text`, `bg-error-bg`, `border-border`, etc.
- Do NOT create a `tailwind.config.js` file

### Testing Patterns

**Frontend (Vitest + React Testing Library):**
- Tests co-located: `TaskInput.test.tsx` next to `TaskInput.tsx`
- Mock `api.ts` functions, not `fetch` directly
- Use `@testing-library/user-event` for interaction simulation
- Setup file: `frontend/src/test-setup.ts` (already imports `@testing-library/jest-dom`)
- Vitest config in `frontend/vite.config.ts` (already configured)

**Backend (Node built-in test runner):**
- Tests co-located: `routes.test.ts` next to `routes.ts`
- Uses `--experimental-test-module-mocks` flag (already in `package.json` test script)
- Module mock must be declared before dynamic `import()` of the module under test

### Previous Story Intelligence (from Story 1.2)

Key learnings to apply:
- Backend `mock.module` requires `--experimental-test-module-mocks` flag — already configured in `backend/package.json`
- Module mock must be declared before dynamic `import()` of the module under test for proper interception
- All frontend components follow: mobile-first sizing, Tailwind v4 tokens, 44px tap targets, ARIA attributes
- TaskList sorts active before completed, preserving creation order within groups
- App.tsx owns all state — components receive data/callbacks as props

### What This Story Does NOT Include

- No completion toggle handler (Story 3.1)
- No delete button or handler (Story 4.1)
- No Toast component (Story 5.1)
- No error handling beyond creation failure — load failure error handling already exists from Story 1.2
- No animation of tasks moving between active/completed zones (Story 3.1)

### Anti-Patterns to Avoid

- **Do NOT use optimistic UI** — API confirms before UI commits
- **Do NOT create `tailwind.config.js`** — Tailwind v4 uses CSS-first `@theme`
- **Do NOT show a "required" error for empty input** — silently ignore empty submissions per AC #2
- **Do NOT install any new dependencies** — everything needed is already installed
- **Do NOT modify `backend/src/server.ts`** — routes register through `taskRoutes` function
- **Do NOT put SQL in route handlers** — all queries go through `db.ts`
- **Do NOT use `import { Pool } from 'pg'`** — use `import pg from 'pg'` then `pg.Pool` (ESM compatibility)
- **Do NOT add a `components/` directory index file** — import each component directly
- **Do NOT use `.ts` extension in backend imports** — use `.js` for ESM compatibility
- **Do NOT use a Toast for creation errors** — inline error below input per UX spec

### Project Structure Notes

This story adds one new file and modifies four existing files:

```
frontend/src/
├── api.ts                      ← Modified: add createTask()
├── App.tsx                     ← Modified: add TaskInput + create handler + createError state
├── App.test.tsx                ← Modified: add create task test
└── components/
    ├── TaskInput.tsx            ← NEW
    └── TaskInput.test.tsx       ← NEW

backend/src/
├── db.ts                       ← Modified: add createTask()
├── routes.ts                   ← Modified: add POST /api/tasks
└── routes.test.ts              ← Modified: add POST tests
```

### References

- [Source: architecture.md#API Response Formats] — POST /api/tasks returns 201 with created task; 400 for bad input
- [Source: architecture.md#Frontend State Pattern] — set disabled → fetch → success: update state → failure: show error
- [Source: architecture.md#Error Handling Pattern] — creation failure → inline error below input, text preserved
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — naming, JSON schema validation
- [Source: architecture.md#Data Architecture] — Fastify JSON schema for input validation
- [Source: ux-design-specification.md#Component Strategy] — TaskInput specs: text + "+" button, states, accessibility
- [Source: ux-design-specification.md#Form Patterns] — placeholder #8B8B8B, coral focus, validation rules
- [Source: ux-design-specification.md#Feedback Patterns] — inline error for creation failure, #C4705A on #F0D4CE
- [Source: ux-design-specification.md#State Transition Patterns] — no optimistic UI, 200ms transitions
- [Source: ux-design-specification.md#Accessibility Strategy] — ARIA labels, keyboard nav, 44px tap targets
- [Source: epics.md#Story 2.1] — acceptance criteria and story definition
- [Source: prd.md#FR1] — user can create a new task by providing text description
- [Source: prd.md#FR6] — visual differentiation of active vs completed tasks
- [Source: prd.md#FR7] — creation timestamp stored per task
- [Source: prd.md#FR8] — desktop and mobile without loss of functionality

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (via Cursor)

### Debug Log References

- Initial `handleCreateTask` re-threw errors without a catch in TaskInput's `handleSubmit`, causing unhandled promise rejections in tests. Fixed by adding explicit catch block in TaskInput — error display handled by parent via `createError` prop.

### Completion Notes List

- Added `createTask()` to `backend/src/db.ts` with INSERT RETURNING and camelCase mapping (same pattern as `getAllTasks`)
- Added `POST /api/tasks` route with Fastify JSON schema validation, whitespace trimming, 400/500 error responses
- Added `createTask()` to `frontend/src/api.ts` following established fetch pattern
- Created `TaskInput` component: text input + coral "+" button, Enter/click submit, empty ignore, 44px tap targets, ARIA labels, inline error display
- Wired TaskInput into App.tsx with `createError` state, `handleCreateTask` callback, error dismissal on typing
- 5 backend tests (POST): 201 success, trim whitespace, 400 empty, 400 missing body, 500 DB error
- 9 TaskInput tests: Enter submit, button click submit, empty ignore, whitespace ignore, clear on success, preserve on error, inline error display, error dismissal, button disable during submission
- 2 App integration tests: create task appears in list, inline error on failure
- All 33 tests pass (25 frontend + 8 backend)

### Change Log

- 2026-03-12: Story 2.1 implemented — Task creation with POST /api/tasks endpoint, TaskInput component, inline error handling, and 16 new tests

### File List

**Modified:**
- `backend/src/db.ts` — Added `createTask()` function with camelCase mapping
- `backend/src/routes.ts` — Added POST /api/tasks route with JSON schema validation
- `backend/src/routes.test.ts` — Added 5 POST /api/tasks tests
- `frontend/src/api.ts` — Added `createTask()` function
- `frontend/src/App.tsx` — Added TaskInput + createError state + handleCreateTask
- `frontend/src/App.test.tsx` — Added 2 create task integration tests

**New:**
- `frontend/src/components/TaskInput.tsx` — Task input component with inline error
- `frontend/src/components/TaskInput.test.tsx` — 9 TaskInput unit tests
