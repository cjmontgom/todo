import { test, expect } from '@playwright/test'
import { deleteAllTasks } from './helpers'

test.describe('Epic 2: Task Creation', () => {
  test.beforeEach(async () => {
    await deleteAllTasks()
  })

  test('creates a task by pressing Enter', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByText("Nothing here yet. What's on your mind?")
    ).toBeVisible()

    const input = page.getByPlaceholder('Add a task...')
    await input.fill('Buy groceries')
    await input.press('Enter')

    await expect(page.getByText('Buy groceries')).toBeVisible()
  })

  test('creates a task by clicking the add button', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByText("Nothing here yet. What's on your mind?")
    ).toBeVisible()

    const input = page.getByPlaceholder('Add a task...')
    await input.fill('Walk the dog')

    await page.getByRole('button', { name: 'Add task' }).click()

    await expect(page.getByText('Walk the dog')).toBeVisible()
  })

  test('clears the input field after successful creation', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByText("Nothing here yet. What's on your mind?")
    ).toBeVisible()

    const input = page.getByPlaceholder('Add a task...')
    await input.fill('New task')
    await input.press('Enter')

    await expect(page.getByText('New task')).toBeVisible()
    await expect(input).toHaveValue('')
  })

  test('does not create a task with empty input', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByText("Nothing here yet. What's on your mind?")
    ).toBeVisible()

    await page.getByRole('button', { name: 'Add task' }).click()

    await expect(
      page.getByText("Nothing here yet. What's on your mind?")
    ).toBeVisible()
  })

  test('does not create a task with whitespace-only input', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByText("Nothing here yet. What's on your mind?")
    ).toBeVisible()

    const input = page.getByPlaceholder('Add a task...')
    await input.fill('   ')
    await input.press('Enter')

    await expect(
      page.getByText("Nothing here yet. What's on your mind?")
    ).toBeVisible()
  })

  test('newly created task appears as active (not completed)', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByText("Nothing here yet. What's on your mind?")
    ).toBeVisible()

    const input = page.getByPlaceholder('Add a task...')
    await input.fill('Fresh task')
    await input.press('Enter')

    await expect(page.getByText('Fresh task')).toBeVisible()

    const checkbox = page.getByRole('checkbox', { name: 'Mark Fresh task as complete' })
    await expect(checkbox).toHaveAttribute('aria-checked', 'false')
  })

  test('can create multiple tasks sequentially', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByText("Nothing here yet. What's on your mind?")
    ).toBeVisible()

    const input = page.getByPlaceholder('Add a task...')

    await input.fill('Task one')
    await input.press('Enter')
    await expect(page.getByText('Task one')).toBeVisible()

    await input.fill('Task two')
    await input.press('Enter')
    await expect(page.getByText('Task two')).toBeVisible()

    await input.fill('Task three')
    await input.press('Enter')
    await expect(page.getByText('Task three')).toBeVisible()

    await expect(page.getByRole('listitem')).toHaveCount(3)
  })

  test('disables submit button while task is being created', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByText("Nothing here yet. What's on your mind?")
    ).toBeVisible()

    const input = page.getByPlaceholder('Add a task...')
    await input.fill('Slow task')

    const addButton = page.getByRole('button', { name: 'Add task' })
    await addButton.click()

    await expect(page.getByText('Slow task')).toBeVisible()
    await expect(addButton).toBeEnabled()
  })
})
