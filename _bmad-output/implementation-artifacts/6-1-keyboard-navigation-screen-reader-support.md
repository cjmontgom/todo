# Story 6.1: Keyboard Navigation & Screen Reader Support

Status: ready-for-dev

## Story

As a user who relies on assistive technology,
I want to use the app fully with keyboard and screen reader,
So that the app is accessible to me.

## Acceptance Criteria

1. **Given** the app is loaded
   **When** the user navigates with Tab
   **Then** focus moves through input, submit button, task checkboxes, and delete buttons in logical DOM order with visible 2px coral focus outlines

2. **Given** a checkbox is focused
   **When** the user presses Space
   **Then** the completion state toggles (same behaviour as click)

3. **Given** a screen reader is active
   **When** it reads a checkbox
   **Then** it announces with `role="checkbox"`, `aria-checked`, and `aria-label="Mark [task text] as complete"`

4. **Given** a screen reader is active
   **When** it reads a delete button
   **Then** it announces with `aria-label="Delete task: [task text]"`

5. **Given** the task list is rendered
   **When** a screen reader reads it
   **Then** it uses semantic HTML (`<ul>`, `<li>`) with `aria-label="Task list, X items"`

6. **Given** a Toast error appears
   **When** a screen reader is active
   **Then** the Toast has `role="alert"` and `aria-live="polite"`

7. **Given** a skip link exists at the top of the page
   **When** a keyboard user activates it
   **Then** focus jumps directly to the TaskInput field

8. **Given** all interactive elements at any viewport size
   **When** rendered
   **Then** touch/click targets are at least 44x44px with sufficient spacing between them

## Tasks / Subtasks

