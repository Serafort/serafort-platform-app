const Path = {
  // MFA Paths
  mfa: {
    setup: '/auth/mfa/setup',
    verification: '/auth/mfa/verify',
    backup_codes: '/auth/mfa/backup-codes',
    verification_success: '/auth/mfa/success',
    management: '/auth/mfa/manage',
    dashboard: '/auth/mfa/dashboard',
    backup_entry: '/auth/mfa/backup-entry',
    add_method: '/auth/mfa/add-method',
    security_keys: '/auth/mfa/security-keys',
  },
  passkey: {
    setup: '/auth/passkey/setup',
    management: '/auth/passkey/management',
    recovery: '/auth/passkey/recovery',
    usage_stats: '/auth/passkey/usage-stats',
    creation_options: '/auth/passkey/create',
    login: '/auth/passkey/login',
    naming_config: '/auth/passkey/configure',
    platform_login: '/auth/passkey/platform-login',
    platform_register: '/auth/passkey/platform-register',
  }
}

export default Path
