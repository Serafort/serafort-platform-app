import React from 'react'
import type { CAPModule } from '@cap/shared-types'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined'
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined'
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined'
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import { authRouteConfig, authRoutes } from './routes/routes'

import Path from './routes/path'
export { authRouteConfig, authRoutes, Path, Path as AuthPath }
export { createAdminRoute, createAuthRoute } from './routes/routeHelpers'
import { authRegistry } from './registry/AuthRegistry'
import { registerDictionary, getMergedDictionary } from '@cap/platform-core'

import enAuthCore from './modules/authentication-core/src/data/dictionaries/en.json'
import arAuthCore from './modules/authentication-core/src/data/dictionaries/ar.json'
import frAuthCore from './modules/authentication-core/src/data/dictionaries/fr.json'
import enMfa from './modules/mfa-orchestrator/src/data/dictionaries/en.json'
import arMfa from './modules/mfa-orchestrator/src/data/dictionaries/ar.json'
import frMfa from './modules/mfa-orchestrator/src/data/dictionaries/fr.json'
import enPasswordless from './modules/passwordless-service/src/data/dictionaries/en.json'
import arPasswordless from './modules/passwordless-service/src/data/dictionaries/ar.json'
import frPasswordless from './modules/passwordless-service/src/data/dictionaries/fr.json'
import enAuthEngine from './modules/authorization-engine/src/data/dictionaries/en.json'
import arAuthEngine from './modules/authorization-engine/src/data/dictionaries/ar.json'
import frAuthEngine from './modules/authorization-engine/src/data/dictionaries/fr.json'
import enUserDir from './modules/user-directory/src/data/dictionaries/en.json'
import arUserDir from './modules/user-directory/src/data/dictionaries/ar.json'
import frUserDir from './modules/user-directory/src/data/dictionaries/fr.json'
import enIdentityBroker from './modules/identity-broker/src/data/dictionaries/en.json'
import arIdentityBroker from './modules/identity-broker/src/data/dictionaries/ar.json'
import frIdentityBroker from './modules/identity-broker/src/data/dictionaries/fr.json'
import enData from './data/dictionaries/en.json'
import arData from './data/dictionaries/ar.json'
import frData from './data/dictionaries/fr.json'

registerDictionary({ en: enData, ar: arData, fr: frData })
registerDictionary({ en: enAuthCore, ar: arAuthCore, fr: frAuthCore })
registerDictionary({ en: enMfa, ar: arMfa, fr: frMfa })
registerDictionary({ en: enPasswordless, ar: arPasswordless, fr: frPasswordless })
registerDictionary({ en: enAuthEngine, ar: arAuthEngine, fr: frAuthEngine })
registerDictionary({ en: enUserDir, ar: arUserDir, fr: frUserDir })
registerDictionary({ en: enIdentityBroker, ar: arIdentityBroker, fr: frIdentityBroker })

const en = getMergedDictionary('en')
const ar = getMergedDictionary('ar')
const fr = getMergedDictionary('fr')

export * from './registry/AuthRegistry'
export * from './plugins/MFATOTPPlugin'
import { MFATOTPPlugin } from './plugins/MFATOTPPlugin'

// Core Exports (Prioritized)
export * from './modules/authentication-core/types/api.types'
export * from './modules/authentication-core/types/auth.types'
export * from './modules/authentication-core/utils/schema'
export * from './modules/authentication-core'

// Sub-module selective exports to avoid collisions
export * from './modules/session-manager'
export {
  useWebhooks,
  useWebhook,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useRoles,
  useRoleStats,
  useRolePermissions,
  useRole,
  useUpdateRole,
  useClientBranding,
  useUpdateClientBranding,
  useUpdateUserStatus,
  useSSFConfig,
  useUpdateSSFConfig,
  useTestSSFStream,
  useBroadcastSSFEvent,
  useSSFHistory,
  useSAMLConfig,
  useUpdateSAMLConfig,
  useSAMLMetadata,
  useFetchRemoteMetadata,
  useRemoteMetadata,
  useRecentSAMLEntities,
  useJWKSKeys,
  useRotateJWKSKeys,
  useDeleteJWKSKey,
  useCreateJWKSKey,
  useGetJWKSKeyDetail,
  useCheckDomain,
  RoleIndicator,
  AuthorizationEnginePath,
  AdminRoute,
  adminService
} from './modules/authorization-engine'
export type { CreateJWKSKeyRequest, DeveloperApiKey } from './modules/authorization-engine'

