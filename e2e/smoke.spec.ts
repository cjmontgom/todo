import { test, expect } from '@playwright/test'

test.describe('Smoke test', () => {
  test('app loads and displays the heading', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Todo/)
    await expect(page.getByRole('heading', { name: /to-do list/i })).toBeVisible()
  })

  test('task input is visible and focusable', async ({ page }) => {
    await page.goto('/')

    const input = page.getByRole('textbox')
    await expect(input).toBeVisible()
    await input.focus()
    await expect(input).toBeFocused()
  })
})
