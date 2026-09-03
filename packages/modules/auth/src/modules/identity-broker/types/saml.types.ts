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

export interface SAMLMetadataResponse {
  metadataXml: string
  entityId: string
  acsUrl: string
  sloUrl?: string
  certificate?: string
}

export interface RemoteMetadataFetchDTO {
  url: string
}

export interface RemoteMetadataResult {
  name?: string
  entityId: string
  ssoUrl?: string
  sloUrl?: string
  certificate?: string
  rawXml?: string
}

export interface RecentSAMLEntity {
  id: string
  name: string
  entityId: string
  status: 'active' | 'inactive' | 'pending'
  verified?: boolean
  isLocal?: boolean
  updatedAt?: string
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
