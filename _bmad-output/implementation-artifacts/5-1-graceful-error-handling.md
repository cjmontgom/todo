# Story 5.1: Graceful Error Handling

Status: ready-for-dev

## Story

As a user,
I want clear, non-alarming feedback when something goes wrong,
So that I trust the app and know what to do.

## Acceptance Criteria

1. **Given** the backend is unavailable on initial load
   **When** the app fails to fetch tasks
   **Then** a full-page ErrorState component is shown with a warm message and a coral retry button
   **And** clicking retry re-attempts the `GET /api/tasks` request

2. **Given** a task creation fails
   **When** the API returns an error
   **Then** an inline error message appears below the TaskInput in `#C4705A` text on `#F0D4CE` background, and the typed text is preserved in the input field
   **And** the error dismisses when the user starts typing again

3. **Given** a completion toggle fails
   **When** the API returns an error
   **Then** the checkbox reverts to its previous state and a Toast slides in from the bottom with a warm error message, auto-dismissing after 3 seconds

4. **Given** a deletion fails
   **When** the API returns an error
   **Then** the task reappears in the list and a Toast slides in from the bottom with a warm error message, auto-dismissing after 3 seconds

5. **Given** any error occurs during an operation
   **When** previously saved tasks exist in the database
   **Then** no data is corrupted or lost — existing task data integrity is preserved

6. **Given** the app encounters any error
   **When** the user continues interacting with the app
   **Then** the app remains in a usable state with no crashes or broken UI

## Tasks / Subtasks

