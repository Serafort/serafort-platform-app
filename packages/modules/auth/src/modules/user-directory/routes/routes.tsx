import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import { createAuthRoute } from '../../../routes/routeHelpers'
import Path from './../screens/path'

// ---------------------------------------------------------------------------
// admin organization
// ---------------------------------------------------------------------------
const DomainVerification = React.lazy(
  () => import('./../screens/admin/organizations/DomainVerification'),
)
const OrganizationInvitationDashboard = React.lazy(
  () => import('./../screens/admin/organizations/OrganizationInvitationDashboard'),
)
const OrganizationListDashboard = React.lazy(
  () => import('./../screens/admin/organizations/OrganizationListDashboard'),
)
const OrganizationProfile = React.lazy(
  () => import('./../screens/admin/organizations/OrganizationProfile'),
)
// ---------------------------------------------------------------------------
// admin user directory
// ---------------------------------------------------------------------------
const AdminUserProfile = React.lazy(() => import('./../screens/admin/users/AdminUserProfile'))
const BanManagement = React.lazy(() => import('./../screens/admin/users/BanManagement'))
const CreateUserDialog = React.lazy(() => import('../components/CreateUserDialog'))
const UserDataExport = React.lazy(() => import('./../screens/admin/users/DataExport'))
const UserImpersonationLogs = React.lazy(() => import('./../screens/admin/users/ImpersonationLogs'))
const IssueBanDialog = React.lazy(() => import('../components/IssueBanDialog'))
const ResetPasswordDialog = React.lazy(() => import('../components/ResetPasswordDialog'))
const UserList = React.lazy(() => import('./../screens/admin/users/UserList'))
// ---------------------------------------------------------------------------
// Profile screens
// ---------------------------------------------------------------------------
const Profile = React.lazy(() => import('../screens/profile/profile'))
const LinkedAccountsDashboard = React.lazy(
  () => import('./../screens/profile/LinkedAccountsDashboard'),
)
// ---------------------------------------------------------------------------
// Setting screens
// ---------------------------------------------------------------------------

const ChangeEmail = React.lazy(() => import('./../screens/settings/ChangeEmail'))
const DataExport = React.lazy(() => import('./../screens/settings/DataExport'))
const DeactivateAccount = React.lazy(() => import('./../screens/settings/DeactivateAccount'))
const DeleteAccount = React.lazy(() => import('./../screens/settings/DeleteAccount'))
const EmailChangeStatusDashboard = React.lazy(
  () => import('./../screens/settings/EmailChangeStatusDashboard'),
)
const InitiateEmailChange = React.lazy(() => import('./../screens/settings/InitiateEmailChange'))
export const userDirectoryRouteConfig: Array<AuthRouteConfig> = [
  // --- User profile (verified auth) ---
  createAuthRoute(Path.admin.organizations.domain_verification, <DomainVerification />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.admin.organizations.invitations, <OrganizationInvitationDashboard />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.admin.organizations.list, <OrganizationListDashboard />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.admin.organizations.organizationProfile, <OrganizationProfile />, {
    requiresVerification: true,
    layout: 'admin',
  }),

  createAuthRoute(Path.admin.users.user_profile, <AdminUserProfile />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.admin.users.ban_management, <BanManagement />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.admin.users.data_export, <UserDataExport />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.admin.users.impersonation_logs, <UserImpersonationLogs />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.admin.users.list, <UserList />, {
    requiresVerification: true,
    layout: 'admin',
  }),

  createAuthRoute(Path.profile.view, <Profile />, { requiresVerification: true, layout: 'admin' }),
  createAuthRoute(Path.profile.linkedAccounts, <LinkedAccountsDashboard />, {
    requiresVerification: true,
    layout: 'admin',
  }),

  createAuthRoute(Path.settings.change_email, <ChangeEmail />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.settings.data_export, <DataExport />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.settings.deactivate, <DeactivateAccount />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.settings.delete, <DeleteAccount />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.settings.email_change_status, <EmailChangeStatusDashboard />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.settings.initiate_email_change, <InitiateEmailChange />, {
    requiresVerification: true,
    layout: 'noLayout',
  }),
]
