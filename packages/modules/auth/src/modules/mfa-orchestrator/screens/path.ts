const Path = {
  // MFA Paths
  mfa: {
    verification: '/auth/mfa/verify',

    setup: '/auth/mfa/setup',
    backup_codes: '/auth/mfa/backup-codes',
    verification_success: '/auth/mfa/success',
    management: '/auth/mfa/manage',
    dashboard: '/auth/mfa/dashboard',
    backup_entry: '/auth/mfa/backup-entry',
    add_method: '/auth/mfa/add-method',
    security_keys: '/auth/mfa/security-keys',
  },
  passkey: {
    edit: '/auth/passkey/edit',
    management: '/auth/passkey/management',
    recovery: '/auth/passkey/recovery',
    creation_options: '/auth/passkey/create',
    login: '/auth/passkey/login',
    naming_config: '/auth/passkey/configure',
    prompt: '/auth/passkey/prompt',
    setup: '/auth/passkey/setup',
    setup_auto: '/auth/passkey/setup/auto',
    usage_stats: '/auth/passkey/usage-stats',
    example: '/auth/passkey/example',

  },
  platform: {
    login: '/auth/platform/login',
    register: '/auth/platform/register',
  },
  setup: '/auth/mfa/setup',
  verification: '/auth/mfa/verify',
  dashboard: '/auth/mfa/dashboard',
}

export default Path
