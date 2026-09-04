import { apiClient, ENDPOINTS, type FetchResponse } from '@cap/platform-core'
import type {
  SSFConfig,
  UpdateSSFConfigDTO,
  SSFTestStreamRequest,
  SSFTestStreamResponse,
  SSFBroadcastEventDTO,
  SSFBroadcastEventResponse,
  SSFHistoryLog,
} from '../types/ssf.types'

export const ssfService = {
  getConfig: async (): Promise<FetchResponse<SSFConfig>> => {
    return apiClient.get<SSFConfig>(ENDPOINTS.admin.ssf.config)
  },

  updateConfig: async (
    data: UpdateSSFConfigDTO,
  ): Promise<FetchResponse<{ message: string; config?: SSFConfig }>> => {
    return apiClient.put(ENDPOINTS.admin.ssf.updateConfig, data)
  },

  testStream: async (
    data: SSFTestStreamRequest = {},
  ): Promise<FetchResponse<SSFTestStreamResponse>> => {
    return apiClient.post<SSFTestStreamResponse>(ENDPOINTS.admin.ssf.test, data)
  },

  /**
   * Broadcast a CAEP / RISC signal to every registered client.
   *
   * The payload is sent camelCased because `AdminSsfController.broadcast` reads
   * `request.only(['eventType', 'subject', 'reason'])`. This used to send
   * `event_type` / `event_payload`, which the handler never looks at, so every
   * broadcast came back 400 "eventType and subject are required".
   */
  broadcastEvent: async (
    data: SSFBroadcastEventDTO,
  ): Promise<FetchResponse<SSFBroadcastEventResponse>> => {
    return apiClient.post<SSFBroadcastEventResponse>(ENDPOINTS.admin.ssf.broadcast, {
      eventType: data.eventType,
      subject: data.subject,
      reason: data.reason,
    })
  },

  getHistory: async (): Promise<FetchResponse<SSFHistoryLog[]>> => {
    return apiClient.get<SSFHistoryLog[]>(ENDPOINTS.admin.ssf.history)
  },
}

export default ssfService
