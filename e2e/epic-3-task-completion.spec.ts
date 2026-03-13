import { test, expect } from '@playwright/test'
import { deleteAllTasks, seedTask } from './helpers'

test.describe('Epic 3: Task Completion', () => {
  test.beforeEach(async () => {
    await deleteAllTasks()
  })

  test('marks an active task as complete', async ({ page }) => {
    await seedTask('Buy groceries')

    await page.goto('/')
    await expect(page.getByText('Buy groceries')).toBeVisible()

    const checkbox = page.getByRole('checkbox', { name: 'Mark Buy groceries as complete' })
    await expect(checkbox).toHaveAttribute('aria-checked', 'false')

    await checkbox.click()

    const completedCheckbox = page.getByRole('checkbox', { name: 'Mark Buy groceries as incomplete' })
    await expect(completedCheckbox).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByText('Buy groceries')).toHaveClass(/line-through/)
  })

  test('marks a completed task as active again', async ({ page }) => {
    await seedTask('Walk the dog', true)

    await page.goto('/')
    await expect(page.getByText('Walk the dog')).toBeVisible()

    const checkbox = page.getByRole('checkbox', { name: 'Mark Walk the dog as incomplete' })
    await expect(checkbox).toHaveAttribute('aria-checked', 'true')

    await checkbox.click()

    const activeCheckbox = page.getByRole('checkbox', { name: 'Mark Walk the dog as complete' })
    await expect(activeCheckbox).toHaveAttribute('aria-checked', 'false')
    await expect(page.getByText('Walk the dog')).not.toHaveClass(/line-through/)
  })

  test('completed tasks sort to the bottom of the list', async ({ page }) => {
    await seedTask('Task A')
    await seedTask('Task B')
    await seedTask('Task C')

    await page.goto('/')
    await expect(page.getByText('Task A')).toBeVisible()

    const checkboxB = page.getByRole('checkbox', { name: 'Mark Task B as complete' })
    await checkboxB.click()

    const completedB = page.getByRole('checkbox', { name: 'Mark Task B as incomplete' })
    await expect(completedB).toHaveAttribute('aria-checked', 'true')

    const items = page.getByRole('listitem')
    await expect(items).toHaveCount(3)
    await expect(items.nth(0)).toContainText('Task A')
    await expect(items.nth(1)).toContainText('Task C')
    await expect(items.nth(2)).toContainText('Task B')
  })

  test('un-completing a task moves it back to the active section', async ({ page }) => {
    await seedTask('Active task')
    await seedTask('Was completed', true)

    await page.goto('/')
    await expect(page.getByText('Active task')).toBeVisible()

    const items = page.getByRole('listitem')
    await expect(items.nth(0)).toContainText('Active task')
    await expect(items.nth(1)).toContainText('Was completed')

    const checkbox = page.getByRole('checkbox', { name: 'Mark Was completed as incomplete' })
    await checkbox.click()

    const activeCheckbox = page.getByRole('checkbox', { name: 'Mark Was completed as complete' })
    await expect(activeCheckbox).toHaveAttribute('aria-checked', 'false')
    await expect(page.getByText('Was completed')).not.toHaveClass(/line-through/)
  })

  test('checkbox has correct aria-label for active task', async ({ page }) => {
    await seedTask('Check labels')

    await page.goto('/')
    await expect(page.getByText('Check labels')).toBeVisible()

    const checkbox = page.getByRole('checkbox', { name: 'Mark Check labels as complete' })
    await expect(checkbox).toBeVisible()
    await expect(checkbox).toHaveAttribute('aria-checked', 'false')
  })

  test('checkbox has correct aria-label for completed task', async ({ page }) => {
    await seedTask('Done item', true)

    await page.goto('/')
    await expect(page.getByText('Done item')).toBeVisible()

    const checkbox = page.getByRole('checkbox', {
      name: 'Mark Done item as incomplete',
    })
    await expect(checkbox).toBeVisible()
    await expect(checkbox).toHaveAttribute('aria-checked', 'true')
  })

  test('completed task has visual differentiation (strikethrough)', async ({ page }) => {
    await seedTask('Styled task', true)

    await page.goto('/')
    await expect(page.getByText('Styled task')).toBeVisible()
    await expect(page.getByText('Styled task')).toHaveClass(/line-through/)
    await expect(page.getByText('Styled task')).toHaveClass(/text-completed/)
  })

  test('completion state persists after page reload', async ({ page }) => {
    await seedTask('Persist me')

    await page.goto('/')
    await expect(page.getByText('Persist me')).toBeVisible()

    const checkbox = page.getByRole('checkbox', { name: 'Mark Persist me as complete' })
    await checkbox.click()

    const completedCheckbox = page.getByRole('checkbox', { name: 'Mark Persist me as incomplete' })
    await expect(completedCheckbox).toHaveAttribute('aria-checked', 'true')

    await page.reload()

    const reloadedCheckbox = page.getByRole('checkbox', {
      name: 'Mark Persist me as incomplete',
    })
    await expect(reloadedCheckbox).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByText('Persist me')).toHaveClass(/line-through/)
  })
})
