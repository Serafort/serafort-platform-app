import { test as setup, expect } from '@playwright/test'
import { API_BASE_URL, AUTH_USER } from './test-config'

/**
 * Global setup - create test user if needed
 */
setup('authenticate', async ({ page, request }) => {
  // 1. Ensure user exists (API is faster for this)
  await request
    .post(`${API_BASE_URL}/auth/register`, {
      data: {
        email: AUTH_USER.email,
        password: AUTH_USER.password,
        firstName: 'E2E',
        lastName: 'Tester',
      },
    })
    .catch(() => {})

  // 2. Browser login to capture localStorage/encryption correctly
  await page.goto('/auth/sign-in')

  // Step 1: Email
  await page.getByLabel(/email/i).fill(AUTH_USER.email)
  await page.getByRole('button', { name: /next/i }).click()

  // Step 2: Password
  await page.getByLabel(/password/i).fill(AUTH_USER.password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()

  // 3. Wait for post-login redirect (indicates storage is populated)
  await expect(page).toHaveURL(/\/|dashboard/, { timeout: 15000 })

  // 4. Save storage state
  await page.context().storageState({ path: 'playwright/.auth/user.json' })
})
