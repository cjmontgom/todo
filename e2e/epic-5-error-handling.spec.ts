import { test, expect } from '@playwright/test'
import { deleteAllTasks, seedTask } from './helpers'

const API = 'http://localhost:3001'

test.describe('Epic 5: Error Handling', () => {
  test.beforeEach(async () => {
    await deleteAllTasks()
  })

  // ── AC #1 — Full-page ErrorState on load failure ──────────────────────────

  test('shows error state when initial task load fails', async ({ page }) => {
    await page.route(`${API}/api/tasks`, (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      } else {
        route.continue()
      }
    })

    await page.goto('/')

    await expect(page.getByText('Something went wrong. Let\'s try again.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
  })

  test('retry button re-fetches tasks after a load failure', async ({ page }) => {
    let getCount = 0
    await page.route(`${API}/api/tasks`, (route) => {
      if (route.request().method() === 'GET') {
        getCount++
        if (getCount === 1) {
          route.fulfill({ status: 500, body: 'Internal Server Error' })
        } else {
          route.continue()
        }
      } else {
        route.continue()
      }
    })

    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()

    await page.getByRole('button', { name: 'Retry' }).click()

    await expect(page.getByText("Nothing here yet. What's on your mind?")).toBeVisible()
  })

  // ── AC #2 — Inline error on creation failure ──────────────────────────────

  test('shows inline error when task creation fails', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText("Nothing here yet. What's on your mind?")).toBeVisible()

    await page.route(`${API}/api/tasks`, (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      } else {
        route.continue()
      }
    })

    const input = page.getByPlaceholder('Add a task...')
    await input.fill('Doomed task')
    await input.press('Enter')

    await expect(page.getByText('Something went wrong. Give it another try.')).toBeVisible()
  })

  test('input preserves typed text after a creation failure', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText("Nothing here yet. What's on your mind?")).toBeVisible()

    await page.route(`${API}/api/tasks`, (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      } else {
        route.continue()
      }
    })

    const input = page.getByPlaceholder('Add a task...')
    await input.fill('Preserved text')
    await input.press('Enter')

    await expect(page.getByText('Something went wrong. Give it another try.')).toBeVisible()
    await expect(input).toHaveValue('Preserved text')
  })

  test('inline creation error dismisses when user starts typing', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText("Nothing here yet. What's on your mind?")).toBeVisible()

    await page.route(`${API}/api/tasks`, (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      } else {
        route.continue()
      }
    })

    const input = page.getByPlaceholder('Add a task...')
    await input.fill('Fail me')
    await input.press('Enter')

    await expect(page.getByText('Something went wrong. Give it another try.')).toBeVisible()

    await input.pressSequentially('x')

    await expect(page.getByText('Something went wrong. Give it another try.')).toBeHidden()
  })

  // ── AC #3 — Toast on toggle failure ──────────────────────────────────────

  test('shows toast when task completion toggle fails', async ({ page }) => {
    await seedTask('Toggle me')

    await page.goto('/')
    await expect(page.getByText('Toggle me')).toBeVisible()

    await page.route(`${API}/api/tasks/*`, (route) => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      } else {
        route.continue()
      }
    })

    await page.getByRole('checkbox', { name: 'Mark Toggle me as complete' }).click()

    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByRole('alert')).toHaveText("Couldn't update the task. Give it another try.")
  })

  test('checkbox stays unchecked when toggle fails', async ({ page }) => {
    await seedTask('No optimistic update')

    await page.goto('/')
    await expect(page.getByText('No optimistic update')).toBeVisible()

    await page.route(`${API}/api/tasks/*`, (route) => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      } else {
        route.continue()
      }
    })

    const checkbox = page.getByRole('checkbox', { name: 'Mark No optimistic update as complete' })
    await checkbox.click()

    await expect(page.getByRole('alert')).toBeVisible()
    await expect(
      page.getByRole('checkbox', { name: 'Mark No optimistic update as complete' })
    ).toHaveAttribute('aria-checked', 'false')
  })

  // ── AC #4 — Toast on deletion failure ────────────────────────────────────

  test('shows toast when task deletion fails', async ({ page }) => {
    await seedTask('Cannot delete me')

    await page.goto('/')
    await expect(page.getByText('Cannot delete me')).toBeVisible()

    await page.route(`${API}/api/tasks/*`, (route) => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      } else {
        route.continue()
      }
    })

    await page.getByRole('button', { name: 'Delete task: Cannot delete me' }).click()

    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByRole('alert')).toHaveText("Couldn't delete the task. Give it another try.")
  })

  test('task remains in the list when deletion fails', async ({ page }) => {
    await seedTask('Still here')

    await page.goto('/')
    await expect(page.getByText('Still here')).toBeVisible()

    await page.route(`${API}/api/tasks/*`, (route) => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      } else {
        route.continue()
      }
    })

    await page.getByRole('button', { name: 'Delete task: Still here' }).click()

    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByText('Still here')).toBeVisible()
  })

  // ── AC #6 — App remains usable after errors ───────────────────────────────

  test('app remains usable after recovering from a load error', async ({ page }) => {
    let failedOnce = false
    await page.route(`${API}/api/tasks`, (route) => {
      if (route.request().method() === 'GET' && !failedOnce) {
        failedOnce = true
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      } else {
        route.continue()
      }
    })

    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()

    await page.getByRole('button', { name: 'Retry' }).click()
    await expect(page.getByText("Nothing here yet. What's on your mind?")).toBeVisible()

    const input = page.getByPlaceholder('Add a task...')
    await input.fill('Post-recovery task')
    await input.press('Enter')

    await expect(page.getByText('Post-recovery task')).toBeVisible()
  })
})
