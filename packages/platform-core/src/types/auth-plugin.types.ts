import { ComponentType } from 'react';
import type { Dictionary } from '@cap/shared-types';

/**
 * Interface for Identity Extensions (MFA, Passwordless, etc.)
 */
export interface IAuthPlugin {
  /** Unique identifier for the plugin (e.g., 'mfa-totp') */
  id: string

  /** Human-readable name (localized key) */
  name: string

  /** Classification of the auth method */
  type: 'primary' | 'secondary' | 'recovery' | 'biometric'

  /** Plugin-specific components for UI injection */
  ui?: {
    /**
     * Small component to show in the login options list.
     * e.g., "Sign in with SMS" button or icon.
     */
    loginOption?: ComponentType<{ onClick: () => void; disabled?: boolean }>

    /**
     * Main challenge component (e.g., OTP code entry screen).
     */
    verificationView?: ComponentType<{
      challenge: any
      onVerify: (data: any) => Promise<void>
      onCancel: () => void
      isLoading?: boolean
      error?: string | null
    }>

    /**
     * Settings component for enabling/configuring the method.
     */
    setupView?: ComponentType<{
      onSuccess: () => void
      onCancel: () => void
    }>
  }

  /**
   * Logic for handling server challenges.
   * Returns metadata for UI or verification protocol specific data.
   */
  handleChallenge: (challengeData: Dictionary) => Promise<Dictionary>

  /**
   * Hook for plugin-specific state or side effects during the auth flow.
   */
  onInit?: (context: any) => void
}

/**
 * Registry interface for managing active auth plugins.
 */
export interface IAuthRegistry {
  register: (plugin: IAuthPlugin) => void
  getPlugin: (id: string) => IAuthPlugin | undefined
  getPluginsByType: (type: IAuthPlugin['type']) => IAuthPlugin[]
  activePlugins: IAuthPlugin[]
}
