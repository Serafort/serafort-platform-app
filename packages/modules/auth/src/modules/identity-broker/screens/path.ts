const Path = {
  connectorDetail: '/admin/provisioning/connectors/:id',
  syncLogs: '/admin/provisioning/logs',
  provisioning: '/admin/provisioning',
  scim: '/admin/provisioning/scim',

  authWait: '/auth/sso/wait',
  jwksManagement: '/auth/sso/jwks',
  oidcClientCreate: '/auth/sso/oidc-config/create',
  oidcClientEdit: '/auth/sso/oidc-config/:id/edit',
  oidcConfigBrowser: '/auth/sso/oidc-config',
  oidcLoginPrompt: '/auth/sso/oidc-prompt',
  oidcWait: '/auth/sso/oidc/wait',
  permissionConsent: '/auth/sso/consent',

  samlConfigDashboard: '/auth/sso/saml-config',
  samlMetadataBrowser: '/auth/sso/saml-browser',
  samlMetadataDisplay: '/auth/sso/saml-metadata',
  samlWait: '/auth/sso/saml/wait',
  samlSSOInitiation: '/auth/sso/login',

  providerSelection: '/auth/sso/select-provider',
  ssfConfiguration: '/auth/sso/ssf-config',
}
export default Path
