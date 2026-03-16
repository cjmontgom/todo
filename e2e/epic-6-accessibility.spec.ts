import { test, expect } from '@playwright/test'
import { deleteAllTasks, seedTask } from './helpers'

const API = 'http://localhost:3001'

test.describe('Epic 6: Accessibility & Keyboard Navigation', () => {
  test.beforeEach(async () => {
    await deleteAllTasks()
  })

  // ── AC #1 & #7 — Skip link presence and target ────────────────────────────

  test('skip link is present and targets task input', async ({ page }) => {
    await page.goto('/')
    const skipLink = page.getByRole('link', { name: 'Skip to task input' })
    await expect(skipLink).toBeAttached()
    await expect(skipLink).toHaveAttribute('href', '#task-input')
  })

  test('first Tab from page load focuses the skip link', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skipLink = page.getByRole('link', { name: 'Skip to task input' })
    await expect(skipLink).toBeFocused()
  })

  test('activating the skip link moves focus to the task input', async ({ page }) => {
    await page.goto('/')
    // Tab to skip link, then press Enter to activate it
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Skip to task input' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('textbox', { name: 'Add a task' })).toBeFocused()
  })

  // ── AC #1 — Task input accessible label ───────────────────────────────────

  test('task input has an accessible label', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox', { name: 'Add a task' })
    await expect(input).toBeVisible()
  })

  test('task input has id="task-input" so the skip link target resolves', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox', { name: 'Add a task' })
    await expect(input).toHaveAttribute('id', 'task-input')
  })

  // ── AC #1 — Tab order through all interactive elements ────────────────────

  test('Tab order proceeds: skip link → task input → submit button → checkbox → delete button', async ({ page }) => {
    await seedTask('Tab order task')
    await page.goto('/')
    await expect(page.getByText('Tab order task')).toBeVisible()

    // 1: skip link
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Skip to task input' })).toBeFocused()

    // 2: task input
    await page.keyboard.press('Tab')
    await expect(page.getByRole('textbox', { name: 'Add a task' })).toBeFocused()

    // 3: submit button
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Add task' })).toBeFocused()

    // 4: checkbox
    await page.keyboard.press('Tab')
    await expect(page.getByRole('checkbox', { name: 'Mark Tab order task as complete' })).toBeFocused()

    // 5: delete button
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Delete task: Tab order task' })).toBeFocused()
  })

  // ── AC #2 — Space key toggles checkbox ────────────────────────────────────

  test('pressing Space on a focused checkbox toggles task completion', async ({ page }) => {
    await seedTask('Space toggle task')
    await page.goto('/')
    await expect(page.getByText('Space toggle task')).toBeVisible()

    const checkbox = page.getByRole('checkbox', { name: 'Mark Space toggle task as complete' })
    await expect(checkbox).toHaveAttribute('aria-checked', 'false')

    await checkbox.focus()
    await page.keyboard.press('Space')

    await expect(
      page.getByRole('checkbox', { name: 'Mark Space toggle task as incomplete' })
    ).toHaveAttribute('aria-checked', 'true')
  })

  // ── AC #3 — Checkbox ARIA attributes ──────────────────────────────────────

  test('active task checkbox has role="checkbox", aria-checked="false", and correct aria-label', async ({ page }) => {
    await seedTask('Active aria task')
    await page.goto('/')
    await expect(page.getByText('Active aria task')).toBeVisible()

    const checkbox = page.getByRole('checkbox', { name: 'Mark Active aria task as complete' })
    await expect(checkbox).toBeVisible()
    await expect(checkbox).toHaveAttribute('role', 'checkbox')
    await expect(checkbox).toHaveAttribute('aria-checked', 'false')
    await expect(checkbox).toHaveAttribute('aria-label', 'Mark Active aria task as complete')
  })

  test('completed task checkbox has aria-checked="true" and updated aria-label', async ({ page }) => {
    await seedTask('Completed aria task', true)
    await page.goto('/')
    await expect(page.getByText('Completed aria task')).toBeVisible()

    const checkbox = page.getByRole('checkbox', { name: 'Mark Completed aria task as incomplete' })
    await expect(checkbox).toHaveAttribute('aria-checked', 'true')
    await expect(checkbox).toHaveAttribute('aria-label', 'Mark Completed aria task as incomplete')
  })

  // ── AC #4 — Delete button ARIA label ──────────────────────────────────────

  test('delete button has aria-label="Delete task: [task text]"', async ({ page }) => {
    await seedTask('Labelled delete task')
    await page.goto('/')
    await expect(page.getByText('Labelled delete task')).toBeVisible()

    const deleteBtn = page.getByRole('button', { name: 'Delete task: Labelled delete task' })
    await expect(deleteBtn).toBeAttached()
    await expect(deleteBtn).toHaveAttribute('aria-label', 'Delete task: Labelled delete task')
  })

  // ── AC #5 — Task list semantic HTML ───────────────────────────────────────

  test('task list renders as <ul> with aria-label="Task list, N items"', async ({ page }) => {
    await seedTask('Semantic task one')
    await seedTask('Semantic task two')
    await page.goto('/')
    await expect(page.getByText('Semantic task one')).toBeVisible()
    await expect(page.getByText('Semantic task two')).toBeVisible()

    const list = page.getByRole('list', { name: 'Task list, 2 items' })
    await expect(list).toBeVisible()
  })

  test('each task in the list is wrapped in a <li> element', async ({ page }) => {
    await seedTask('List item task')
    await page.goto('/')
    await expect(page.getByText('List item task')).toBeVisible()

    const listItem = page.getByRole('listitem').filter({ hasText: 'List item task' })
    await expect(listItem).toBeVisible()
  })

  test('task list aria-label updates when task count changes', async ({ page }) => {
    await seedTask('Count task A')
    await page.goto('/')
    await expect(page.getByRole('list', { name: 'Task list, 1 items' })).toBeVisible()

    await page.getByRole('textbox', { name: 'Add a task' }).fill('Count task B')
    await page.keyboard.press('Enter')

    await expect(page.getByRole('list', { name: 'Task list, 2 items' })).toBeVisible()
  })

  // ── AC #6 — Toast ARIA live region ────────────────────────────────────────

  test('toast has role="alert" and aria-live="polite"', async ({ page }) => {
    await seedTask('Toast aria task')
    await page.goto('/')
    await expect(page.getByText('Toast aria task')).toBeVisible()

    await page.route(`${API}/api/tasks/*`, (route) => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      } else {
        route.continue()
      }
    })

    await page.getByRole('button', { name: 'Delete task: Toast aria task' }).click()

    const toast = page.getByRole('alert')
    await expect(toast).toBeVisible()
    await expect(toast).toHaveAttribute('role', 'alert')
    await expect(toast).toHaveAttribute('aria-live', 'polite')
  })

  // ── AC #8 — Touch target sizes ≥ 44×44px ─────────────────────────────────

  test('task checkbox touch target is at least 44×44px', async ({ page }) => {
    await seedTask('Touch target task')
    await page.goto('/')
    await expect(page.getByText('Touch target task')).toBeVisible()

    const checkbox = page.getByRole('checkbox', { name: 'Mark Touch target task as complete' })
    const box = await checkbox.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })

  test('delete button touch target is at least 44×44px', async ({ page }) => {
    await seedTask('Delete target task')
    await page.goto('/')
    await expect(page.getByText('Delete target task')).toBeVisible()

    const deleteBtn = page.getByRole('button', { name: 'Delete task: Delete target task' })
    const box = await deleteBtn.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })

  test('task input submit button touch target is at least 44×44px', async ({ page }) => {
    await page.goto('/')

    const submitBtn = page.getByRole('button', { name: 'Add task' })
    const box = await submitBtn.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })

  test('task input field height is at least 44px', async ({ page }) => {
    await page.goto('/')

    const input = page.getByRole('textbox', { name: 'Add a task' })
    const box = await input.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })

  // ── AC #1 — Main landmark ─────────────────────────────────────────────────

  test('page has a <main> landmark for screen reader navigation', async ({ page }) => {
    await page.goto('/')
    const main = page.getByRole('main')
    await expect(main).toBeVisible()
  })
})
