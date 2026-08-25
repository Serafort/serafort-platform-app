const Path = {
  admin:{
    organizations: {
      domain_verification: '/organizations/domain-verification',
      list: '/organizations',
      organizationProfile: '/organizations/:id',
      invitations: '/organizations/:id/invitations',
    },
    users:{
      user_profile: '/admin/user/:id',
      ban_management: '/admin/user/:id/ban',
      user_create: '/admin/user',
      data_export: '/admin/user/data-export',
      impersonation_logs: '/admin/user/:id/impersonation-logs',
      issues_ban_dialog: '/admin/issues-ban-dialog',
      reset_password_dialog: '/admin/reset-password-dialog',
      list: '/admin/users',
    },
  },
  profile: {
    edit: '/profile/edit',
    view: '/profile/view',
    linkedAccounts: '/profile/linked-accounts',
  },
  settings: {
    change_email: '/user/change-email',
    data_export: '/user/data-export',
    deactivate: '/user/deactivate',
    delete: '/user/delete',
    email_change_status: '/user/email-change-status',
    initiate_email_change: '/user/initiate-email-change',
  },
}
export default Path
