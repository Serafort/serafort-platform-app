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
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import HubOutlinedIcon from '@mui/icons-material/HubOutlined'
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined'
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PasswordOutlinedIcon from '@mui/icons-material/PasswordOutlined'
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import WebhookOutlinedIcon from '@mui/icons-material/WebhookOutlined'
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'

import { authRouteConfig, authRoutes } from './routes/routes'
import Path, {
  AuthCorePath,
  AuthorizationEnginePath,
  DeveloperConsolePath,
  IdentityBrokerPath,
  MfaOrchestratorPath,
  PasswordlessPath,
  PlatformClusterPath,
  SessionManagerPath,
  UserDirectoryPath,
} from './routes/path'

export {
  authRouteConfig,
  authRoutes,
  Path,
  Path as AuthPath,
  AuthCorePath,
  AuthorizationEnginePath,
  DeveloperConsolePath,
  IdentityBrokerPath,
  MfaOrchestratorPath,
  PasswordlessPath,
  PlatformClusterPath,
  SessionManagerPath,
  UserDirectoryPath,
}
export { createAdminRoute, createAuthRoute } from './routes/routeHelpers'
import { authRegistry } from './registry/AuthRegistry'
import { registerDictionary, getMergedDictionary } from '@cap/platform-core'

import enAuthCore from './modules/authentication-core/data/dictionaries/en.json'
import arAuthCore from './modules/authentication-core/data/dictionaries/ar.json'
import frAuthCore from './modules/authentication-core/data/dictionaries/fr.json'
import enMfa from './modules/mfa-orchestrator/data/dictionaries/en.json'
import arMfa from './modules/mfa-orchestrator/data/dictionaries/ar.json'
import frMfa from './modules/mfa-orchestrator/data/dictionaries/fr.json'
import enPasswordless from './modules/passwordless-service/data/dictionaries/en.json'
import arPasswordless from './modules/passwordless-service/data/dictionaries/ar.json'
import frPasswordless from './modules/passwordless-service/data/dictionaries/fr.json'
import enAuthEngine from './modules/authorization-engine/data/dictionaries/en.json'
import arAuthEngine from './modules/authorization-engine/data/dictionaries/ar.json'
import frAuthEngine from './modules/authorization-engine/data/dictionaries/fr.json'
import enUserDir from './modules/user-directory/data/dictionaries/en.json'
import arUserDir from './modules/user-directory/data/dictionaries/ar.json'
import frUserDir from './modules/user-directory/data/dictionaries/fr.json'
import enIdentityBroker from './modules/identity-broker/data/dictionaries/en.json'
import arIdentityBroker from './modules/identity-broker/data/dictionaries/ar.json'
import frIdentityBroker from './modules/identity-broker/data/dictionaries/fr.json'
import enSessionManager from './modules/session-manager/data/dictionaries/en.json'
import arSessionManager from './modules/session-manager/data/dictionaries/ar.json'
import frSessionManager from './modules/session-manager/data/dictionaries/fr.json'
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
registerDictionary({ en: enSessionManager, ar: arSessionManager, fr: frSessionManager })

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
export {
  ActiveSessions,
  ActiveSessionsManagement,
  UserActivityTimeline,
  AccountOverview,
  ChangePassword,
  DesactivateAccount,
  sessionService,
  SESSION_QUERY_KEYS,
  useChangePasswordMutation,
  useDeactivateAccountMutation,
  normalizeUserSession,
} from './modules/session-manager'
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
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useDuplicateRole,
  useSyncRolePermissions,
  useSyncRoleParents,
  usePermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
  useGrantPermission,
  useRevokePermission,
  useAccessPolicies,
  useSaveAccessPolicies,
  useSimulatePolicy,
  useCompilePolicy,
  useDecompilePolicy,
  useDefaultPolicySet,
  useEvaluatePolicy,
  useMemberOverrides,
  useAddMemberOverride,
  useRemoveMemberOverride,
  useDeveloperApiKeys,
  useCreateDeveloperApiKey,
  useRevokeDeveloperApiKey,
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
  AdminRoute,
  adminService,
  authorizationService,
  authorizationEngineRouteConfig,
} from './modules/authorization-engine'
export type { CreateJWKSKeyRequest, DeveloperApiKey } from './modules/authorization-engine'

