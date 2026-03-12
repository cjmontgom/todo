# Story 3.1: Toggle Task Completion

Status: ready-for-dev

## Story

As a user,
I want to mark tasks complete or incomplete,
So that I can track what I've done.

## Acceptance Criteria

1. **Given** an active task in the list
   **When** the user clicks or taps its circle checkbox
   **Then** a `PATCH /api/tasks/:id` request is sent with `{ "completed": true }`, and on success the checkbox fills coral (`#E8927C`), the text gets strikethrough + fades to `#B0AEA9`, and the task moves to the bottom of the list

2. **Given** a completed task at the bottom of the list
   **When** the user clicks or taps its filled checkbox
   **Then** a `PATCH /api/tasks/:id` request is sent with `{ "completed": false }`, and on success the visual state reverts (checkbox clears, text restores) and the task moves back up to the active section

3. **Given** multiple tasks with mixed completion states
   **When** the list is rendered
   **Then** active tasks appear first (by creation order) and completed tasks appear below

4. **Given** a completion toggle is attempted
   **When** the API call is in flight
   **Then** no optimistic UI is applied — the visual state only commits after API confirmation

## Tasks / Subtasks

- [ ] Task 1: Add `toggleTask()` to `backend/src/db.ts` (AC: #1, #2)
  - [ ] Add function that UPDATEs `completed` for a given `id` and returns the updated task
  - [ ] Use parameterised query: `UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING id, text, completed, created_at`
  - [ ] Map `created_at` → `createdAt` in the return (same pattern as `getAllTasks` and `createTask`)
  - [ ] Return full task object `{ id, text, completed, createdAt }` or `null` if id not found
- [ ] Task 2: Add `PATCH /api/tasks/:id` route to `backend/src/routes.ts` (AC: #1, #2, #4)
  - [ ] Add route handler with Fastify JSON schema validation on request body (`{ completed: boolean }`) and params (`{ id: string }`)
  - [ ] Both schemas must include `type` property (Fastify v5 requirement)
  - [ ] Parse `id` from params as integer
  - [ ] On success return `200` with the updated task object
  - [ ] Return `404` with `{ "error": "Task not found" }` if no row matched
  - [ ] Catch DB errors and return `500` with `{ "error": "Something went wrong" }`
- [ ] Task 3: Add `toggleTask()` to `frontend/src/api.ts` (AC: #1, #2)
  - [ ] PATCH to `${API_URL}/api/tasks/${id}` with `Content-Type: application/json` body `{ completed }`
  - [ ] Return the updated `Task` from the response
  - [ ] Throw on non-ok response
- [ ] Task 4: Make Checkbox interactive (AC: #1, #2, #4)
  - [ ] Modify `frontend/src/components/Checkbox.tsx`
  - [ ] Change outer `<div>` to `<button>` for native keyboard and click support
  - [ ] Add optional `onChange` callback prop (when absent, checkbox remains display-only for backwards compatibility)
  - [ ] Add optional `disabled` prop to prevent clicks during in-flight requests
  - [ ] Ensure Space key and Enter key both trigger toggle (native `<button>` behaviour)
  - [ ] Update `aria-label` to reflect current state: "Mark [task text] as complete" / "Mark [task text] as incomplete"
  - [ ] Add `cursor-pointer` when interactive, `cursor-not-allowed` + `opacity-50` when disabled
  - [ ] Preserve all existing visual styling (circle, coral fill, checkmark)
- [ ] Task 5: Update TaskItem to support toggle (AC: #1, #2, #4)
  - [ ] Add `onToggle?: (id: number, completed: boolean) => Promise<void>` prop to TaskItem
  - [ ] Add local `toggling` state to track in-flight toggle requests
  - [ ] On checkbox click: set `toggling = true`, call `onToggle(task.id, !task.completed)`, set `toggling = false` on completion
  - [ ] Pass `onChange`, `disabled={toggling}`, and correct `label` to Checkbox
  - [ ] While toggling, apply subtle `opacity-70` to the entire task row to indicate in-flight state
- [ ] Task 6: Wire toggle through TaskList to App.tsx (AC: #1, #2, #3, #4)
  - [ ] Add `onToggle?: (id: number, completed: boolean) => Promise<void>` prop to TaskList
  - [ ] Pass `onToggle` through to each TaskItem
  - [ ] In App.tsx, add `handleToggleTask(id: number, completed: boolean)` function
  - [ ] Call `toggleTask(id, completed)` from api.ts
  - [ ] On success: update the task's `completed` field in local `tasks` state using the returned task data
  - [ ] On failure: silently fail (no UI change since no optimistic UI was applied) — Toast error notification deferred to Story 5.1
  - [ ] TaskList's existing sort logic handles re-ordering automatically
- [ ] Task 7: Add tests (AC: #1, #2, #3, #4)
  - [ ] Add `PATCH /api/tasks/:id` backend tests in `backend/src/routes.test.ts`: success (200), not found (404), DB error (500), invalid body (400)
  - [ ] Update `frontend/src/components/TaskItem.test.tsx`: test toggle callback fires on checkbox click, disabled state during toggle
  - [ ] Update `frontend/src/App.test.tsx`: test toggle flow (task visual state changes after toggle), test toggle with mixed completion states

## Dev Notes

### Existing Codebase (from Stories 1.1, 1.2, 2.1)

**Backend files already in place:**
- `backend/src/db.ts` — `pg.Pool` exported as default + `getAllTasks()` + `createTask()` with camelCase mapping. **Add `toggleTask()` here.**
- `backend/src/routes.ts` — `GET /api/tasks` + `POST /api/tasks` routes. **Add `PATCH /api/tasks/:id` here.**
- `backend/src/server.ts` — Fastify instance with CORS and route registration. **Do NOT modify.**
- `backend/src/types.ts` — `Task` type with DB column names: `{ id, text, completed, created_at: Date }`

**Frontend files already in place:**
- `frontend/src/api.ts` — `fetchTasks()` + `createTask()` functions. **Add `toggleTask()` here.**
- `frontend/src/types.ts` — `Task` interface: `{ id: number, text: string, completed: boolean, createdAt: string }`
- `frontend/src/App.tsx` — State owner with `tasks`, `loading`, `error`, `createError` state. Renders `AppShell > AppHeader + TaskInput + TaskList`. **Add toggle handler here.**
- `frontend/src/components/TaskList.tsx` — Sorts active before completed, renders list/loading/error/empty states. **Add `onToggle` prop here.**
- `frontend/src/components/TaskItem.tsx` — Individual task row with Checkbox (display-only). **Add toggle callback + toggling state here.**
- `frontend/src/components/Checkbox.tsx` — Circle checkbox, currently display-only (`<div>` with `role="checkbox"`). **Make interactive here.**
- `frontend/src/index.css` — Tailwind v4 `@theme` tokens (all colours, `font-sans`)

### Backend Implementation Patterns

**db.ts function pattern** (follow `getAllTasks` / `createTask` exactly):
```typescript
export async function toggleTask(id: number, completed: boolean) {
  const result = await pool.query(
    'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING id, text, completed, created_at',
    [completed, id]
  )
  if (result.rows.length === 0) return null
  const row = result.rows[0]
  return {
    id: row.id,
    text: row.text,
    completed: row.completed,
    createdAt: row.created_at,
  }
}
```

**Route handler pattern** (follow existing POST route):
```typescript
server.patch<{ Params: { id: string }; Body: { completed: boolean } }>('/api/tasks/:id', {
  schema: {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
      },
    },
    body: {
      type: 'object',
      required: ['completed'],
      properties: {
        completed: { type: 'boolean' },
      },
    },
  },
}, async (request, reply) => {
  const id = Number(request.params.id)
  if (Number.isNaN(id)) {
    return reply.status(400).send({ error: 'Invalid task ID' })
  }
  try {
    const task = await toggleTask(id, request.body.completed)
    if (!task) {
      return reply.status(404).send({ error: 'Task not found' })
    }
    return reply.send(task)
  } catch {
    return reply.status(500).send({ error: 'Something went wrong' })
  }
})
```

**Import paths must use `.js` extension** for ESM compatibility with `NodeNext` module resolution (e.g., `import { toggleTask } from './db.js'`).

### Frontend Implementation Patterns

**api.ts function pattern** (follow `fetchTasks` / `createTask` exactly):
```typescript
export async function toggleTask(id: number, completed: boolean): Promise<Task> {
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  })
  if (!response.ok) {
    throw new Error('Failed to update task')
  }
  return response.json()
}
```

**App.tsx state update pattern** — replace the toggled task in the array with the returned data:
```typescript
const handleToggleTask = async (id: number, completed: boolean) => {
  try {
    const updatedTask = await toggleTask(id, completed)
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    )
  } catch {
    // Silent failure — Toast error notification deferred to Story 5.1
  }
}
```

No optimistic UI — the checkbox and text styling only change when `setTasks` updates with the API response.

### Checkbox Component Refactor

The Checkbox is currently a `<div>` with `role="checkbox"` — display-only. To make it interactive:

**Change from `<div>` to `<button>`** for native keyboard and click support. A `<button>` with `role="checkbox"` gives you:
- Click handling for free
- Space and Enter key handling for free
- Focus management for free
- No need for `tabIndex` or `onKeyDown` handlers

**Updated props interface:**
```typescript
interface CheckboxProps {
  checked: boolean
  label: string
  onChange?: () => void
  disabled?: boolean
}
```

**Key styling changes for the button:**
- Reset button defaults: `bg-transparent border-none p-0`
- Add cursor: `cursor-pointer` (or `cursor-not-allowed disabled:opacity-50` when disabled)
- Preserve the 44x44px tap target (`w-11 h-11`)
- Keep existing `focus:outline-2 focus:outline-coral focus:outline-offset-2` for focus visibility
- Remove any button styling that would override the circle checkbox appearance

### Task Sorting — Already Handled

TaskList already sorts active tasks before completed:
```typescript
const sorted = [...tasks].sort((a, b) => {
  if (a.completed !== b.completed) return a.completed ? 1 : -1
  return 0
})
```

When a task's `completed` field changes in state, React re-renders TaskList, which re-sorts. The task automatically moves between the active and completed zones. **No additional sort logic needed.**

### Animation Approach

The UX spec requests smooth animation when tasks move between active/completed zones. For V1 without adding dependencies:

**Pragmatic approach:** Use CSS `transition` on the task row for opacity/transform effects. True FLIP position animations require JS complexity disproportionate to value for V1. Instead:
- Apply a brief fade transition when the task's completion state changes
- The re-sort happens instantly but the visual transition softens it
- All transitions: `transition-all duration-200 ease-out` (already on TaskItem)

If smooth positional animation is desired later, consider `react-flip-toolkit` in a future polish pass.

### Component Hierarchy After This Story

```
App.tsx (state owner — tasks, loading, error, createError)
└── AppShell (layout wrapper)
    ├── AppHeader ("To-do list")
    ├── TaskInput (local text + submitting state)
    │   └── Inline error display (conditional)
    └── TaskList (receives onToggle)
        ├── LoadingState (when loading)
        ├── ErrorState (when error, with retry)
        ├── EmptyState (when no tasks)
        └── <ul> (when tasks exist)
            └── <li> × N
                └── TaskItem (receives onToggle, local toggling state)
                    └── Checkbox (NOW INTERACTIVE — onChange, disabled)
```

### API Response Formats

**PATCH /api/tasks/:id:**
- Request body: `{ "completed": true }` or `{ "completed": false }`
- **200** — `{ id: number, text: string, completed: boolean, createdAt: string }`
- **400** — `{ "error": "Invalid task ID" }` (non-numeric ID)
- **404** — `{ "error": "Task not found" }` (no row matched)
- **500** — `{ "error": "Something went wrong" }` (server error)

Dates are ISO 8601 strings. The `completed` field reflects the new value.

### Tailwind v4 Reminder

- No `tailwind.config.js` — all tokens in `frontend/src/index.css` via `@theme`
- Use generated utility classes: `bg-coral`, `text-completed`, `border-border`, etc.
- Do NOT create a `tailwind.config.js` file

### Testing Patterns

**Frontend (Vitest + React Testing Library):**
- Tests co-located: test files next to source files
- Mock `api.ts` functions, not `fetch` directly
- Use `@testing-library/user-event` for interaction simulation
- Setup file: `frontend/src/test-setup.ts` (already imports `@testing-library/jest-dom`)

**Backend (Node built-in test runner):**
- Tests co-located: `routes.test.ts` next to `routes.ts`
- Uses `--experimental-test-module-mocks` flag (already in `package.json` test script)
- Module mock must be declared before dynamic `import()` of the module under test
- Add `toggleTaskMock` alongside existing `getAllTasksMock` and `createTaskMock` at top of test file

### Previous Story Intelligence (from Stories 1.2 and 2.1)

Key learnings to apply:
- Backend `mock.module` requires `--experimental-test-module-mocks` flag — already configured
- Module mock must be declared before dynamic `import()` of the module under test
- All frontend components follow: mobile-first sizing, Tailwind v4 tokens, 44px tap targets, ARIA attributes
- TaskList sorts active before completed, preserving creation order within groups
- App.tsx owns all state — components receive data/callbacks as props
- `handleCreateTask` in App.tsx re-throws errors so TaskInput can catch them — consider whether `handleToggleTask` needs similar pattern (it doesn't — no child needs to know about failure since there's no inline error for toggle)
- Fastify v5 JSON schema validation requires `type` property on all schemas

### What This Story Does NOT Include

- No delete button or handler (Story 4.1)
- No Toast component for toggle failure (Story 5.1) — toggle failure silently keeps the task in its current state
- No new dependencies — everything needed is already installed
- No changes to backend/src/server.ts
- No changes to TaskInput or creation flow
- No FLIP/positional animation library — CSS transitions only

### Anti-Patterns to Avoid

- **Do NOT use optimistic UI** — API confirms before UI commits. The checkbox state must NOT change until the PATCH response returns successfully.
- **Do NOT create `tailwind.config.js`** — Tailwind v4 uses CSS-first `@theme`
- **Do NOT install animation libraries** — CSS transitions are sufficient for V1
- **Do NOT install any new dependencies** — everything needed is already installed
- **Do NOT modify `backend/src/server.ts`** — routes register through `taskRoutes` function
- **Do NOT put SQL in route handlers** — all queries go through `db.ts`
- **Do NOT use `import { Pool } from 'pg'`** — use `import pg from 'pg'` then `pg.Pool` (ESM compatibility)
- **Do NOT use `.ts` extension in backend imports** — use `.js` for ESM compatibility
- **Do NOT add a Toast for toggle errors** — that's Story 5.1. Toggle failure simply doesn't update the UI.
- **Do NOT change the Checkbox to an `<input type="checkbox">`** — keep the custom circle styling with a `<button>` wrapper
- **Do NOT break backwards compatibility of Checkbox** — the `onChange` prop should be optional so Checkbox still works as display-only where needed
- **Do NOT add a `components/` directory index file** — import each component directly

### Project Structure Notes

This story modifies existing files only — no new files created:

```
frontend/src/
├── api.ts                      ← Modified: add toggleTask()
├── App.tsx                     ← Modified: add handleToggleTask, pass onToggle to TaskList
├── App.test.tsx                ← Modified: add toggle tests
└── components/
    ├── Checkbox.tsx             ← Modified: div → button, add onChange/disabled props
    ├── TaskItem.tsx             ← Modified: add onToggle prop + toggling state
    ├── TaskItem.test.tsx        ← Modified: add toggle interaction tests
    └── TaskList.tsx             ← Modified: add onToggle prop, pass to TaskItem

backend/src/
├── db.ts                       ← Modified: add toggleTask()
├── routes.ts                   ← Modified: add PATCH /api/tasks/:id
└── routes.test.ts              ← Modified: add PATCH tests
```

### References

- [Source: architecture.md#API Response Formats] — PATCH /api/tasks/:id returns 200 with updated task; 404 not found
- [Source: architecture.md#Frontend State Pattern] — set disabled → fetch → success: update state → failure: revert
- [Source: architecture.md#Error Handling Pattern] — toggle failure → revert UI state, show Toast (Toast deferred to Story 5.1)
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — naming, JSON schema validation, co-located tests
- [Source: architecture.md#Data Architecture] — Fastify JSON schema for input validation
- [Source: ux-design-specification.md#Component Strategy] — Checkbox: 20px circle, 44px tap target, coral fill, white checkmark
- [Source: ux-design-specification.md#Design Direction] — circle checkboxes with coral fill, strikethrough + faded text for completed
- [Source: ux-design-specification.md#State Transition Patterns] — no optimistic UI, 200ms transitions, revert on failure
- [Source: ux-design-specification.md#Feedback Patterns] — toggle/delete failure → Toast (Story 5.1)
- [Source: ux-design-specification.md#Accessibility Strategy] — role="checkbox", aria-checked, Space key toggles, 44px tap targets
- [Source: ux-design-specification.md#Implementation Notes] — completed tasks sort to bottom, animation on toggle
- [Source: epics.md#Story 3.1] — acceptance criteria and story definition
- [Source: epics.md#Epic 3] — FR2 (mark complete), FR3 (toggle back), FR6 (visual differentiation)
- [Source: prd.md#FR2] — user can mark an active task as complete
- [Source: prd.md#FR3] — user can mark a completed task as active (toggle)
- [Source: prd.md#FR6] — visual differentiation of active vs completed tasks

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
