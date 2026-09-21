export interface OIDCClient {
  id: string
  clientId: string
  clientName: string
  clientSecret?: string
  redirectUris: string[]
  responseTypes?: string[]
  grantTypes?: string[]
  tokenEndpointAuthMethod?: string
  logoUri?: string | null
  policyUri?: string | null
  tosUri?: string | null
  scope?: string
  organizationId?: number | null
  isActive?: boolean
  description?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * `oidcClientValidator` / `updateOidcClientValidator`
 * (`app/validators/admin.ts`) only allow-list `name`, `redirectUris`,
 * `grantTypes`, `responseTypes`, `branding`, `is_fapi_compliant` and
 * `description`. `tokenEndpointAuthMethod` has no backing column on
 * `OidcClient` at all, and `scope` isn't in either validator even though the
 * model has a sibling `scopes` (array) column — both are silently dropped by
 * `request.validateUsing(...)`, not rejected. They stay on the DTO as
 * forward-looking fields; sending them today is a no-op.
 */
export interface CreateOIDCClientDTO {
  name: string
  redirectUris: string[]
  grantTypes?: string[]
  responseTypes?: string[]
  tokenEndpointAuthMethod?: string
  scope?: string
  description?: string
}

export interface UpdateOIDCClientDTO {
  name?: string
  redirectUris?: string[]
  grantTypes?: string[]
  responseTypes?: string[]
  tokenEndpointAuthMethod?: string
  scope?: string
  description?: string
}

/**
 * `ClientsController.rotateSecret` only ever returns `{ message,
 * client_secret }` — it never echoes the client id, so `oidc.service.ts`
 * fills `clientId` in from the id the caller already passed to build the URL.
 */
export interface RotateClientSecretResult {
  clientId: string
  clientSecret: string
  message: string
}

export interface OIDCClientBranding {
  logoUri?: string | null
  policyUri?: string | null
  tosUri?: string | null
  clientName?: string
}

export interface OIDCInteractionPrompt {
  name: 'login' | 'consent' | string
  reasons?: string[]
  details?: Record<string, unknown>
}

export interface OIDCInteractionDetails {
  uid: string
  prompt: OIDCInteractionPrompt
  params: {
    client_id?: string
    redirect_uri?: string
    response_type?: string
    scope?: string
    state?: string
    nonce?: string
    [key: string]: unknown
  }
  client?: OIDCClient
  session?: {
    accountId?: string
    [key: string]: unknown
  }
  organization?: {
    id?: number
    name?: string
    securityPolicies?: {
      allowedSsoProviders?: string[]
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  /** The raw node-oidc-provider `interactionDetails()` result, nested by `OidcController.interaction`. */
  details?: {
    params?: { scope?: string; [key: string]: unknown }
    session?: { accountId?: string; [key: string]: unknown }
    [key: string]: unknown
  }
}

export interface OIDCLoginCredentials {
  email?: string
  password?: string
  interaction?: string
}

export interface OIDCLoginResponse {
  url?: string
  mfa_required?: boolean
  userId?: number | string
  mfa_token?: string
  interaction?: string
}

export interface OIDCMfaVerifyDTO {
  mfaToken: string
  code: string
  method?: 'totp' | 'sms'
}

export interface OIDCConsentDTO {
  rejectedScopes?: string[]
  rejectedClaims?: string[]
}

/**
 * Result of an OIDC interaction transition (login / consent confirm / abort).
 * The backend may return the redirect target under any of these keys depending
 * on the interaction outcome, so all are optional.
 */
export interface OIDCRedirectResult {
  url?: string
  returnTo?: string
  redirectTo?: string
}

export interface OIDCDeviceVerifyResult {
  success: boolean
  redirectUrl: string
}

/**
 * A client row as the Authentication service serialises it: OAuth-spec
 * snake_case today, camelCase if the response middleware is ever wired up.
 * `normalizeOidcClient` folds both into `OIDCClient`.
 */
export interface RawOIDCClient {
  id?: string
  client_id?: string
  clientId?: string
  client_name?: string
  clientName?: string
  name?: string
  client_secret?: string
  clientSecret?: string
  redirect_uris?: string[]
  redirectUris?: string[]
  response_types?: string[]
  responseTypes?: string[]
  grant_types?: string[]
  grantTypes?: string[]
  token_endpoint_auth_method?: string
  tokenEndpointAuthMethod?: string
  logo_uri?: string | null
  logoUri?: string | null
  policy_uri?: string | null
  policyUri?: string | null
  tos_uri?: string | null
  tosUri?: string | null
  scope?: string
  organization_id?: number | null
  organizationId?: number | null
  is_active?: boolean
  isActive?: boolean
  created_at?: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
  description?: string
}