// Re-export types from domain-kernel for cross-package use
export type { SAMLConfig, JWKSKey, JWKSKeyDetail, SSFConfig } from './domain-kernel/src/types'
export { AuthRoute, GuestRoute } from './modules/authentication-core'

// Platform Cluster Exports
export {
  AdminOverviewDashboard,
  AuthEventsMonitor,
  RealTimeAuthEventsMonitor,
  RealTimeAuthEventsMonitorV2,
  SystemHealthDashboard,
  SecurityHealthCheck,
  MFAUsageAnalytics,
  EmailTestingDashboard,
  EmailTemplatePreview,
  ExportAuditTrail,
  ApplicationDashboard,
  ApplicationDetailView,
  APIExplorerDashboard,
  ScopesRegistry,
  WebhookManagement,
  ModuleManagementDashboard,
  CsrfErrorScreen,
  MaintenanceScreen,
  Page401Unauthorized,
  Page403Forbidden,
  Page429TooManyRequests,
  BrowserNotSupported,
  adminMonitoringService,
  developerService,
  useAdminOverviewQuery,
  useAdminSessionStatsQuery,
  useAdminTrendsQuery,
  useAdminMfaStatsQuery,
  useAdminAuditLogsQuery,
  useAdminAlertsQuery,
  useAcknowledgeAlertMutation,
  useResolveAlertMutation,
  useEmailTemplatesQuery,
  useEmailTemplateByIdQuery,
  useEmailTemplatePreviewMutation,
  useSendTestEmailMutation,
  useExportAuditTrailMutation,
  useClientsQuery,
  useClientDetailQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useRotateClientSecretMutation,
  useScopesQuery,
  useCreateScopeMutation,
  useUpdateScopeMutation,
  useDeleteScopeMutation,
  useWebhooksQuery,
  useWebhookDetailQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useTestWebhookMutation,
  useAuthEventsStream,
} from './modules/platform-cluster'
export * from './modules/mfa-orchestrator'
export * from './modules/identity-broker/screens'
export * from './modules/passwordless-service'
export * from './modules/developer-console'
export { apiExplorerService } from './modules/platform-cluster'
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
  useGetUser,
  useUserPasskeys,
  useLinkedAccounts,
  useUserTokens,
  useChangeEmail,
  useChangePassword,
} from './modules/user-directory'

export { useSessionGuard } from './modules/session-manager/middlewares/useSessionGuard'

export { idaasFacade } from './idaas-facade/src'
export type { IIdaasFacade } from './idaas-facade/src'

