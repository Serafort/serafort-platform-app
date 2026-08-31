import { test as setup, expect } from '@playwright/test'
import { AUTH_USER } from './test-config'

/**
 * Global setup - create test user if needed
 */
setup('authenticate', async ({ page }) => {
  // Browser login to capture localStorage/encryption correctly
  await page.goto('/auth/sign-in')

  // Fill credentials directly on single-step form
  await page.locator('input[name="email"], input[type="email"], #email').first().fill(AUTH_USER.email)
  await page.locator('input[name="password"], input[type="password"], #password').first().fill(AUTH_USER.password)
  await page.locator('button[type="submit"]').click()

  // Wait for post-login redirect (indicates storage is populated)
  await expect(page).toHaveURL(/\/|dashboard|home/, { timeout: 15000 })

  // Save storage state
  await page.context().storageState({ path: 'playwright/.auth/user.json' })
})
