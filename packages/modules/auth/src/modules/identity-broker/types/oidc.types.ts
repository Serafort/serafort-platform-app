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
}

export interface UpdateOIDCClientDTO {
  name?: string
  redirectUris?: string[]
  grantTypes?: string[]
  responseTypes?: string[]
  tokenEndpointAuthMethod?: string
  scope?: string
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
  details?: Record<string, any>
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
    [key: string]: any
  }
  client?: OIDCClient | Record<string, any>
  session?: {
    accountId?: string
    [key: string]: any
  }
  organization?: {
    id?: number
    name?: string
    securityPolicies?: {
      allowedSsoProviders?: string[]
      [key: string]: any
    }
    [key: string]: any
  }
  details?: Record<string, any>
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
