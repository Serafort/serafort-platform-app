const Path = {
  profile: '/auth/account/view',
  view: '/auth/account/view', // Alias for profile
  edit: '/auth/account/edit',
  settings: '/auth/account/settings',
  changeEmail: '/auth/account/change-email',
  linkedAccounts: '/auth/account/linked-accounts',
  deactivate: '/auth/account/deactivate',
  delete: '/auth/account/delete',
  users: '/admin/users',
  userProfile: '/admin/users/:id',
  banManagement: '/admin/bans',
  impersonationLogs: '/admin/impersonation-logs',
  organizations: '/admin/organizations',
  organizationProfile: '/admin/organizations/:id',
  invitations: '/admin/organizations/:id/invitations',
  emailChangeStatus: '/auth/account/email-change-status',
  initiateEmailChange: '/auth/account/initiate-email-change',
}
export default Path
