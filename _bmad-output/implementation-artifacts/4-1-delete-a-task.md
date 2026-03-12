# Story 4.1: Delete a Task

Status: ready-for-dev

## Story

As a user,
I want to remove tasks I no longer need,
So that my list stays clean.

## Acceptance Criteria

1. **Given** a task exists in the list
   **When** the user clicks the delete button
   **Then** a `DELETE /api/tasks/:id` request is sent, and on success (`204`) the task is removed from the list

2. **Given** the user is on a desktop viewport (≥640px)
   **When** they hover over a task row
   **Then** the delete button is revealed via CSS opacity transition

3. **Given** the user is on a mobile viewport (<640px)
   **When** they view a task row
   **Then** the delete button is always visible and tappable

4. **Given** a deletion is in progress
   **When** the API call is in flight
   **Then** the delete button is disabled to prevent double-deletion

## Tasks / Subtasks

- [ ] Task 1: Add `deleteTask()` to `backend/src/db.ts` (AC: #1)
  - [ ] Add function that DELETEs a row by `id` and returns a boolean indicating whether a row was deleted
  - [ ] Use parameterised query: `DELETE FROM tasks WHERE id = $1 RETURNING id`
  - [ ] Return `true` if a row was deleted, `false` if no row matched
- [ ] Task 2: Add `DELETE /api/tasks/:id` route to `backend/src/routes.ts` (AC: #1)
  - [ ] Add route handler with Fastify JSON schema validation on params (`{ id: string }`)
  - [ ] Schema must include `type` property (Fastify v5 requirement)
  - [ ] Parse `id` from params as integer
  - [ ] On success return `204` with empty body
  - [ ] Return `404` with `{ "error": "Task not found" }` if no row matched
  - [ ] Catch DB errors and return `500` with `{ "error": "Something went wrong" }`
- [ ] Task 3: Add `deleteTask()` to `frontend/src/api.ts` (AC: #1)
  - [ ] DELETE to `${API_URL}/api/tasks/${id}`
  - [ ] No response body expected — just check for `response.ok`
  - [ ] Throw on non-ok response
- [ ] Task 4: Create `DeleteButton` component (AC: #2, #3, #4)
  - [ ] Create `frontend/src/components/DeleteButton.tsx`
  - [ ] Render a `<button>` with an "×" or trash icon (SVG)
  - [ ] Accept `onClick` callback prop and `disabled` boolean prop
  - [ ] Accept `label` string prop for `aria-label` (e.g. "Delete task: Buy groceries")
  - [ ] 44x44px minimum tap target (`w-11 h-11 flex items-center justify-center`)
  - [ ] Desktop: hidden by default, revealed on parent hover — `opacity-0 sm:group-hover:opacity-100` with `transition-opacity duration-200 ease-out`
  - [ ] Mobile: always visible — `opacity-100 sm:opacity-0` (mobile-first, hidden on sm and above until hover)
  - [ ] Disabled state: `disabled:opacity-50 disabled:cursor-not-allowed`
  - [ ] Colour: `text-text-secondary hover:text-coral-dark`
  - [ ] Focus ring: `focus:outline-2 focus:outline-coral focus:outline-offset-2`
- [ ] Task 5: Update TaskItem to support delete (AC: #1, #2, #3, #4)
  - [ ] Add `onDelete?: (id: number) => Promise<void>` prop to TaskItem
  - [ ] Add local `deleting` state to track in-flight delete requests
  - [ ] On delete button click: set `deleting = true`, call `onDelete(task.id)`, set `deleting = false` on completion
  - [ ] Pass `onClick`, `disabled={deleting}`, and correct `label` to DeleteButton
  - [ ] Add `group` class to the task row container (for `group-hover` to work on DeleteButton)
  - [ ] While deleting, apply subtle `opacity-70` to the entire task row
  - [ ] Layout: Checkbox | task text | DeleteButton (push DeleteButton to the right edge)
- [ ] Task 6: Wire delete through TaskList to App.tsx (AC: #1)
  - [ ] Add `onDelete?: (id: number) => Promise<void>` prop to TaskList
  - [ ] Pass `onDelete` through to each TaskItem
  - [ ] In App.tsx, add `handleDeleteTask(id: number)` function
  - [ ] Call `deleteTask(id)` from api.ts
  - [ ] On success: remove the task from local `tasks` state by filtering out the deleted id
  - [ ] On failure: silently fail (no UI change since no optimistic UI was applied) — Toast error notification deferred to Story 5.1
- [ ] Task 7: Add tests (AC: #1, #2, #4)
  - [ ] Add `DELETE /api/tasks/:id` backend tests in `backend/src/routes.test.ts`: success (204), not found (404), DB error (500)
  - [ ] Update `frontend/src/components/TaskItem.test.tsx`: test delete callback fires on button click, disabled state during delete
  - [ ] Update `frontend/src/App.test.tsx`: test delete flow (task removed from list after delete), test delete failure keeps task in list

## Dev Notes

### Existing Codebase (from Stories 1.1, 1.2, 2.1, 3.1)

**Backend files already in place:**
- `backend/src/db.ts` — `pg.Pool` exported as default + `getAllTasks()` + `createTask()` + `toggleTask()` with camelCase mapping. **Add `deleteTask()` here.**
- `backend/src/routes.ts` — `GET /api/tasks` + `POST /api/tasks` + `PATCH /api/tasks/:id` routes. **Add `DELETE /api/tasks/:id` here.**
- `backend/src/server.ts` — Fastify instance with CORS and route registration. **Do NOT modify.**
- `backend/src/types.ts` — `Task` type with DB column names: `{ id, text, completed, created_at: Date }`

**Frontend files already in place:**
- `frontend/src/api.ts` — `fetchTasks()` + `createTask()` + `toggleTask()` functions. **Add `deleteTask()` here.**
- `frontend/src/types.ts` — `Task` interface: `{ id: number, text: string, completed: boolean, createdAt: string }`
- `frontend/src/App.tsx` — State owner with `tasks`, `loading`, `error`, `createError` state. Renders `AppShell > AppHeader + TaskInput + TaskList`. **Add delete handler here.**
- `frontend/src/components/TaskList.tsx` — Sorts active before completed, renders list/loading/error/empty states. **Add `onDelete` prop here.**
- `frontend/src/components/TaskItem.tsx` — Individual task row with Checkbox + toggle support. **Add delete button + deleting state here.**
- `frontend/src/components/Checkbox.tsx` — Interactive circle checkbox with `<button>` wrapper.
- `frontend/src/index.css` — Tailwind v4 `@theme` tokens (all colours, `font-sans`)

### Backend Implementation Patterns

**db.ts function pattern** (follow `getAllTasks` / `createTask` / `toggleTask`):
```typescript
export async function deleteTask(id: number) {
  const result = await pool.query(
    'DELETE FROM tasks WHERE id = $1 RETURNING id',
    [id]
  )
  return result.rows.length > 0
}
```

**Route handler pattern** (follow existing PATCH route for params schema):
```typescript
server.delete<{ Params: { id: string } }>('/api/tasks/:id', {
  schema: {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
      },
    },
  },
}, async (request, reply) => {
  const id = Number(request.params.id)
  if (Number.isNaN(id)) {
    return reply.status(400).send({ error: 'Invalid task ID' })
  }
  try {
    const deleted = await deleteTask(id)
    if (!deleted) {
      return reply.status(404).send({ error: 'Task not found' })
    }
    return reply.status(204).send()
  } catch {
    return reply.status(500).send({ error: 'Something went wrong' })
  }
})
```

**Import paths must use `.js` extension** for ESM compatibility with `NodeNext` module resolution (e.g., `import { deleteTask } from './db.js'`).

### Frontend Implementation Patterns

**api.ts function pattern** (follow `fetchTasks` / `createTask` / `toggleTask`):
```typescript
export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete task')
  }
}
```

Note: unlike other API functions, `deleteTask` returns `void` — the `204` response has no body.

**App.tsx state update pattern** — remove the deleted task from the array:
```typescript
const handleDeleteTask = async (id: number) => {
  try {
    await deleteTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  } catch {
    // Silent failure — Toast error notification deferred to Story 5.1
  }
}
```

No optimistic UI — the task is only removed from state after the API confirms deletion.

### DeleteButton Component Specification

**From UX spec — DeleteButton is a custom component:**
- "×" symbol or small trash/close icon
- Desktop: hidden by default, revealed on task row hover via CSS `group-hover`
- Mobile: always visible (mobile-first responsive approach)
- Disabled during in-flight delete request

**Layout within TaskItem:**
- Checkbox (left) | task text (flex-1, fills available space) | DeleteButton (right)
- Use `flex items-center` with `flex-1` on the text span and `ml-auto` or natural flex flow pushing DeleteButton right

**Responsive visibility pattern:**
The key pattern is mobile-first: visible by default, hidden on `sm:` breakpoint, revealed again on group hover:
```
opacity-100 sm:opacity-0 sm:group-hover:opacity-100
```
This means:
- Mobile (<640px): `opacity-100` — always visible
- Desktop (≥640px): `opacity-0` by default, `opacity-100` on row hover

The task row (`TaskItem`) needs the `group` class for `group-hover` to work.

**Styling tokens (from index.css @theme):**
- Icon colour: `text-text-secondary` (`#8B8B8B`)
- Hover colour: `hover:text-coral-dark` (`#C4705A`)
- Focus ring: `focus:outline-2 focus:outline-coral focus:outline-offset-2`
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`
- Transition: `transition-opacity duration-200 ease-out` (for hover reveal)
- Tap target: `w-11 h-11` (44x44px)

**Icon approach — "×" close icon (SVG):**
```jsx
<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
</svg>
```

### Component Hierarchy After This Story

```
App.tsx (state owner — tasks, loading, error, createError)
└── AppShell (layout wrapper)
    ├── AppHeader ("To-do list")
    ├── TaskInput (local text + submitting state)
    │   └── Inline error display (conditional)
    └── TaskList (receives onToggle, onDelete)
        ├── LoadingState (when loading)
        ├── ErrorState (when error, with retry)
        ├── EmptyState (when no tasks)
        └── <ul> (when tasks exist)
            └── <li> × N
                └── TaskItem (receives onToggle + onDelete, local toggling + deleting state, group class)
                    ├── Checkbox (interactive — onChange, disabled)
                    ├── <span> task text (flex-1)
                    └── DeleteButton (NEW — onClick, disabled, responsive visibility)
```

### API Response Formats

**DELETE /api/tasks/:id:**
- No request body
- **204** — empty body (success)
- **400** — `{ "error": "Invalid task ID" }` (non-numeric ID)
- **404** — `{ "error": "Task not found" }` (no row matched)
- **500** — `{ "error": "Something went wrong" }` (server error)

### Tailwind v4 Reminder

- No `tailwind.config.js` — all tokens in `frontend/src/index.css` via `@theme`
- Use generated utility classes: `text-text-secondary`, `text-coral-dark`, `border-border`, etc.
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
- Add `deleteTaskMock` alongside existing `getAllTasksMock`, `createTaskMock`, and `toggleTaskMock` at top of test file

### Previous Story Intelligence (from Stories 1.2, 2.1, 3.1)

Key learnings to apply:
- Backend `mock.module` requires `--experimental-test-module-mocks` flag — already configured
- Module mock must be declared before dynamic `import()` of the module under test
- All frontend components follow: mobile-first sizing, Tailwind v4 tokens, 44px tap targets, ARIA attributes
- TaskList sorts active before completed, preserving creation order within groups
- App.tsx owns all state — components receive data/callbacks as props
- Fastify v5 JSON schema validation requires `type` property on all schemas
- TaskItem already uses `toggling` state pattern with `try/finally` — apply the same pattern for `deleting`
- `handleToggleTask` in App.tsx silently catches errors (no re-throw) — `handleDeleteTask` follows the same pattern since Toast is deferred to Story 5.1

### What This Story Does NOT Include

- No Toast component for delete failure (Story 5.1) — delete failure silently keeps the task in the list
- No animation of task removal (CSS transition on opacity is sufficient for V1)
- No confirmation dialog before deletion — single click deletes immediately
- No new dependencies — everything needed is already installed
- No changes to backend/src/server.ts
- No changes to TaskInput, Checkbox, or creation/toggle flow

### Anti-Patterns to Avoid

- **Do NOT use optimistic UI** — API confirms before UI commits. The task must NOT disappear until the DELETE response returns successfully.
- **Do NOT create `tailwind.config.js`** — Tailwind v4 uses CSS-first `@theme`
- **Do NOT install any new dependencies** — everything needed is already installed
- **Do NOT modify `backend/src/server.ts`** — routes register through `taskRoutes` function
- **Do NOT put SQL in route handlers** — all queries go through `db.ts`
- **Do NOT use `import { Pool } from 'pg'`** — use `import pg from 'pg'` then `pg.Pool` (ESM compatibility)
- **Do NOT use `.ts` extension in backend imports** — use `.js` for ESM compatibility
- **Do NOT add a confirmation dialog** — the UX spec does not include one; single click deletes
- **Do NOT add a `components/` directory index file** — import each component directly
- **Do NOT use a Toast for delete errors** — that's Story 5.1. Delete failure simply doesn't remove the task from the list.
- **Do NOT break existing toggle functionality** — the `onToggle` prop and `toggling` state in TaskItem must continue to work alongside the new `onDelete` prop and `deleting` state

### Project Structure Notes

This story adds one new file and modifies existing files:

```
frontend/src/
├── api.ts                      ← Modified: add deleteTask()
├── App.tsx                     ← Modified: add handleDeleteTask, pass onDelete to TaskList
├── App.test.tsx                ← Modified: add delete tests
└── components/
    ├── DeleteButton.tsx         ← NEW
    ├── TaskItem.tsx             ← Modified: add onDelete prop + deleting state + DeleteButton + group class
    ├── TaskItem.test.tsx        ← Modified: add delete interaction tests
    └── TaskList.tsx             ← Modified: add onDelete prop, pass to TaskItem

backend/src/
├── db.ts                       ← Modified: add deleteTask()
├── routes.ts                   ← Modified: add DELETE /api/tasks/:id
└── routes.test.ts              ← Modified: add DELETE tests
```

### References

- [Source: architecture.md#API Response Formats] — DELETE /api/tasks/:id returns 204 empty body; 404 not found
- [Source: architecture.md#Frontend State Pattern] — set disabled → fetch → success: update state → failure: revert
- [Source: architecture.md#Error Handling Pattern] — delete failure → revert UI state, show Toast (Toast deferred to Story 5.1)
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — naming, JSON schema validation, co-located tests
- [Source: architecture.md#Data Architecture] — Fastify JSON schema for input validation
- [Source: ux-design-specification.md#Component Strategy] — DeleteButton: hidden on desktop hover reveal, always visible on mobile
- [Source: ux-design-specification.md#Responsive Strategy] — mobile-first, single breakpoint sm: 640px
- [Source: ux-design-specification.md#State Transition Patterns] — no optimistic UI, 200ms transitions, revert on failure
- [Source: ux-design-specification.md#Feedback Patterns] — toggle/delete failure → Toast (Story 5.1)
- [Source: ux-design-specification.md#Accessibility Strategy] — aria-label on delete button, keyboard nav, 44px tap targets
- [Source: epics.md#Story 4.1] — acceptance criteria and story definition
- [Source: epics.md#Epic 4] — FR4 (delete task)
- [Source: prd.md#FR4] — user can delete a task permanently
