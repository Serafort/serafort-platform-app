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
    await page.locator('button[type="submit"]').click()
    await expect(page.getByText(/email|required/i).first()).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page
      .locator('input[name="email"], input[type="email"], #email')
      .first()
      .fill('nonexistent@example.com')
    await page
      .locator('input[name="password"], input[type="password"], #password')
      .first()
      .fill('WrongPassword123!')
    await page.locator('button[type="submit"]').click()

    // Wait for error message
    await expect(
      page.locator('text=/invalid|incorrect|not found|unauthorized/i').first(),
    ).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to forgot password', async ({ page }) => {
    await page.getByRole('link', { name: /forgot password/i }).click()
    await expect(page).toHaveURL(/forgot-password/)
  })

  test('should navigate to sign-up from sign-in', async ({ page }) => {
    await page.goto('/auth/sign-in')
    await page.getByRole('link', { name: /sign up/i }).click()
    await expect(page).toHaveURL(/sign-up/)
  })

  test('should successfully sign in with valid credentials', async ({ page }) => {
    const email = AUTH_USER.email
    const password = AUTH_USER.password

    await page.goto('/auth/sign-in')

    await page.locator('input[name="email"], input[type="email"], #email').first().fill(email)
    await page
      .locator('input[name="password"], input[type="password"], #password')
      .first()
      .fill(password)
    await page.locator('button[type="submit"]').click()

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
        firstname: 'SignOut',
        lastname: 'Test',
      },
    })

    // Sign in
    await page.goto('/auth/sign-in')
    await page.locator('input[name="email"], input[type="email"], #email').first().fill(email)
    await page
      .locator('input[name="password"], input[type="password"], #password')
      .first()
      .fill(password)
    await page.locator('button[type="submit"]').click()

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