// Re-export types from domain-kernel for cross-package use
export type { SAMLConfig, JWKSKey, JWKSKeyDetail, SSFConfig } from './domain-kernel/src/types'
export { AuthRoute, GuestRoute } from './modules/authentication-core'
export * from './modules/mfa-orchestrator'
export * from './modules/identity-broker'
export * from './modules/passwordless-service'
export * from './modules/developer-console'
export { PlatformClusterPath, apiExplorerService } from './modules/platform-cluster'
export type { SandboxExecutionResult, OpenAPISpec, OpenAPIPathItem } from './modules/platform-cluster'
export type { AccessPolicy, AccessPolicyRule } from '@cap/shared-types'
export type { AuthAccessPolicy } from './domain-kernel/src/types/authorization'

// User Directory - Export everything EXCEPT the ones that collide with authentication-core
export {
  useProfiles,
  useProfileById,
  useProfileActiveStatus,
  useUploadProfile,
  useSetActiveProfile,
  useUpdateResumeProfile,
  useDeleteProfile,
  useUserPreferences,
  useUpdatePreferences,
  useSecurityStatus,
  useActivityTimeline,
  useLinkedAccounts,
  useUserTokens,
  useChangeEmail,
  useChangePassword,
} from './modules/user-directory'

export { useSessionGuard } from './modules/session-manager/middlewares/useSessionGuard'


// Note: Admin screens moved to @cap/module-admin and are now exported from there to avoid circular dependencies.


// Path registry is exported at the top of the file

export { idaasFacade } from './idaas-facade/src'
export type { IIdaasFacade } from './idaas-facade/src'

// Path is defined at the top

