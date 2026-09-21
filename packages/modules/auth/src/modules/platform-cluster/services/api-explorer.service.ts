import { apiClient, FetchResponse, ENDPOINTS } from '@cap/platform-core'

export interface OpenAPIParameter {
  name: string
  in: 'path' | 'query' | 'header' | 'body'
  required?: boolean
  description?: string
  schema?: {
    type?: string
    default?: unknown
    example?: unknown
    enum?: string[]
  }
}

export interface OpenAPIPathItem {
  summary?: string
  description?: string
  operationId?: string
  security?: Array<Record<string, string[]>>
  tags?: string[]
  parameters?: OpenAPIParameter[]
  requestBody?: {
    required?: boolean
    content?: {
      'application/json'?: {
        schema?: unknown
        example?: unknown
      }
    }
  }
  responses?: Record<string, { description?: string; content?: unknown }>
  [key: string]: unknown
}

export interface OpenAPISpec {
  openapi?: string
  info?: {
    title?: string
    version?: string
    description?: string
  }
  paths?: Record<string, Record<string, OpenAPIPathItem>>
  components?: Record<string, unknown>
}

export interface SandboxExecutionParams {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | string
  data?: unknown
  headers?: Record<string, string>
  params?: Record<string, string>
}

export interface SandboxExecutionResult {
  status: number
  statusText?: string
  responseTimeMs?: number
  headers?: Record<string, string>
  data: unknown
}

const apiExplorerService = {
  getSpec: (): Promise<FetchResponse<OpenAPISpec>> => {
    return apiClient.get<OpenAPISpec>(ENDPOINTS.admin.docs)
  },

  executeSandbox: async (
    params: SandboxExecutionParams,
  ): Promise<FetchResponse<SandboxExecutionResult>> => {
    const startTime = performance.now()
    try {
      // First attempt execution via backend sandbox endpoint. This is
      // feature-flagged off by default server-side (SANDBOX_ENABLED) and
      // disabled entirely in production, so the direct-fallback path below
      // is the common case, not a last resort for a broken endpoint.
      const response = await apiClient.post<SandboxExecutionResult>(
        ENDPOINTS.admin.sandboxExecute,
        params,
      )
      const duration = Math.round(performance.now() - startTime)
      return {
        ...response,
        data: {
          ...response.data,
          responseTimeMs: response.data?.responseTimeMs ?? duration,
        },
      }
    } catch (err: unknown) {
      // Direct API fallback execution
      const duration = Math.round(performance.now() - startTime)
      const method = (params.method || 'GET').toLowerCase()
      let directRes: FetchResponse<unknown>
      if (method === 'get') {
        const q = params.params ? `?${new URLSearchParams(params.params).toString()}` : ''
        directRes = await apiClient.get(`${params.path}${q}`)
      } else if (method === 'post') {
        directRes = await apiClient.post(params.path, params.data)
      } else if (method === 'put') {
        directRes = await apiClient.put(params.path, params.data)
      } else if (method === 'patch') {
        directRes = await apiClient.patch(params.path, params.data)
      } else if (method === 'delete') {
        directRes = await apiClient.delete(params.path)
      } else {
        throw err
      }

      return {
        ...directRes,
        data: {
          status: directRes.status || 200,
          responseTimeMs: duration,
          data: directRes.data,
        },
      }
    }
  },
}

export default apiExplorerService
