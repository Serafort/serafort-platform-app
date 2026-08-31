/**
 * Auto-generated / synchronized from Authentication backend.
 * Source: Authentication/app/contracts/dtos/oidc_dto.ts
 * DO NOT EDIT DIRECTLY - Use scripts/sync-contracts.mjs
 */

/**
 * OIDC, SCIM, and SAML Integration DTOs
 * Aligned with @cap/shared-types and @cap/auth-contracts.
 */

export interface OIDCClientDTO {
  id: string | number;
  client_id: string;
  client_name: string;
  client_secret?: string;
  type: string;
  description?: string | null;
  status: string;
  scopes: string[];
  redirect_uris: string[];
  grant_types: string[];
  response_types: string[];
  token_endpoint_auth_method: string;
  is_fapi_compliant: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOIDCClientDTO {
  name: string;
  redirectUris: string[];
  grantTypes?: string[];
  responseTypes?: string[];
  scope?: string;
  token_endpoint_auth_method?: string;
  is_fapi_compliant?: boolean;
}

export interface SCIMTokenDTO {
  id: number;
  name: string;
  description: string | null;
  last_used_at: string | null;
  created_at: string;
  token?: string;
}

export interface ConnectorDTO {
  id: number;
  name: string;
  type: string;
  status: string;
  last_sync_at: string | null;
  sync_count: number;
  error_message: string | null;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
