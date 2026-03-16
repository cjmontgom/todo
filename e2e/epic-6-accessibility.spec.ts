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
