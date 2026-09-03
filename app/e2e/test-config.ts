/**
 * Shared configuration and utilities for E2E auth tests
 */

// API base URL for backend requests
export const API_BASE_URL = 'http://localhost:3333/api'

// Test user credentials for fresh registrations
export const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
}

// Authenticated user for tests requiring login
export const AUTH_USER = {
  email: 'e2e-test@example.com',
  password: 'E2ETestPassword123!',
}

// Storage state file for authenticated sessions
export const AUTH_FILE = 'playwright/.auth/user.json'

/**
 * Generate a unique email for testing
 */
export function generateTestEmail(prefix = 'test'): string {
  return `${prefix}-${Date.now()}@example.com`
}