- [ ] Task 1: Create `Toast` component (AC: #3, #4)
  - [ ] Create `frontend/src/components/Toast.tsx`
  - [ ] Accept `message: string` prop
  - [ ] `role="alert"` and `aria-live="polite"` on the container
  - [ ] Fixed position: bottom-center of viewport — `fixed bottom-6 left-1/2 -translate-x-1/2`
  - [ ] Styling: dark warm background (`bg-text-primary`), white text, rounded-lg, `px-4 py-3`, `shadow-lg`
  - [ ] Slide-in animation from bottom: `animate-slide-up` or use inline Tailwind `translate-y` with `transition`
  - [ ] `max-w-sm w-max` to size naturally with content but cap width on small screens
  - [ ] `z-50` to float above all other content
- [ ] Task 2: Update `App.tsx` to manage toast state and wire it up (AC: #3, #4)
  - [ ] Add `toastMessage: string | null` state (initialised to `null`)
  - [ ] Add `showToast(msg: string)` helper — sets `toastMessage`, then clears it after 3000ms via `setTimeout`
  - [ ] Update `handleToggleTask` catch block: call `showToast("Couldn't update the task. Give it another try.")` instead of silent failure
  - [ ] Update `handleDeleteTask` catch block: call `showToast("Couldn't delete the task. Give it another try.")` instead of silent failure
  - [ ] Render `{toastMessage && <Toast message={toastMessage} />}` inside the `AppShell` JSX (after `TaskList`)
  - [ ] Import `Toast` from `./components/Toast`
- [ ] Task 3: Verify AC #1 and AC #2 are already satisfied by existing code (no code changes needed)
  - [ ] Confirm `ErrorState` renders with retry on load failure (already in `TaskList.tsx` + `App.tsx`)
  - [ ] Confirm inline `createError` display and dismissal on typing already works (already in `TaskInput.tsx`)
- [ ] Task 4: Add `Toast` component tests (AC: #3, #4)
  - [ ] Create `frontend/src/components/Toast.test.tsx`
  - [ ] Test: renders message text
  - [ ] Test: has `role="alert"` attribute
  - [ ] Test: has `aria-live="polite"` attribute
- [ ] Task 5: Update `App.test.tsx` for toast behaviour on toggle and delete failures (AC: #3, #4)
  - [ ] Add test: toggle failure shows toast with warm error message
  - [ ] Add test: delete failure shows toast with warm error message

## Dev Notes

### What Is and Is NOT Already Done

**AC #1 — Full-page ErrorState on load failure: ALREADY IMPLEMENTED**
- `App.tsx` `loadTasks()` catches errors and sets `error` state
- `TaskList.tsx` renders `<ErrorState onRetry={onRetry} />` when `error` is truthy
- `ErrorState.tsx` shows the warm message and coral Retry button
- **No code changes needed for AC #1**

**AC #2 — Inline creation error: ALREADY IMPLEMENTED**
- `App.tsx` `handleCreateTask` sets `createError` state on failure and re-throws
- `TaskInput.tsx` renders the inline `bg-error-bg text-error-text` banner when `createError` is set
- `TaskInput.tsx` `handleChange` calls `onClearError()` when the user types
- `TaskInput.tsx` preserves the typed text on failure (does not clear in the catch path)
- **No code changes needed for AC #2**

**AC #3 — Toast on toggle failure: NOT YET IMPLEMENTED**
- `App.tsx` `handleToggleTask` currently has `// Silent failure — Toast error notification deferred to Story 5.1`
- Requires `Toast` component (new file) and toast state in `App.tsx`

**AC #4 — Toast on delete failure: NOT YET IMPLEMENTED**
- `App.tsx` `handleDeleteTask` currently has `// Silent failure — Toast error notification deferred to Story 5.1`
- Requires `Toast` component (new file) and toast state in `App.tsx`

### Existing Codebase (from Stories 1.1–4.1)

**App.tsx state at entry to this story:**
```typescript
const [tasks, setTasks] = useState<Task[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [createError, setCreateError] = useState<string | null>(null)
// ADD: const [toastMessage, setToastMessage] = useState<string | null>(null)
```

**handleToggleTask current (silent failure):**
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

**handleDeleteTask current (silent failure):**
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

**Frontend files already in place:**
- `frontend/src/App.tsx` — state owner. **Modify: add toast state + showToast helper + update catch blocks + render Toast**
- `frontend/src/components/TaskList.tsx` — passes `onRetry` to `ErrorState`. **Do NOT modify.**
- `frontend/src/components/ErrorState.tsx` — full-page error with coral retry button. **Do NOT modify.**
- `frontend/src/components/TaskInput.tsx` — inline error display with clear-on-type. **Do NOT modify.**
- `frontend/src/components/AppShell.tsx` — layout wrapper. **Do NOT modify.**

### Toast Component Specification

**Placement in App.tsx JSX:**
```tsx
<AppShell>
  <AppHeader />
  <TaskInput ... />
  <TaskList ... />
  {toastMessage && <Toast message={toastMessage} />}
</AppShell>
```

The `Toast` renders in the DOM tree but uses `position: fixed` — its position in the JSX tree does not affect visual placement.

**Toast component shape:**
```tsx
interface ToastProps {
  message: string
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-text-primary text-white px-4 py-3 rounded-lg shadow-lg max-w-sm text-sm"
    >
      {message}
    </div>
  )
}
```

**Styling notes:**
- `bg-text-primary` maps to `#2D2D2D` — a warm dark charcoal, readable and non-alarming
- `text-white` for legibility
- `fixed bottom-6 left-1/2 -translate-x-1/2` — centred above the viewport bottom edge
- `z-50` — floats above everything
- `max-w-sm` — prevents stretching on wide viewports
- `shadow-lg` — subtle elevation to indicate it floats above content

**Toast message strings (exact text to use in App.tsx):**
- Toggle failure: `"Couldn't update the task. Give it another try."`
- Delete failure: `"Couldn't delete the task. Give it another try."`

### showToast Helper Pattern

```typescript
const showToast = (msg: string) => {
  setToastMessage(msg)
  setTimeout(() => setToastMessage(null), 3000)
}
```

This replaces the message after 3 seconds. If a second toast fires before the first clears, the timeout from the first call will clear the second message prematurely. For V1 this is acceptable — do not add debounce or ref-tracking logic.

### Updated handleToggleTask and handleDeleteTask

```typescript
const handleToggleTask = async (id: number, completed: boolean) => {
  try {
    const updatedTask = await toggleTask(id, completed)
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    )
  } catch {
    showToast("Couldn't update the task. Give it another try.")
  }
}

const handleDeleteTask = async (id: number) => {
  try {
    await deleteTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  } catch {
    showToast("Couldn't delete the task. Give it another try.")
  }
}
```

Note: No optimistic UI was applied in either handler, so no state revert is needed — the task state is only mutated on API success.

### Testing Patterns

**Frontend (Vitest + React Testing Library):**
- Tests co-located: test files next to source files
- Mock `api.ts` functions, not `fetch` directly
- Use `@testing-library/user-event` for interaction simulation
- Setup file: `frontend/src/test-setup.ts` (already imports `@testing-library/jest-dom`)

**Toast unit tests (new file: `Toast.test.tsx`):**
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Toast } from './Toast'

describe('Toast', () => {
  it('renders the message text', () => {
    render(<Toast message="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('has role="alert"', () => {
    render(<Toast message="Error" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('has aria-live="polite"', () => {
    render(<Toast message="Error" />)
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite')
  })
})
```

**App.test.tsx additions (add to existing describe block):**
```typescript
it('shows toast when toggle fails', async () => {
  const user = userEvent.setup()
  vi.mocked(api.fetchTasks).mockResolvedValue(mockTasks)
  vi.mocked(api.toggleTask).mockRejectedValue(new Error('Network error'))

  render(<App />)

  await waitFor(() => {
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
  })

  const checkboxes = screen.getAllByRole('checkbox')
  const activeCheckbox = checkboxes.find(
    (cb) => cb.getAttribute('aria-label') === 'Mark Buy groceries as complete'
  )!
  await user.click(activeCheckbox)

  await waitFor(() => {
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
  expect(screen.getByRole('alert')).toHaveTextContent(
    "Couldn't update the task. Give it another try."
  )
})

it('shows toast when delete fails', async () => {
  const user = userEvent.setup()
  vi.mocked(api.fetchTasks).mockResolvedValue(mockTasks)
  vi.mocked(api.deleteTask).mockRejectedValue(new Error('Network error'))

  render(<App />)

  await waitFor(() => {
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
  })

  const deleteBtn = screen.getByRole('button', { name: 'Delete task: Buy groceries' })
  await user.click(deleteBtn)

  await waitFor(() => {
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
  expect(screen.getByRole('alert')).toHaveTextContent(
    "Couldn't delete the task. Give it another try."
  )
})
```

### Tailwind v4 Reminder

- No `tailwind.config.js` — all tokens in `frontend/src/index.css` via `@theme`
- Tokens available: `bg-text-primary` (`#2D2D2D`), `bg-error-bg` (`#F0D4CE`), `text-error-text` (`#C4705A`), `text-coral` (`#E8927C`), `bg-coral` (`#E8927C`)
- Do NOT create a `tailwind.config.js` file

### Component Hierarchy After This Story

```
App.tsx (state owner — tasks, loading, error, createError, toastMessage)
└── AppShell (layout wrapper)
    ├── AppHeader ("To-do list")
    ├── TaskInput (local text + submitting state, createError + onClearError props)
    │   └── Inline error display (conditional — createError)
    ├── TaskList (receives onToggle, onDelete, error → ErrorState, loading → LoadingState)
    │   ├── LoadingState (when loading)
    │   ├── ErrorState (when error, with retry)
    │   ├── EmptyState (when no tasks)
    │   └── <ul> (when tasks exist)
    │       └── <li> × N
    │           └── TaskItem (receives onToggle + onDelete)
    │               ├── Checkbox
    │               ├── <span> task text
    │               └── DeleteButton
    └── Toast (NEW — conditional on toastMessage, fixed positioned, role="alert")
```

### What This Story Does NOT Include

- No backend changes — this story is entirely frontend
- No animation on the Toast (a simple `fixed` placement is sufficient for V1; slide-in transition can be added later)
- No Toast queue/stack — only one toast at a time; a second failure within 3 seconds replaces the first
- No manual dismiss button on the Toast — auto-dismiss only
- No changes to ErrorState, TaskInput, TaskList, or TaskItem
- No new dependencies — everything needed is already installed

### Anti-Patterns to Avoid

- **Do NOT add a dismiss button to Toast** — auto-dismiss only per UX spec
- **Do NOT use optimistic UI** — no state revert needed because the handlers never apply optimistic changes
- **Do NOT create `tailwind.config.js`** — Tailwind v4 uses CSS-first `@theme`
- **Do NOT install any new dependencies** — everything needed is already installed
- **Do NOT modify ErrorState, TaskInput, TaskList, or TaskItem** — they are correct as-is
- **Do NOT add a `setTimeout` ref/cleanup in Toast** — the timer is owned by `showToast` in `App.tsx`, not inside `Toast.tsx` itself
- **Do NOT add `aria-live` to any element that already changes dynamically without it** — only the Toast needs it

### Project Structure Notes

This story adds one new file and modifies two existing files:

```
frontend/src/
├── App.tsx                        ← Modified: add toastMessage state, showToast helper, update catch blocks, render Toast
├── App.test.tsx                   ← Modified: add 2 toast tests (toggle failure, delete failure)
└── components/
    ├── Toast.tsx                  ← NEW: Toast component with role="alert", aria-live="polite"
    └── Toast.test.tsx             ← NEW: 3 unit tests for Toast
```

No backend changes. No other frontend files modified.

### References

- [Source: epics.md#Story 5.1] — acceptance criteria and story definition
- [Source: epics.md#Epic 5] — FR12, FR13, FR14 (clear error messages, usable state, data integrity)
- [Source: ux-design-specification.md#Feedback Patterns] — Toast for toggle/delete failure, auto-dismiss after 3s, role="alert" aria-live="polite"
- [Source: ux-design-specification.md#State Transition Patterns] — no optimistic UI, revert on failure
- [Source: prd.md#FR12] — system displays clear, non-technical error message when a task operation fails
- [Source: prd.md#FR13] — system remains usable when backend is temporarily unavailable
- [Source: prd.md#FR14] — system preserves existing task data integrity when errors occur
