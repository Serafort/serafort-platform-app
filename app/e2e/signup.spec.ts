import { test, expect } from '@playwright/test'
import { API_BASE_URL, TEST_USER, generateTestEmail } from './test-config'

test.describe('Sign Up Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-up')
  })

  test('should display sign-up page', async ({ page }) => {
    await expect(page).toHaveURL(/.*sign-up/)
    await expect(page.locator('form')).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth/sign-up')
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page.getByText(/required/i).first()).toBeVisible()
  })

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/auth/sign-up')
    await page.getByLabel(/email/i).fill('invalid-email')
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page.getByText(/required/i).first()).toBeVisible()
  })

  test('should show error for weak password', async ({ page }) => {
    await page.goto('/auth/sign-up')
    await page.getByLabel(/email/i).fill(generateTestEmail())
    await page
      .getByLabel(/password/i)
      .first()
      .fill('123')
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page.getByText(/8 characters/i)).toBeVisible()
  })

  test('should successfully register new user', async ({ page }) => {
    const uniqueEmail = generateTestEmail('signup')
    const password = 'Password123!'

    await page.goto('/auth/sign-up')

    // Fill in registration form
    await page.getByLabel(/full name/i).fill(`${TEST_USER.firstName} ${TEST_USER.lastName}`)
    await page.getByLabel(/email/i).fill(uniqueEmail)
    await page
      .getByLabel(/password/i)
      .first()
      .fill(password)
    await page.getByLabel(/confirm password/i).fill(password)

    // Check terms
    await page.getByRole('checkbox').first().check()

    await page.getByRole('button', { name: /create account/i }).click()

    // Successful registration should show success link/text or redirect
    await expect(page.getByText(/verification.*sent/i)).toBeVisible({ timeout: 15000 })
  })

  test('should navigate to sign-in from sign-up', async ({ page }) => {
    await page.goto('/auth/sign-up')
    await page.getByRole('link', { name: 'Sign in', exact: true }).click()
    await expect(page).toHaveURL(/sign-in/)
  })
})

test.describe('Sign Up V1 Page', () => {
  test('should load sign-up-v1 variant', async ({ page }) => {
    await page.goto('/auth/sign-up-v1')
    await expect(page).toHaveURL(/sign-up-v1/)
    await expect(page.locator('form')).toBeVisible()
  })
})

test.describe('Sign Up V2 Page', () => {
  test('should load sign-up-v2 variant', async ({ page }) => {
    await page.goto('/auth/sign-up-v2')
    await expect(page).toHaveURL(/sign-up-v2/)
    await expect(page.locator('form')).toBeVisible()
  })
})

test.describe('Sign Up V3 Page', () => {
  test('should load sign-up-v3 variant', async ({ page }) => {
    await page.goto('/auth/sign-up-v3')
    await expect(page).toHaveURL(/sign-up-v3/)
    await expect(page.locator('form')).toBeVisible()
  })
})

test.describe('API: Registration Endpoint', () => {
  test('POST /api/auth/register - should return error for duplicate email', async ({ request }) => {
    // First registration
    const email = `duplicate-${Date.now()}@example.com`
    await request.post(`${API_BASE_URL}/auth/register`, {
      data: {
        email,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
      },
    })

    // Second registration with same email
    const response = await request.post(`${API_BASE_URL}/auth/register`, {
      data: {
        email,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
      },
    })

    expect(response.status()).toBe(422) // or 400
  })

  test('POST /api/auth/register - should return error for missing fields', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/auth/register`, {
      data: {
        email: 'test@example.com',
        // Missing password
      },
    })

    expect(response.ok()).toBeFalsy()
  })
})
