import { test, expect } from '@playwright/test'
import { deleteAllTasks, seedTask } from './helpers'

test.describe('Epic 4: Task Deletion', () => {
  test.beforeEach(async () => {
    await deleteAllTasks()
  })

  test('deletes a task and removes it from the list', async ({ page }) => {
    await seedTask('To be deleted')
    await seedTask('Stay here')

    await page.goto('/')
    await expect(page.getByText('To be deleted')).toBeVisible()
    await expect(page.getByText('Stay here')).toBeVisible()

    await page.getByRole('button', { name: 'Delete task: To be deleted' }).click()

    await expect(page.getByText('To be deleted')).toBeHidden()
    await expect(page.getByText('Stay here')).toBeVisible()
  })

  test('shows empty state after deleting the last task', async ({ page }) => {
    await seedTask('Only task')

    await page.goto('/')
    await expect(page.getByText('Only task')).toBeVisible()

    await page.getByRole('button', { name: 'Delete task: Only task' }).click()

    await expect(page.getByText('Only task')).toBeHidden()
    await expect(
      page.getByText("Nothing here yet. What's on your mind?")
    ).toBeVisible()
  })

  test('can delete a completed task', async ({ page }) => {
    await seedTask('Done and gone', true)

    await page.goto('/')
    await expect(page.getByText('Done and gone')).toBeVisible()

    await page.getByRole('button', { name: 'Delete task: Done and gone' }).click()

    await expect(page.getByText('Done and gone')).toBeHidden()
  })

  test('delete button has correct aria-label', async ({ page }) => {
    await seedTask('Accessible task')

    await page.goto('/')
    await expect(page.getByText('Accessible task')).toBeVisible()

    const deleteBtn = page.getByRole('button', { name: 'Delete task: Accessible task' })
    await expect(deleteBtn).toBeVisible()
  })

  test('deletion persists after page reload', async ({ page }) => {
    await seedTask('Will be removed')
    await seedTask('Will remain')

    await page.goto('/')
    await expect(page.getByText('Will be removed')).toBeVisible()

    await page.getByRole('button', { name: 'Delete task: Will be removed' }).click()
    await expect(page.getByText('Will be removed')).toBeHidden()

    await page.reload()

    await expect(page.getByText('Will remain')).toBeVisible()
    await expect(page.getByText('Will be removed')).toBeHidden()
  })

  test('can delete multiple tasks in sequence', async ({ page }) => {
    await seedTask('Delete me 1')
    await seedTask('Delete me 2')
    await seedTask('Keep me')

    await page.goto('/')
    await expect(page.getByText('Delete me 1')).toBeVisible()

    await page.getByRole('button', { name: 'Delete task: Delete me 1' }).click()
    await expect(page.getByText('Delete me 1')).toBeHidden()

    await page.getByRole('button', { name: 'Delete task: Delete me 2' }).click()
    await expect(page.getByText('Delete me 2')).toBeHidden()

    await expect(page.getByText('Keep me')).toBeVisible()
    await expect(page.getByRole('listitem')).toHaveCount(1)
  })

  test('delete button is always visible on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await seedTask('Mobile task')

    await page.goto('/')
    await expect(page.getByText('Mobile task')).toBeVisible()

    const deleteBtn = page.getByRole('button', { name: 'Delete task: Mobile task' })
    await expect(deleteBtn).toBeVisible()
  })
})
