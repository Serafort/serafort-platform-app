export interface SSFConfig {
  id?: number
  enabled: boolean
  issuer?: string
  delivery_method?: 'Push' | 'Poll' | string
  endpoint_url?: string
  events_supported?: string[]
  events_meta?: Array<{
    id: string
    name: string
    desc: string
  }>
  authorization_header?: string
  verification_token?: string
  createdAt?: string
  updatedAt?: string
}

export interface UpdateSSFConfigDTO {
  enabled?: boolean
  issuer?: string
  delivery_method?: 'Push' | 'Poll' | string
  endpoint_url?: string
  events_supported?: string[]
  authorization_header?: string
}

export interface SSFTestStreamRequest {
  endpoint_url?: string
  events?: string[]
}

export interface SSFTestStreamResponse {
  success: boolean
  status: 'delivered' | 'failed' | string
  statusCode?: number
  latencyMs?: number
  message?: string
}

export interface SSFBroadcastEventDTO {
  subject: string
  event_type: string
  event_payload?: Record<string, any>
}

export interface SSFBroadcastEventResponse {
  success: boolean
  broadcastId: string
  recipientsCount?: number
  timestamp: string
}

export interface SSFHistoryLog {
  id: string | number
  event_type: string
  subject: string
  status: 'delivered' | 'failed' | 'retrying' | 'pending'
  statusCode?: number
  error_message?: string | null
  delivered_at?: string
  created_at: string
}
