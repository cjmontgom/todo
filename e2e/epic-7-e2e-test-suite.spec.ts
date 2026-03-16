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
    await page.getByPlaceholder('Add a task...').press('Enter')

    await expect(page.getByText('Buy groceries')).toBeVisible()
    await expect(
      page.getByText("Nothing here yet. What's on your mind?")
    ).not.toBeVisible()
  })

  test('completes a task with visual feedback', async ({ page }) => {
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
