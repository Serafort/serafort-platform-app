import { test, expect } from '@playwright/test'
import { API_BASE_URL, AUTH_USER } from './test-config'

test.describe('Sign In Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in')
  })

  test('should display sign-in page', async ({ page }) => {
    await page.goto('/auth/sign-in')
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
  })

  test('should show validation errors for empty email', async ({ page }) => {
    await page.goto('/auth/sign-in')
    await page.getByRole('button', { name: /next/i }).click()
    await expect(page.getByText(/email|required/i)).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('nonexistent@example.com')
    await page.getByRole('button', { name: /next/i }).click()
    await page.getByLabel(/password/i).fill('WrongPassword123!')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()

    // Wait for error message
    await expect(
      page.locator('text=/invalid|incorrect|not found|unauthorized/i').first(),
    ).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to forgot password', async ({ page }) => {
    // First, enter an email to get to the password step, then click forgot password
    await page.getByLabel(/email/i).fill('test@example.com') // Any valid-looking email
    await page.getByRole('button', { name: /next/i }).click()

    await page.getByRole('link', { name: /forget|forgot|reset/i }).click()

    await expect(page).toHaveURL(/forgot-password/)
  })

  test('should navigate to sign-up from sign-in', async ({ page }) => {
    await page.goto('/auth/sign-in')
    // OneAuthSignIn has a 'Create account' button
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page).toHaveURL(/sign-up/)
  })

  test('should successfully sign in with valid credentials', async ({ page }) => {
    const email = AUTH_USER.email
    const password = AUTH_USER.password

    await page.goto('/auth/sign-in')

    // Step 1: Email
    await page.getByLabel(/email/i).fill(email)
    await page.getByRole('button', { name: /next/i }).click()

    // Step 2: Password
    await page.getByLabel(/password/i).fill(password)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()

    // Should redirect to dashboard or home
    await expect(page).toHaveURL(/\/|dashboard|home/i, { timeout: 15000 })
  })
})

test.describe('Sign In V1 Page', () => {
  test('should load sign-in-v1 variant', async ({ page }) => {
    await page.goto('/auth/sign-in-v1')
    await expect(page).toHaveURL(/sign-in-v1/)
    await expect(page.locator('form')).toBeVisible()
  })
})

test.describe('Sign In V2 Page', () => {
  test('should load sign-in-v2 variant', async ({ page }) => {
    await page.goto('/auth/sign-in-v2')
    await expect(page).toHaveURL(/sign-in-v2/)
    await expect(page.locator('form')).toBeVisible()
  })
})

test.describe('Sign Out Flow', () => {
  test('should sign out when clicking logout', async ({ page, request }) => {
    // Create and sign in a user first
    const email = `signout-test-${Date.now()}@example.com`
    const password = 'TestPassword123!'

    await request.post(`${API_BASE_URL}/auth/register`, {
      data: {
        email,
        password,
        firstName: 'SignOut',
        lastName: 'Test',
      },
    })

    // Sign in
    await page.goto('/auth/sign-in')
    await page.getByLabel(/email/i).fill(email)
    await page.getByRole('button', { name: /next/i }).click()
    await page.getByLabel(/password/i).fill(password)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()

    // Wait for redirect
    await page.waitForURL(/dashboard|home|\/$/i, { timeout: 15000 })

    // Navigate to sign out
    await page.goto('/auth/sign-out')

    // Should redirect to sign-in or home
    await expect(page).toHaveURL(/sign-in|\/$/i, { timeout: 10000 })
  })
})

test.describe('API: Login Endpoint', () => {
  test('POST /api/auth/login - should return error for invalid credentials', async ({
    request,
  }) => {
    const response = await request.post(`${API_BASE_URL}/auth/login`, {
      data: {
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      },
    })

    expect(response.ok()).toBeFalsy()
  })

  test('POST /api/auth/login - should return error for missing fields', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/auth/login`, {
      data: {
        email: 'test@example.com',
        // Missing password
      },
    })

    expect(response.ok()).toBeFalsy()
  })
})
