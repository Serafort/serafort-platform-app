import { describe, it, expect } from 'vitest'
import { isTenantConfig, isTenantTheme, isTenantLayout } from './tenant.types'

describe('Tenant Type Guards', () => {
  describe('isTenantConfig', () => {
    it('should return true for valid tenant config', () => {
      const validConfig = {
        _version: 2,
        id: 'tenant-1',
        slug: 'tenant-slug',
        domain: 'example.com',
        name: 'Test Tenant',
        theme: {
          mode: 'light',
          skin: 'default',
          semiDark: false,
          primaryColor: '#1976d2',
          secondaryColor: '#ffb300',
          tokens: {
            colors: {},
            spacing: {},
            borderRadius: {},
            typography: {},
            shadows: {},
          },
        },
        layout: {
          layout: 'vertical',
          layoutPadding: 16,
          compactContentWidth: 1200,
          navbar: {
            type: 'fixed',
            contentWidth: 'compact',
            floating: false,
            detached: false,
            blur: false,
          },
          footer: {
            type: 'fixed',
            contentWidth: 'compact',
            detached: false,
          },
          contentWidth: 'compact',
          disableRipple: false,
          toastPosition: 'top-right',
        },
        branding: {
          logo: 'logo.png',
          favicon: 'favicon.ico',
          appName: 'Test App',
          companyName: 'Test Company',
        },
        features: {
          darkMode: true,
          rtl: false,
          notifications: true,
          chat: false,
        },
      }

      expect(isTenantConfig(validConfig)).toBe(true)
    })

    it('should return false for null', () => {
      expect(isTenantConfig(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isTenantConfig(undefined)).toBe(false)
    })

    it('should return false for non-object values', () => {
      expect(isTenantConfig('string')).toBe(false)
      expect(isTenantConfig(123)).toBe(false)
      expect(isTenantConfig([])).toBe(false)
    })

    it('should return false when missing required fields', () => {
      const incompleteConfig = {
        id: 'tenant-1',
        slug: 'tenant-slug',
      }

      expect(isTenantConfig(incompleteConfig)).toBe(false)
    })

    it('should return false when theme is not an object', () => {
      const invalidConfig = {
        id: 'tenant-1',
        slug: 'tenant-slug',
        domain: 'example.com',
        name: 'Test Tenant',
        theme: 'not an object',
        layout: {},
        branding: {},
        features: {},
      }

      expect(isTenantConfig(invalidConfig)).toBe(false)
    })

    it('should return false when layout is not an object', () => {
      const invalidConfig = {
        id: 'tenant-1',
        slug: 'tenant-slug',
        domain: 'example.com',
        name: 'Test Tenant',
        theme: {},
        layout: 'not an object',
        branding: {},
        features: {},
      }

      expect(isTenantConfig(invalidConfig)).toBe(false)
    })

    it('should return false when branding is not an object', () => {
      const invalidConfig = {
        id: 'tenant-1',
        slug: 'tenant-slug',
        domain: 'example.com',
        name: 'Test Tenant',
        theme: {},
        layout: {},
        branding: 123,
        features: {},
      }

      expect(isTenantConfig(invalidConfig)).toBe(false)
    })

    it('should return false when features is not an object', () => {
      const invalidConfig = {
        id: 'tenant-1',
        slug: 'tenant-slug',
        domain: 'example.com',
        name: 'Test Tenant',
        theme: {},
        layout: {},
        branding: {},
        features: null,
      }

      expect(isTenantConfig(invalidConfig)).toBe(false)
    })

    it('should return true for features as empty object', () => {
      const configWithEmptyFeatures = {
        id: 'tenant-1',
        slug: 'tenant-slug',
        domain: 'example.com',
        name: 'Test Tenant',
        theme: { mode: 'light', skin: 'default', semiDark: false, primaryColor: '#000', secondaryColor: '#fff', tokens: {} },
        layout: { layout: 'vertical', layoutPadding: 0, compactContentWidth: 0, navbar: { type: 'fixed', contentWidth: 'compact', floating: false, detached: false, blur: false }, footer: { type: 'fixed', contentWidth: 'compact', detached: false }, contentWidth: 'compact', disableRipple: false, toastPosition: 'top-right' },
        branding: { appName: 'App', companyName: 'Company' },
        features: {},
      }

      expect(isTenantConfig(configWithEmptyFeatures)).toBe(true)
    })

    it('should return true even with extra properties', () => {
      const configWithExtra = {
        id: 'tenant-1',
        slug: 'tenant-slug',
        domain: 'example.com',
        name: 'Test Tenant',
        theme: { mode: 'light', skin: 'default', semiDark: false, primaryColor: '#000', secondaryColor: '#fff', tokens: {} },
        layout: { layout: 'vertical', layoutPadding: 0, compactContentWidth: 0, navbar: { type: 'fixed', contentWidth: 'compact', floating: false, detached: false, blur: false }, footer: { type: 'fixed', contentWidth: 'compact', detached: false }, contentWidth: 'compact', disableRipple: false, toastPosition: 'top-right' },
        branding: { appName: 'App', companyName: 'Company' },
        features: { darkMode: false, rtl: false, notifications: false, chat: false },
        extraProperty: 'should be ignored',
      }

      expect(isTenantConfig(configWithExtra)).toBe(true)
    })
  })

  describe('isTenantTheme', () => {
    it('should return true for valid tenant theme', () => {
      const validTheme = {
        mode: 'light',
        skin: 'default',
        semiDark: false,
        primaryColor: '#1976d2',
        secondaryColor: '#ffb300',
        tokens: {},
      }

      expect(isTenantTheme(validTheme)).toBe(true)
    })

    it('should return true for dark mode theme', () => {
      const validTheme = {
        mode: 'dark',
        skin: 'bordered',
        semiDark: true,
        primaryColor: '#1976d2',
        secondaryColor: '#ffb300',
        tokens: {},
      }

      expect(isTenantTheme(validTheme)).toBe(true)
    })

    it('should return true for system mode theme', () => {
      const validTheme = {
        mode: 'system',
        skin: 'default',
        semiDark: false,
        primaryColor: '#1976d2',
        secondaryColor: '#ffb300',
        tokens: {},
      }

      expect(isTenantTheme(validTheme)).toBe(true)
    })

    it('should return false for null', () => {
      expect(isTenantTheme(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isTenantTheme(undefined)).toBe(false)
    })

    it('should return false for non-object values', () => {
      expect(isTenantTheme('string')).toBe(false)
      expect(isTenantTheme(123)).toBe(false)
    })

    it('should return false for empty object', () => {
      expect(isTenantTheme({})).toBe(false)
    })

    it('should return false when mode is invalid', () => {
      const invalidTheme = {
        mode: 'invalid',
        primaryColor: '#1976d2',
        secondaryColor: '#ffb300',
      }

      expect(isTenantTheme(invalidTheme)).toBe(false)
    })

    it('should return false when primaryColor is missing', () => {
      const invalidTheme = {
        mode: 'light',
        secondaryColor: '#ffb300',
      }

      expect(isTenantTheme(invalidTheme)).toBe(false)
    })

    it('should return false when secondaryColor is missing', () => {
      const invalidTheme = {
        mode: 'light',
        primaryColor: '#1976d2',
      }

      expect(isTenantTheme(invalidTheme)).toBe(false)
    })

    it('should return false when primaryColor is not a string', () => {
      const invalidTheme = {
        mode: 'light',
        primaryColor: 123,
        secondaryColor: '#ffb300',
      }

      expect(isTenantTheme(invalidTheme)).toBe(false)
    })

    it('should return true even with extra properties', () => {
      const themeWithExtra = {
        mode: 'light',
        primaryColor: '#1976d2',
        secondaryColor: '#ffb300',
        extraProperty: 'should be ignored',
      }

      expect(isTenantTheme(themeWithExtra)).toBe(true)
    })
  })

  describe('isTenantLayout', () => {
    it('should return true for valid tenant layout with vertical layout', () => {
      const validLayout = {
        layout: 'vertical',
        layoutPadding: 16,
        compactContentWidth: 1200,
        navbar: {
          type: 'fixed',
          contentWidth: 'compact',
          floating: false,
          detached: false,
          blur: false,
        },
        footer: {
          type: 'fixed',
          contentWidth: 'compact',
          detached: false,
        },
        contentWidth: 'compact',
        disableRipple: false,
        toastPosition: 'top-right',
      }

      expect(isTenantLayout(validLayout)).toBe(true)
    })

    it('should return true for horizontal layout', () => {
      const validLayout = {
        layout: 'horizontal',
        layoutPadding: 16,
        compactContentWidth: 1200,
        navbar: {
          type: 'fixed',
          contentWidth: 'compact',
          floating: false,
          detached: false,
          blur: false,
        },
        footer: {
          type: 'fixed',
          contentWidth: 'compact',
          detached: false,
        },
        contentWidth: 'compact',
        disableRipple: false,
        toastPosition: 'top-right',
      }

      expect(isTenantLayout(validLayout)).toBe(true)
    })

    it('should return true for collapsed layout', () => {
      const validLayout = {
        layout: 'collapsed',
        layoutPadding: 16,
        compactContentWidth: 1200,
        navbar: {
          type: 'fixed',
          contentWidth: 'compact',
          floating: false,
          detached: false,
          blur: false,
        },
        footer: {
          type: 'fixed',
          contentWidth: 'compact',
          detached: false,
        },
        contentWidth: 'compact',
        disableRipple: false,
        toastPosition: 'top-right',
      }

      expect(isTenantLayout(validLayout)).toBe(true)
    })

    it('should return false for null', () => {
      expect(isTenantLayout(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isTenantLayout(undefined)).toBe(false)
    })

    it('should return false for non-object values', () => {
      expect(isTenantLayout('string')).toBe(false)
      expect(isTenantLayout(123)).toBe(false)
    })

    it('should return false for empty object', () => {
      expect(isTenantLayout({})).toBe(false)
    })

    it('should return false when layout type is invalid', () => {
      const invalidLayout = {
        layout: 'invalid',
        navbar: {},
        footer: {},
      }

      expect(isTenantLayout(invalidLayout)).toBe(false)
    })

    it('should return false when navbar is missing', () => {
      const invalidLayout = {
        layout: 'vertical',
        footer: {},
      }

      expect(isTenantLayout(invalidLayout)).toBe(false)
    })

    it('should return false when footer is missing', () => {
      const invalidLayout = {
        layout: 'vertical',
        navbar: {},
      }

      expect(isTenantLayout(invalidLayout)).toBe(false)
    })

    it('should return false when navbar is not an object', () => {
      const invalidLayout = {
        layout: 'vertical',
        navbar: 'not an object',
        footer: {},
      }

      expect(isTenantLayout(invalidLayout)).toBe(false)
    })

    it('should return false when footer is not an object', () => {
      const invalidLayout = {
        layout: 'vertical',
        navbar: {},
        footer: 123,
      }

      expect(isTenantLayout(invalidLayout)).toBe(false)
    })

    it('should return true even with extra properties', () => {
      const layoutWithExtra = {
        layout: 'vertical',
        navbar: { type: 'fixed', contentWidth: 'compact', floating: false, detached: false, blur: false },
        footer: { type: 'fixed', contentWidth: 'compact', detached: false },
        extraProperty: 'should be ignored',
      }

      expect(isTenantLayout(layoutWithExtra)).toBe(true)
    })
  })

  describe('type guard usage patterns', () => {
    it('should work with type narrowing in conditional', () => {
      const maybeConfig: unknown = {
        id: 'tenant-1',
        slug: 'tenant-slug',
        domain: 'example.com',
        name: 'Test Tenant',
        theme: { mode: 'light', skin: 'default', semiDark: false, primaryColor: '#000', secondaryColor: '#fff', tokens: {} },
        layout: { layout: 'vertical', layoutPadding: 0, compactContentWidth: 0, navbar: { type: 'fixed', contentWidth: 'compact', floating: false, detached: false, blur: false }, footer: { type: 'fixed', contentWidth: 'compact', detached: false }, contentWidth: 'compact', disableRipple: false, toastPosition: 'top-right' },
        branding: { appName: 'App', companyName: 'Company' },
        features: { darkMode: false, rtl: false, notifications: false, chat: false },
      }

      if (isTenantConfig(maybeConfig)) {
        expect(maybeConfig.id).toBe('tenant-1')
        expect(maybeConfig.name).toBe('Test Tenant')
      }
    })

    it('should work with ternary operator', () => {
      const value: unknown = { id: 'test' }

      const result = isTenantConfig(value) ? 'is config' : 'not config'
      expect(result).toBe('not config')
    })

    it('should work with logical AND for early return', () => {
      const value: unknown = {
        id: 'tenant-1',
        slug: 'tenant-slug',
        domain: 'example.com',
        name: 'Test Tenant',
        theme: { mode: 'light', skin: 'default', semiDark: false, primaryColor: '#000', secondaryColor: '#fff', tokens: {} },
        layout: { layout: 'vertical', layoutPadding: 0, compactContentWidth: 0, navbar: { type: 'fixed', contentWidth: 'compact', floating: false, detached: false, blur: false }, footer: { type: 'fixed', contentWidth: 'compact', detached: false }, contentWidth: 'compact', disableRipple: false, toastPosition: 'top-right' },
        branding: { appName: 'App', companyName: 'Company' },
        features: { darkMode: false, rtl: false, notifications: false, chat: false },
      }

      let processed = false
      if (isTenantConfig(value)) {
        processed = true
      }
      expect(processed).toBe(true)
    })
  })
})
