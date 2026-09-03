import { describe, it, expect, beforeEach } from 'vitest'
import TenantService from '../tenantService'
import secureTokenManager from '../../../../platform-store/src/services/secureTokenManager'

describe('Tenant Auth Gating & Security Tests', () => {
  beforeEach(() => {
    TenantService.clearCache()
    secureTokenManager.clearTokens()
  })

  describe('TenantService.verifyTenantAuthFeature', () => {
    it('should verify enabled plugins for tenant1 (Acme Corp)', () => {
      const isMfaEnabled = TenantService.verifyTenantAuthFeature('tenant1.localhost', 'mfa-totp')
      expect(isMfaEnabled).toBe(true)
    })

    it('should return false for disabled plugins on tenant2 (TechStart Inc)', () => {
      const isMfaEnabled = TenantService.verifyTenantAuthFeature('tenant2.localhost', 'mfa-totp')
      expect(isMfaEnabled).toBe(false)
    })

    it('should return false for unknown plugin IDs', () => {
      const isUnknownEnabled = TenantService.verifyTenantAuthFeature('tenant1.localhost', 'non-existent-plugin')
      expect(isUnknownEnabled).toBe(false)
    })

    it('should correctly evaluate custom TenantConfig via isAuthPluginEnabledForTenant', () => {
      const customConfig = {
        _version: 1 as const,
        id: 'test-tenant',
        slug: 'test-tenant',
        domain: 'test.local',
        name: 'Test Tenant',
        theme: {} as any,
        layout: {} as any,
        branding: {} as any,
        features: { darkMode: true, rtl: false, notifications: true, chat: true, enabledAuthPlugins: ['custom-mfa', 'saml-sso'] },
        version: 1,
      }

      expect(TenantService.isAuthPluginEnabledForTenant(customConfig, 'custom-mfa')).toBe(true)
      expect(TenantService.isAuthPluginEnabledForTenant(customConfig, 'saml-sso')).toBe(true)
      expect(TenantService.isAuthPluginEnabledForTenant(customConfig, 'mfa-totp')).toBe(false)
    })

    it('should return false when tenant configuration has no features or enabledAuthPlugins', () => {
      expect(TenantService.isAuthPluginEnabledForTenant(null, 'mfa-totp')).toBe(false)
      expect(TenantService.isAuthPluginEnabledForTenant({} as any, 'mfa-totp')).toBe(false)
    })
  })

  describe('SecureTokenManager HttpOnly Cookie Compliance', () => {
    it('should store access token in memory and omit refresh token', async () => {
      await secureTokenManager.setTokens({
        accessToken: 'mock-access-token-123',
        expiresAt: Date.now() + 3600000,
      })

      const tokens = secureTokenManager.getTokens()
      expect(tokens).not.toBeNull()
      expect(tokens?.accessToken).toBe('mock-access-token-123')
      expect(tokens?.refreshToken).toBeUndefined()
    })
  })
})
