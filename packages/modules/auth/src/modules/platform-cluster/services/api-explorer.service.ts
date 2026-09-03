import { apiClient, FetchResponse } from '@cap/platform-core'
import { ENDPOINTS } from '@cap/platform-core'

export interface OpenAPIPathItem {
  summary?: string
  description?: string
  security?: Array<Record<string, string[]>>
  tags?: string[]
  [key: string]: unknown
}

export interface OpenAPISpec {
  paths?: Record<string, Record<string, OpenAPIPathItem>>
}

export interface SandboxExecutionResult {
  status: number
  data: any
}

const apiExplorerService = {
  getSpec: (): Promise<FetchResponse<OpenAPISpec>> => {
    return apiClient.get<OpenAPISpec>(ENDPOINTS.admin.docs)
  },

  executeSandbox: (params: {
    path: string
    method: string
    data: any
  }): Promise<FetchResponse<SandboxExecutionResult>> => {
    return apiClient.post<SandboxExecutionResult>(ENDPOINTS.admin.sandboxExecute, params)
  },
}

export default apiExplorerService