export const AuthModule: CAPModule = {
  id: 'auth-module',
  version: '1.0.0',
  routes: authRouteConfig as any,
  i18n: { en, ar, fr },
  plugins: [],
  navItems: [
    // --- IDENTITY & DIRECTORY SECTION ---
    {
      id: 'auth-identity-section',
      label: 'navigation.accountSettings',
      section: 'Identity & Directory',
      variant: ['vertical', 'horizontal'],
      order: 20,
    },
    {
      id: 'auth-user-profile',
      label: 'navigation.userProfile',
      icon: React.createElement(PersonOutlinedIcon),
      path: Path.account.overview,
      variant: ['vertical', 'horizontal'],
      order: 21,
    },
    {
      id: 'auth-linked-accounts',
      label: 'navigation.linkedAccounts',
      icon: React.createElement(LinkOutlinedIcon),
      path: Path.user.linkedAccounts,
      variant: ['vertical', 'horizontal'],
      order: 22,
    },
    {
      id: 'auth-admin-users',
      label: 'navigation.users',
      icon: React.createElement(PeopleOutlinedIcon),
      path: Path.admin.users,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 25,
    },

    // --- ACCESS & GOVERNANCE SECTION ---
    {
      id: 'auth-governance-section',
      label: 'navigation.security',
      section: 'Access & Governance',
      variant: ['vertical', 'horizontal'],
      order: 40,
    },
    {
      id: 'auth-policy-canvas',
      label: 'Visual Policy Canvas',
      icon: React.createElement(AccountTreeOutlinedIcon),
      path: Path.admin.policyCanvas,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 41,
    },
    {
      id: 'auth-admin-roles',
      label: 'navigation.rolesPermissions',
      icon: React.createElement(ShieldOutlinedIcon),
      path: Path.admin.roles,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 42,
    },
    {
      id: 'auth-api-tokens',
      label: 'navigation.apiTokens',
      icon: React.createElement(VpnKeyOutlinedIcon),
      path: Path.apiTokens.dashboard,
      variant: ['vertical', 'horizontal'],
      order: 45,
    },

    // --- SECURITY & SESSIONS SECTION ---
    {
      id: 'auth-security-section',
      label: 'navigation.security',
      section: 'Security & Devices',
      variant: ['vertical', 'horizontal'],
      order: 60,
    },
    {
      id: 'auth-mfa',
      label: 'navigation.twoSteps',
      icon: React.createElement(SecurityOutlinedIcon),
      path: Path.mfa.dashboard,
      variant: ['vertical', 'horizontal'],
      order: 61,
    },
    {
      id: 'auth-passkeys',
      label: 'navigation.passkeys',
      icon: React.createElement(VpnKeyOutlinedIcon),
      path: Path.passkey.management,
      variant: ['vertical', 'horizontal'],
      order: 62,
    },
    {
      id: 'auth-sessions',
      label: 'navigation.activeSessions',
      icon: React.createElement(DevicesOutlinedIcon),
      path: Path.account.activeSessions,
      variant: ['vertical', 'horizontal'],
      order: 63,
    },

    // --- SYSTEM & DEVELOPER SECTION ---
    {
      id: 'auth-system-section',
      label: 'navigation.appsPages',
      section: 'System & Platform',
      variant: ['vertical', 'horizontal'],
      order: 90,
    },
    {
      id: 'auth-modules',
      label: 'navigation.moduleManagement',
      icon: React.createElement(ExtensionOutlinedIcon),
      path: '/developer/modules',
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 95,
    },

    // --- AUTHENTICATION PAGES (GUEST-ONLY) ---
    {
      id: 'auth-signin',
      label: 'navigation.login',
      path: Path.auth.signin,
      guestOnly: true,
      variant: ['vertical', 'horizontal'],
      order: 110,
    },
    {
      id: 'auth-signup',
      label: 'navigation.register',
      path: Path.auth.signup,
      guestOnly: true,
      variant: ['vertical', 'horizontal'],
      order: 120,
    },
    {
      id: 'auth-forgot',
      label: 'navigation.forgotPassword',
      path: Path.auth.forgotPassword,
      guestOnly: true,
      variant: ['vertical', 'horizontal'],
      order: 130,
    },
  ],
  searchItems: [
    {
      id: 'auth-profile',
      name: 'navigation.userProfile',
      url: Path.account.overview,
      icon: React.createElement(PersonOutlinedIcon),
      section: 'navigation.accountOverview',
    },
    {
      id: 'auth-policy-canvas-search',
      name: 'Visual Policy & ABAC Canvas',
      url: '/admin/policies/canvas',
      icon: React.createElement(AccountTreeOutlinedIcon),
      section: 'navigation.security',
    },
    {
      id: 'auth-security',
      name: 'navigation.securitySettings',
      url: Path.account.security,
      icon: React.createElement(SecurityOutlinedIcon),
      section: 'navigation.accountOverview',
    },

    {
      id: 'auth-api-tokens',
      name: 'navigation.apiTokens',
      url: Path.apiTokens.dashboard,
      icon: React.createElement(VpnKeyOutlinedIcon),
      section: 'navigation.security',
    },
    {
      id: 'auth-sessions',
      name: 'navigation.activeSessions',
      url: Path.account.activeSessions,
      icon: React.createElement(DevicesOutlinedIcon),
      section: 'navigation.security',
    },
    {
      id: 'auth-linked-accounts',
      name: 'navigation.linkedAccounts',
      url: Path.user.linkedAccounts,
      icon: React.createElement(LinkOutlinedIcon),
      section: 'navigation.accountOverview',
    },
  ],
}

export const initAuthPlugins = (plugins: any[]) => {
  plugins.forEach((plugin) => authRegistry.register(plugin))
}

// Auto-initialize plugins for this module
initAuthPlugins([MFATOTPPlugin])
