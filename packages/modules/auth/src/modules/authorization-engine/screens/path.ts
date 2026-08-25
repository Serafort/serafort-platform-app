const Path = {
  // --- API Tokens ---
  dashboard: '/auth/api-tokens',
  createBasic: '/auth/api-tokens/create/basic',
  createRestrictions: '/auth/api-tokens/create/restrictions',
  details: '/auth/api-tokens/:tokenId',
  display: '/auth/api-tokens/:tokenId/display',
  actions: '/auth/api-tokens/:tokenId/actions',
  securityWarning: '/auth/api-tokens/security-warning',
  machineIdentities: '/admin/machine-identities',

  // -- Domain Verification
  domainVerification: '/admin/domain-verification',
  // -- Policies
  policyCanvas: '/admin/policies/canvas',
  // -- Roles
  roles: '/admin/roles',
  roleDetail: '/admin/roles/:id',

  // -- Permissions
  // permissions: '/admin/permissions',
  // policies: '/admin/organizations/:id/policies',
  // applications: '/admin/applications',
  // appDetail: '/admin/applications/:id',
  // scopes: '/admin/scopes',
  // apiExplorer: '/admin/api-explorer',
  // webhooks: '/admin/webhooks',
}

export default Path

