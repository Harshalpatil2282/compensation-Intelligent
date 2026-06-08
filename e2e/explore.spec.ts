// e2e/explore.spec.ts
// Playwright E2E tests for the compensation explorer

import { test, expect } from '@playwright/test'

test.describe('Compensation Explorer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explore')
  })

  test('should load the explore page with heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Compensation Explorer' })).toBeVisible()
  })

  test('should show filter sidebar with level buttons', async ({ page }) => {
    await expect(page.getByRole('complementary', { name: 'Compensation filters' })).toBeVisible()
    await expect(page.getByRole('button', { name: /L4/ })).toBeVisible()
  })

  test('should filter by level when clicking a level button', async ({ page }) => {
    const l4Button = page.getByRole('button', { name: /^L4$/ })
    await l4Button.click()
    // URL should be updated with the level filter
    await expect(page).toHaveURL(/universalLevel=L4/)
  })

  test('should show data table columns', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table')
    // Check column headers
    const headers = page.locator('th')
    await expect(headers.filter({ hasText: 'Company' })).toBeVisible()
    await expect(headers.filter({ hasText: 'Total TC' })).toBeVisible()
  })
})

test.describe('Landing Page', () => {
  test('should render hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Market Value')
  })

  test('should navigate to explore from hero CTA', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Explore Compensation Data/ }).click()
    await expect(page).toHaveURL('/explore')
  })
})