- [ ] Task 1: Add skip link and `<main>` landmark to `AppShell.tsx` (AC: #1, #7)
  - [ ] Add a visually-hidden skip link as the first child of the outer div: `<a href="#task-input">Skip to task input</a>`
  - [ ] Style with `sr-only focus:not-sr-only` pattern — hidden until focused, then revealed as a coral pill in the top-left
  - [ ] Change the inner `<div>` to `<main>` for landmark navigation semantics
- [ ] Task 2: Add `id` and `aria-label` to the task input field in `TaskInput.tsx` (AC: #1, #7)
  - [ ] Add `id="task-input"` to the `<input>` element — this is the skip link target
  - [ ] Add `aria-label="Add a task"` to the `<input>` element (placeholder is not a sufficient label for screen readers)
- [ ] Task 3: Verify ACs #2–#6 and #8 are already satisfied by existing code (no code changes needed)
  - [ ] Confirm Space key toggles Checkbox — button element handles Space natively ✓
  - [ ] Confirm Checkbox has `role="checkbox"`, `aria-checked`, and `aria-label` ✓
  - [ ] Confirm DeleteButton has `aria-label="Delete task: [task text]"` ✓
  - [ ] Confirm TaskList renders `<ul aria-label="Task list, X items">` with `<li>` children ✓
  - [ ] Confirm Toast has `role="alert"` and `aria-live="polite"` ✓
  - [ ] Confirm all interactive elements use `w-11 h-11` (44x44px) touch targets ✓
  - [ ] Confirm focus outlines: `focus:outline-2 focus:outline-coral focus:outline-offset-2` on all interactive elements ✓
- [ ] Task 4: Add unit tests for skip link and semantic structure (AC: #1, #7)
  - [ ] Create `frontend/src/components/AppShell.test.tsx`
  - [ ] Test: renders a skip link with `href="#task-input"` and text "Skip to task input"
  - [ ] Test: renders a `<main>` element as the content landmark
- [ ] Task 5: Add unit test for task input label (AC: #1)
  - [ ] Update `frontend/src/components/TaskInput.test.tsx`
  - [ ] Add test: input has `aria-label="Add a task"`
  - [ ] Add test: input has `id="task-input"`
- [ ] Task 6: Create E2E test file for Epic 6 (AC: #1, #2, #7)
  - [ ] Create `e2e/epic-6-accessibility.spec.ts`
  - [ ] Test: skip link is present and has correct `href`
  - [ ] Test: keyboard Tab order reaches task input, submit button, then task controls
  - [ ] Test: task input field has accessible label

## Dev Notes

### What Is and Is NOT Already Done

**AC #1 — Tab order and focus outlines: MOSTLY ALREADY IMPLEMENTED**
- Natural DOM order gives correct Tab sequence: input → submit → checkboxes → delete buttons ✅
- Focus outlines implemented as `focus:outline-2 focus:outline-coral focus:outline-offset-2` on all interactive elements ✅
- **Missing:** Skip link (AC #7) must be the first focusable element — implement in Task 1

**AC #2 — Space key toggles checkbox: ALREADY IMPLEMENTED**
- `Checkbox.tsx` renders as a `<button>` — browsers natively fire click on Space for buttons ✅
- **No code changes needed**

**AC #3 — Screen reader checkbox announcement: ALREADY IMPLEMENTED**
- `Checkbox.tsx` has `role="checkbox"`, `aria-checked={checked}`, `aria-label={label}` ✅
- `TaskItem.tsx` passes label: `"Mark ${task.text} as complete"` (active) / `"Mark ${task.text} as incomplete"` (completed) ✅
- **No code changes needed**

**AC #4 — Screen reader delete button announcement: ALREADY IMPLEMENTED**
- `DeleteButton.tsx` has `aria-label={label}` ✅
- `TaskItem.tsx` passes `label={\`Delete task: ${task.text}\`}` ✅
- **No code changes needed**

**AC #5 — Task list semantic HTML: ALREADY IMPLEMENTED**
- `TaskList.tsx` renders `<ul aria-label={\`Task list, ${tasks.length} items\`}>` ✅
- Each task is wrapped in `<li>` ✅
- **No code changes needed**

**AC #6 — Toast screen reader announcement: ALREADY IMPLEMENTED**
- `Toast.tsx` has `role="alert"` and `aria-live="polite"` ✅
- **No code changes needed** (completed in Story 5.1)

**AC #7 — Skip link: NOT YET IMPLEMENTED**
- No skip link exists anywhere in the codebase
- Requires adding a visually-hidden focusable link as the first DOM element
- Requires `id="task-input"` on the `<input>` in `TaskInput.tsx` as the link target

**AC #8 — Touch targets: ALREADY IMPLEMENTED**
- `Checkbox.tsx`: `w-11 h-11` (44x44px) button wrapper ✅
- `DeleteButton.tsx`: `w-11 h-11 flex items-center justify-center` ✅
- `TaskInput.tsx` submit button: `min-w-[44px] min-h-[44px]` ✅
- **No code changes needed**

### AppShell Changes

**Current `AppShell.tsx`:**
```tsx
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="mx-auto max-w-[640px] px-4 sm:px-6 md:px-8">
        {children}
      </div>
    </div>
  )
}
```

**Updated `AppShell.tsx`:**
```tsx
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background font-sans">
      <a
        href="#task-input"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-coral focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none"
      >
        Skip to task input
      </a>
      <main className="mx-auto max-w-[640px] px-4 sm:px-6 md:px-8">
        {children}
      </main>
    </div>
  )
}
```

**Why `<main>` instead of `<div>`:** The `<main>` landmark lets screen reader users jump directly to the primary content. Combined with the `<h1>` in `AppHeader`, this gives the page a complete landmark hierarchy.

**Skip link styling notes:**
- `sr-only` hides it visually off-screen (position: absolute, width: 1px, height: 1px, overflow: hidden, clip: rect(0, 0, 0, 0))
- `focus:not-sr-only` removes the sr-only constraints when the element is focused
- `focus:absolute focus:top-4 focus:left-4 focus:z-50` positions it in the top-left of the viewport when focused
- `focus:bg-coral focus:text-white focus:px-4 focus:py-2 focus:rounded-lg` applies the coral pill styling — consistent with the app's primary action colour
- `focus:outline-none` prevents double outline (the coral background is the focus indicator here)

### TaskInput Changes

**Add to `<input>` element:**
```tsx
<input
  id="task-input"
  aria-label="Add a task"
  type="text"
  value={text}
  onChange={handleChange}
  onKeyDown={handleKeyDown}
  placeholder="Add a task..."
  disabled={submitting}
  className="flex-1 min-h-[44px] px-3 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-2 focus:outline-coral focus:outline-offset-2 transition-all duration-200 ease-out disabled:opacity-50"
/>
```

**Why `aria-label` instead of a `<label>` element:** The `placeholder` attribute alone is not surfaced as a label by screen readers. An `aria-label` on the input is the simplest way to provide a screen-reader-accessible name without adding a visible label element (the UX spec intentionally omits a visible label — context makes purpose self-evident). The `aria-label` value matches the placeholder text for consistency.

### AppShell Unit Tests

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppShell } from './AppShell'

describe('AppShell', () => {
  it('renders a skip link targeting #task-input', () => {
    render(<AppShell><div /></AppShell>)
    const link = screen.getByRole('link', { name: 'Skip to task input' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#task-input')
  })

  it('renders a main landmark element', () => {
    render(<AppShell><div /></AppShell>)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
```

### TaskInput Unit Test Additions

Add to the existing `describe` block in `TaskInput.test.tsx`:

```tsx
it('task input has an accessible label', () => {
  render(
    <TaskInput
      onCreateTask={vi.fn()}
      createError={null}
      onClearError={vi.fn()}
    />
  )
  expect(screen.getByRole('textbox', { name: 'Add a task' })).toBeInTheDocument()
})

it('task input has id="task-input" for skip link targeting', () => {
  render(
    <TaskInput
      onCreateTask={vi.fn()}
      createError={null}
      onClearError={vi.fn()}
    />
  )
  expect(document.getElementById('task-input')).toBeInTheDocument()
})
```

### E2E Test Pattern

```typescript
import { test, expect } from '@playwright/test'

test.describe('Epic 6: Accessibility & Keyboard Navigation', () => {
  test('skip link is present and targets task input', async ({ page }) => {
    await page.goto('/')
    const skipLink = page.getByRole('link', { name: 'Skip to task input' })
    await expect(skipLink).toBeAttached()
    await expect(skipLink).toHaveAttribute('href', '#task-input')
  })

  test('task input is reachable via Tab from page load', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    // First Tab focuses the skip link
    const skipLink = page.getByRole('link', { name: 'Skip to task input' })
    await expect(skipLink).toBeFocused()
  })

  test('task input has an accessible label', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox', { name: 'Add a task' })
    await expect(input).toBeVisible()
  })
})
```

### Tailwind v4 Reminder

- No `tailwind.config.js` — all tokens in `frontend/src/index.css` via `@theme`
- `sr-only` and `focus:not-sr-only` are standard Tailwind utilities — no custom config needed
- `focus:not-sr-only` requires Tailwind v3.3+ — confirmed available in this project's Tailwind v4 setup

### What This Story Does NOT Include

- No changes to Checkbox, DeleteButton, TaskList, TaskItem, Toast, ErrorState, EmptyState, LoadingState, AppHeader
- No backend changes
- No changes to the visible layout or visual design — the skip link is invisible to mouse/sighted users
- No `<form>` wrapper around TaskInput (the Enter key + button approach is already functional without a form element)
- No ARIA live region for task list updates (not in scope for V1 — the visual feedback is sufficient)
- No focus management after task create/delete/toggle (out of scope — natural DOM focus retention is acceptable)

### Anti-Patterns to Avoid

- **Do NOT add `tabindex="-1"` to the `<main>` element** — some guides recommend this to allow programmatic focus from the skip link, but modern browsers handle `href="#id"` focus correctly for `id`-targeted elements without it
- **Do NOT add a `<label>` element above the input** — the UX spec intentionally omits visible labels; use `aria-label` on the input instead
- **Do NOT create `tailwind.config.js`** — Tailwind v4 uses CSS-first `@theme`
- **Do NOT modify any component other than AppShell and TaskInput** — all other ACs are already satisfied
- **Do NOT install any new dependencies**

### Component Hierarchy After This Story

```
App.tsx (state owner — tasks, loading, error, createError, toastMessage)
└── AppShell (layout — outer div + skip link + <main> landmark)
    ├── AppHeader (<h1>"To-do list"</h1>)
    ├── TaskInput (id="task-input" on <input>, aria-label="Add a task")
    │   └── Inline error display (conditional — createError)
    ├── TaskList (ul[aria-label="Task list, X items"])
    │   ├── LoadingState
    │   ├── ErrorState
    │   ├── EmptyState
    │   └── <ul>
    │       └── <li> × N
    │           └── TaskItem
    │               ├── Checkbox (role="checkbox", aria-checked, aria-label)
    │               ├── <span> task text
    │               └── DeleteButton (aria-label)
    └── Toast (role="alert", aria-live="polite", conditional)
```

### References

- [Source: epics.md#Story 6.1] — acceptance criteria and story definition
- [Source: epics.md#Epic 6] — FR15, FR16, FR17 (keyboard navigation, screen reader labels, touch targets)
- [Source: ux-design-specification.md#Accessibility Strategy] — tab order, skip link, ARIA roles, touch targets
- [Source: ux-design-specification.md#Responsive Design & Accessibility] — keyboard navigation details
- [Source: architecture.md#Frontend Architecture] — semantic HTML structure: `<main>`, `<h1>`, `<ul>`, `<li>`
- [Source: prd.md#FR15] — user can perform all task operations using keyboard navigation alone
- [Source: prd.md#FR16] — user can access all interactive elements via screen reader with meaningful labels

## File List

- `frontend/src/components/AppShell.tsx` — Modified: add skip link (first child), change inner `<div>` to `<main>`
- `frontend/src/components/TaskInput.tsx` — Modified: add `id="task-input"` and `aria-label="Add a task"` to `<input>`
- `frontend/src/components/AppShell.test.tsx` — NEW: 2 tests (skip link present + targets #task-input, main landmark exists)
- `frontend/src/components/TaskInput.test.tsx` — Modified: add 2 tests (aria-label, id on input)
- `e2e/epic-6-accessibility.spec.ts` — NEW: 3 E2E tests (skip link, tab order, accessible label)
