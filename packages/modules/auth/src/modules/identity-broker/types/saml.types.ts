export interface SAMLConfig {
  id?: number
  enabled: boolean
  entityId: string
  acsUrl: string
  sloUrl?: string
  ssoUrl?: string
  nameIdFormat?: string
  wantAssertionsSigned?: boolean
  wantResponseSigned?: boolean
  certificate?: string
  attributeMapping?: Record<string, string>
  createdAt?: string
  updatedAt?: string
}

export interface UpdateSAMLConfigDTO {
  enabled?: boolean
  entityId?: string
  acsUrl?: string
  sloUrl?: string
  ssoUrl?: string
  nameIdFormat?: string
  wantAssertionsSigned?: boolean
  wantResponseSigned?: boolean
  certificate?: string
  attributeMapping?: Record<string, string>
}

/**
 * `GET /api/admin/saml/metadata` (`SamlConfigController.getMetadata`) does not
 * return JSON at all — it responds with `Content-Type: application/xml` and a
 * raw SP metadata XML document as the body. the SAML metadata endpoint
 * requests it with `responseType: 'text'` and hands back that raw string, so
 * there is no JSON shape to declare here; consumers get `FetchResponse<string>`.
 */

export interface RemoteMetadataFetchDTO {
  url: string
}

/**
 * `POST /api/admin/saml/metadata/remote` (`SamlConfigController.fetchRemoteMetadata`)
 * returns exactly `{ xml, entityId, name }` — a mocked preview of the remote
 * IdP's metadata, not a parsed SAML descriptor. It never returns `ssoUrl`,
 * `sloUrl` or `certificate`, so those are not modelled here.
 */
export interface RemoteMetadataResult {
  xml: string
  entityId: string
  name?: string
}

/**
 * `POST /api/admin/saml/metadata/upload` (`SamlConfigController.uploadMetadata`)
 * only ever acknowledges receipt — it does not parse or echo back the
 * uploaded metadata (see the controller: it's a stub that ignores the body
 * beyond checking it is present).
 */
export interface UploadSAMLMetadataResult {
  message: string
}

export interface RecentSAMLEntity {
  id: string
  name: string
  entityId: string
  status: 'active' | 'inactive' | 'pending'
  verified?: boolean
  isLocal?: boolean
  updatedAt?: string
  /** What `SamlConfigController.listRecentEntities` actually names this field. */
  lastExploredAt?: string
}

export interface SAMLSSOInitiateDTO {
  organizationId?: number | string
  domain?: string
  relayState?: string
}

export interface SAMLSSOInitiateResponse {
  redirect_url?: string
  url?: string
  samlRequest?: string
  relayState?: string
}

/**
 * `sso_discovery_controller` answers with the provider a work email/domain
 * resolves to, plus whichever hand-off fields that provider needs.
 */
export interface SsoDiscoveryResult {
  provider?: 'saml' | 'oidc' | 'google' | 'github' | 'microsoft' | 'password' | string
  organizationId?: number | string
  clientId?: string
  loginUrl?: string
  url?: string
}
