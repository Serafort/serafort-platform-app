export interface SCIMConfig {
  id?: number
  enabled: boolean
  scim_base_url?: string
  authentication_scheme?: 'oauthbearertoken' | 'httpbasic' | string
  user_schema_extensions_enabled?: boolean
  max_results_per_page?: number
  bulk_max_operations?: number
  created_at?: string
  updated_at?: string
}

export interface UpdateSCIMConfigDTO {
  enabled?: boolean
  user_schema_extensions_enabled?: boolean
  max_results_per_page?: number
  bulk_max_operations?: number
}

export interface SCIMToken {
  id: string | number
  name: string
  token_preview?: string
  expires_at?: string | null
  last_used_at?: string | null
  created_at: string
  revoked?: boolean
}

export interface CreateSCIMTokenDTO {
  name: string
  expires_in_days?: number
}

export interface CreateSCIMTokenResponse {
  id: string | number
  name: string
  token: string
  token_preview: string
  expires_at?: string | null
  created_at: string
}

export interface SCIMConnectionTestResponse {
  success: boolean
  latency_ms?: number
  endpoint_status?: 'operational' | 'unreachable' | string
  schema_compliant?: boolean
  message?: string
}