export const AuthModule: CAPModule = {
  id: 'auth-module',
  version: '1.0.0',
  routes: authRouteConfig,
  i18n: { en, ar, fr },
  plugins: [],
  navItems: [
    // --- ACCOUNT & SECURITY SECTION (USER) ---
    {
      id: 'auth-account-section',
      label: 'navigation.accountSettings',
      section: 'Account & Security',
      variant: ['vertical', 'horizontal'],
      order: 10,
    },
    {
      id: 'auth-account-overview',
      label: 'navigation.accountOverview',
      icon: React.createElement(PersonOutlinedIcon),
      path: Path.session.overview,
      variant: ['vertical', 'horizontal'],
      order: 11,
    },
    {
      id: 'auth-sessions',
      label: 'navigation.activeSessions',
      icon: React.createElement(DevicesOutlinedIcon),
      path: Path.session.activeSessions,
      variant: ['vertical', 'horizontal'],
      order: 12,
    },
    {
      id: 'auth-activity-timeline',
      label: 'navigation.activityTimeline',
      icon: React.createElement(HistoryOutlinedIcon),
      path: Path.session.activityTimeline,
      variant: ['vertical', 'horizontal'],
      order: 13,
    },
    {
      id: 'auth-linked-accounts',
      label: 'navigation.linkedAccounts',
      icon: React.createElement(LinkOutlinedIcon),
      path: Path.user.profile.linkedAccounts,
      variant: ['vertical', 'horizontal'],
      order: 14,
    },
    {
      id: 'auth-mfa',
      label: 'navigation.twoSteps',
      icon: React.createElement(SecurityOutlinedIcon),
      path: Path.mfa.mfa.dashboard,
      variant: ['vertical', 'horizontal'],
      order: 15,
    },
    {
      id: 'auth-passkeys',
      label: 'navigation.passkeys',
      icon: React.createElement(KeyOutlinedIcon),
      path: Path.mfa.passkey.management,
      variant: ['vertical', 'horizontal'],
      order: 16,
    },
    // {
    //   id: 'auth-passwordless',
    //   label: 'navigation.passwordless',
    //   icon: React.createElement(PasswordOutlinedIcon),
    //   path: Path.passwordless.setup,
    //   variant: ['vertical', 'horizontal'],
    //   order: 17,
    // },

    // --- IDENTITY & GOVERNANCE SECTION (ADMIN) ---
    {
      id: 'auth-governance-section',
      label: 'navigation.governance',
      section: 'Identity & Governance',
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 30,
    },
    {
      id: 'auth-admin-users',
      label: 'navigation.users',
      icon: React.createElement(PeopleOutlinedIcon),
      path: Path.user.admin.users.list,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 31,
    },
    {
      id: 'auth-admin-organizations',
      label: 'navigation.organizations',
      icon: React.createElement(BusinessOutlinedIcon),
      path: Path.user.admin.organizations.list,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 32,
    },
    {
      id: 'auth-admin-roles',
      label: 'navigation.rolesPermissions',
      icon: React.createElement(ShieldOutlinedIcon),
      path: Path.authorization.roles,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 33,
    },
    {
      id: 'auth-policy-canvas',
      label: 'navigation.policyCanvas',
      icon: React.createElement(AccountTreeOutlinedIcon),
      path: Path.authorization.policyCanvas,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 34,
    },
    {
      id: 'auth-api-tokens',
      label: 'navigation.apiTokens',
      icon: React.createElement(VpnKeyOutlinedIcon),
      path: Path.authorization.dashboard,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 35,
    },
    {
      id: 'auth-domain-verification',
      label: 'navigation.domainVerification',
      icon: React.createElement(FactCheckOutlinedIcon),
      path: Path.authorization.domainVerification,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 36,
    },
    {
      id: 'auth-sso-saml',
      label: 'navigation.samlConfiguration',
      icon: React.createElement(HubOutlinedIcon),
      path: Path.identity.samlConfigDashboard,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 37,
    },
    {
      id: 'auth-sso-oidc',
      label: 'navigation.oidcConfiguration',
      icon: React.createElement(LockOutlinedIcon),
      path: Path.identity.oidcConfigBrowser,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 38,
    },
    {
      id: 'auth-jwks-management',
      label: 'navigation.jwksManagement',
      icon: React.createElement(KeyOutlinedIcon),
      path: Path.identity.jwksManagement,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 39,
    },
    {
      id: 'auth-scim-provisioning',
      label: 'navigation.scimProvisioning',
      icon: React.createElement(ExtensionOutlinedIcon),
      path: Path.identity.provisioning,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 40,
    },
    {
      id: 'auth-ssf-configuration',
      label: 'navigation.ssfConfiguration',
      icon: React.createElement(SecurityOutlinedIcon),
      path: Path.identity.ssfConfiguration,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 41,
    },
    {
      id: 'auth-machine-identities',
      label: 'navigation.machineIdentities',
      icon: React.createElement(TerminalOutlinedIcon),
      path: Path.authorization.machineIdentities,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 42,
    },

    // --- MONITORING & DEVELOPER SECTION (ADMIN) ---
    {
      id: 'auth-system-section',
      label: 'navigation.systemPlatform',
      section: 'Monitoring & Developer',
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 50,
    },
    {
      id: 'auth-monitoring-dashboard',
      label: 'navigation.monitoringDashboard',
      icon: React.createElement(MonitorHeartOutlinedIcon),
      path: Path.platformCluster.monitor.dashboard,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 51,
    },
    {
      id: 'auth-realtime-events',
      label: 'navigation.realTimeEvents',
      icon: React.createElement(HistoryOutlinedIcon),
      path: Path.platformCluster.monitor.real_time,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 52,
    },
    {
      id: 'auth-developer-console',
      label: 'navigation.developerConsole',
      icon: React.createElement(TerminalOutlinedIcon),
      path: Path.developerConsole.developerConsole,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 53,
    },
    {
      id: 'auth-webhooks',
      label: 'navigation.webhooks',
      icon: React.createElement(WebhookOutlinedIcon),
      path: Path.developerConsole.webhooks,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 54,
    },
    {
      id: 'auth-modules',
      label: 'navigation.moduleManagement',
      icon: React.createElement(ExtensionOutlinedIcon),
      path: Path.platformCluster.developer.module_management,
      roles: ['admin'],
      variant: ['vertical', 'horizontal'],
      order: 55,
    },
  ],
  searchItems: [
    // Account & User Searches
    {
      id: 'auth-profile',
      name: 'navigation.userProfile',
      url: Path.user.profile.view,
      icon: React.createElement(PersonOutlinedIcon),
      section: 'navigation.accountOverview',
    },
    {
      id: 'auth-overview',
      name: 'navigation.accountOverview',
      url: Path.session.overview,
      icon: React.createElement(PersonOutlinedIcon),
      section: 'navigation.accountOverview',
    },
    {
      id: 'auth-sessions',
      name: 'navigation.activeSessions',
      url: Path.session.activeSessions,
      icon: React.createElement(DevicesOutlinedIcon),
      section: 'navigation.accountOverview',
    },
    {
      id: 'auth-activity-timeline',
      name: 'navigation.activityTimeline',
      url: Path.session.activityTimeline,
      icon: React.createElement(HistoryOutlinedIcon),
      section: 'navigation.accountOverview',
    },
    {
      id: 'auth-linked-accounts',
      name: 'navigation.linkedAccounts',
      url: Path.user.profile.linkedAccounts,
      icon: React.createElement(LinkOutlinedIcon),
      section: 'navigation.accountOverview',
    },
    {
      id: 'auth-mfa',
      name: 'navigation.twoSteps',
      url: Path.mfa.mfa.dashboard,
      icon: React.createElement(SecurityOutlinedIcon),
      section: 'navigation.security',
    },
    {
      id: 'auth-mfa-setup',
      name: 'navigation.mfaSetup',
      url: Path.mfa.mfa.setup,
      icon: React.createElement(SecurityOutlinedIcon),
      section: 'navigation.security',
    },
    {
      id: 'auth-passkeys',
      name: 'navigation.passkeys',
      url: Path.mfa.passkey.management,
      icon: React.createElement(KeyOutlinedIcon),
      section: 'navigation.security',
    },
    {
      id: 'auth-passwordless',
      name: 'navigation.passwordless',
      url: Path.passwordless.setup,
      icon: React.createElement(PasswordOutlinedIcon),
      section: 'navigation.security',
    },

    // Governance & Admin Searches
    {
      id: 'auth-admin-users',
      name: 'navigation.users',
      url: Path.user.admin.users.list,
      icon: React.createElement(PeopleOutlinedIcon),
      section: 'navigation.governance',
    },
    {
      id: 'auth-admin-organizations',
      name: 'navigation.organizations',
      url: Path.user.admin.organizations.list,
      icon: React.createElement(BusinessOutlinedIcon),
      section: 'navigation.governance',
    },
    {
      id: 'auth-admin-roles',
      name: 'navigation.rolesPermissions',
      url: Path.authorization.roles,
      icon: React.createElement(ShieldOutlinedIcon),
      section: 'navigation.governance',
    },
    {
      id: 'auth-policy-canvas',
      name: 'navigation.policyCanvas',
      url: Path.authorization.policyCanvas,
      icon: React.createElement(AccountTreeOutlinedIcon),
      section: 'navigation.governance',
    },
    {
      id: 'auth-api-tokens',
      name: 'navigation.apiTokens',
      url: Path.authorization.dashboard,
      icon: React.createElement(VpnKeyOutlinedIcon),
      section: 'navigation.governance',
    },
    {
      id: 'auth-domain-verification',
      name: 'navigation.domainVerification',
      url: Path.authorization.domainVerification,
      icon: React.createElement(FactCheckOutlinedIcon),
      section: 'navigation.governance',
    },
    {
      id: 'auth-sso-saml',
      name: 'navigation.samlConfiguration',
      url: Path.identity.samlConfigDashboard,
      icon: React.createElement(HubOutlinedIcon),
      section: 'navigation.governance',
    },
    {
      id: 'auth-sso-oidc',
      name: 'navigation.oidcConfiguration',
      url: Path.identity.oidcConfigBrowser,
      icon: React.createElement(LockOutlinedIcon),
      section: 'navigation.governance',
    },
    {
      id: 'auth-scim-provisioning',
      name: 'navigation.scimProvisioning',
      url: Path.identity.provisioning,
      icon: React.createElement(ExtensionOutlinedIcon),
      section: 'navigation.governance',
    },
    {
      id: 'auth-jwks-management',
      name: 'navigation.jwksManagement',
      url: Path.identity.jwksManagement,
      icon: React.createElement(KeyOutlinedIcon),
      section: 'navigation.governance',
    },
    {
      id: 'auth-ssf-configuration',
      name: 'navigation.ssfConfiguration',
      url: Path.identity.ssfConfiguration,
      icon: React.createElement(SecurityOutlinedIcon),
      section: 'navigation.governance',
    },
    {
      id: 'auth-machine-identities',
      name: 'navigation.machineIdentities',
      url: Path.authorization.machineIdentities,
      icon: React.createElement(TerminalOutlinedIcon),
      section: 'navigation.governance',
    },

    // Developer & Monitoring Searches
    {
      id: 'auth-developer-console',
      name: 'navigation.developerConsole',
      url: Path.developerConsole.developerConsole,
      icon: React.createElement(TerminalOutlinedIcon),
      section: 'navigation.systemPlatform',
    },
    {
      id: 'auth-webhooks',
      name: 'navigation.webhooks',
      url: Path.developerConsole.webhooks,
      icon: React.createElement(WebhookOutlinedIcon),
      section: 'navigation.systemPlatform',
    },
    {
      id: 'auth-monitoring-dashboard',
      name: 'navigation.monitoringDashboard',
      url: Path.platformCluster.monitor.dashboard,
      icon: React.createElement(MonitorHeartOutlinedIcon),
      section: 'navigation.systemPlatform',
    },
    {
      id: 'auth-realtime-events',
      name: 'navigation.realTimeEvents',
      url: Path.platformCluster.monitor.real_time,
      icon: React.createElement(HistoryOutlinedIcon),
      section: 'navigation.systemPlatform',
    },
    {
      id: 'auth-module-management',
      name: 'navigation.moduleManagement',
      url: Path.platformCluster.developer.module_management,
      icon: React.createElement(ExtensionOutlinedIcon),
      section: 'navigation.systemPlatform',
    },
  ],
}

export const initAuthPlugins = (plugins: any[]) => {
  plugins.forEach((plugin) => authRegistry.register(plugin))
}

// Auto-initialize plugins for this module
initAuthPlugins([MFATOTPPlugin])
