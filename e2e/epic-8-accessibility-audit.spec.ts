import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { deleteAllTasks, seedTask } from './helpers'

test.describe('Epic 8: Accessibility Audit (WCAG 2.1 AA)', () => {
  test.beforeEach(async () => {
    await deleteAllTasks()
  })

  test('has no critical WCAG AA violations on empty state', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText("Nothing here yet. What's on your mind?")).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const criticalViolations = results.violations.filter(v => v.impact === 'critical')
    expect(
      criticalViolations,
      `Critical violations found:\n${criticalViolations.map(v => `- ${v.id}: ${v.description}`).join('\n')}`
    ).toEqual([])
  })

  test('has no critical WCAG AA violations with tasks loaded', async ({ page }) => {
    await seedTask('First task')
    await seedTask('Completed task', true)
    await page.goto('/')
    await expect(page.getByText('First task')).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const criticalViolations = results.violations.filter(v => v.impact === 'critical')
    expect(
      criticalViolations,
      `Critical violations found:\n${criticalViolations.map(v => `- ${v.id}: ${v.description}`).join('\n')}`
    ).toEqual([])
  })
})
