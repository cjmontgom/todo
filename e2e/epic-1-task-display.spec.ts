import { test, expect } from '@playwright/test'
import { deleteAllTasks, seedTask } from './helpers'

test.describe('Epic 1: Core Task Display', () => {
  test.beforeEach(async () => {
    await deleteAllTasks()
  })

  test('shows empty state when no tasks exist', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByText("Nothing here yet. What's on your mind?")
    ).toBeVisible()
  })

  test('displays all tasks on app load', async ({ page }) => {
    await seedTask('Buy groceries')
    await seedTask('Walk the dog')
    await seedTask('Read a book')

    await page.goto('/')

    await expect(page.getByText('Buy groceries')).toBeVisible()
    await expect(page.getByText('Walk the dog')).toBeVisible()
    await expect(page.getByText('Read a book')).toBeVisible()
  })

  test('displays both active and completed tasks', async ({ page }) => {
    await seedTask('Active task')
    await seedTask('Done task', true)

    await page.goto('/')

    await expect(page.getByText('Active task')).toBeVisible()
    await expect(page.getByText('Done task')).toBeVisible()
  })

  test('shows loading state before tasks appear', async ({ page }) => {
    await seedTask('Some task')

    await page.goto('/')

    const status = page.getByRole('status')
    await expect(status.or(page.getByText('Some task'))).toBeVisible()
    await expect(page.getByText('Some task')).toBeVisible()
  })

  test('persists tasks across page refreshes', async ({ page }) => {
    await seedTask('Persistent task')

    await page.goto('/')
    await expect(page.getByText('Persistent task')).toBeVisible()

    await page.reload()
    await expect(page.getByText('Persistent task')).toBeVisible()
  })

  test('renders task list with correct aria label', async ({ page }) => {
    await seedTask('Task one')
    await seedTask('Task two')

    await page.goto('/')
    await expect(page.getByText('Task one')).toBeVisible()

    await expect(page.getByRole('list', { name: 'Task list, 2 items' })).toBeVisible()
  })

  test('active tasks appear before completed tasks', async ({ page }) => {
    await seedTask('Completed first', true)
    await seedTask('Active second')

    await page.goto('/')
    await expect(page.getByText('Active second')).toBeVisible()

    const items = page.getByRole('listitem')
    await expect(items).toHaveCount(2)
    await expect(items.nth(0)).toContainText('Active second')
    await expect(items.nth(1)).toContainText('Completed first')
  })
})
