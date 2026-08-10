import { secureTokenManager, TokenData } from '../secureTokenManager'
import StorageManager from '../storage/storage.service'
import { resolveContractPath } from '@cap/api-contracts'
import type { AnyContract, ContractArgs, ContractRequest, ContractResponse } from '@cap/api-contracts'

export { ENDPOINTS, QUERY_KEYS, API_CONTRACTS } from '@cap/api-contracts'

const getBaseURL = (): string => {
  const envApiUrl = import.meta.env.VITE_API_URL
  const isDev = import.meta.env.DEV
  const isProd = import.meta.env.PROD

  if (!envApiUrl) {
    if (isDev) {
      console.warn('VITE_API_URL not set, using default: ""')
      return ''
    }
    console.error('VITE_API_URL not configured for production')
    throw new Error('VITE_API_URL must be configured in production')
  }

  if (isProd && !envApiUrl.startsWith('https://')) {
    console.error('❌ CRITICAL: Production API must use HTTPS!')
    throw new Error('Production API must use HTTPS protocol')
  }

  return envApiUrl
}

export const API_CONFIG = {
  baseURL: getBaseURL(),
  timeout: import.meta.env.VITE_API_TIMEOUT ? Number(import.meta.env.VITE_API_TIMEOUT) : 51730,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
} as const

// ---------------------------------------------------------------------------
// Tenant-aware request context
// Registers the resolved tenant id so every outbound request is scoped to the
// active tenant. The header is only attached once a tenant is known (set by the
// TenantProvider after tenant config resolution) and can be overridden
// per-request via FetchRequestConfig.headers.
// ---------------------------------------------------------------------------
export const TENANT_ID_HEADER = 'X-Tenant-Id'

let currentTenantId: string | null = null

export function setTenantId(tenantId: string | null | undefined): void {
  currentTenantId = tenantId ?? null
}

export function getTenantId(): string | null {
  return currentTenantId
}

import {
  RefreshResponseDto,
  ApiResponse,
  PaginatedResponse,
  ApiErrorResponse,
} from '@cap/shared-types'
import { ENDPOINTS } from '@cap/api-contracts'

export type { ApiResponse, PaginatedResponse, ApiErrorResponse }

export interface FetchRequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
  data?: unknown
  timeout?: number
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer' | 'formData'
  _retry?: boolean
}

export interface FetchResponse<T = unknown> {
  data: T
  status: number
  statusText: string
  headers: Headers
  config: FetchRequestConfig
  ok: boolean
}

export class HttpError extends Error {
  config: FetchRequestConfig
  request?: Request
  response?: FetchResponse<unknown>
  code?: string

  constructor(
    message: string,
    config: FetchRequestConfig,
    response?: FetchResponse<unknown>,
    code?: string,
  ) {
    super(message)
    this.name = 'HttpError'
    this.config = config
    this.response = response
    this.code = code
  }
}

export type TerminalErrorHandler = () => void
const terminalErrorHandlers: Set<TerminalErrorHandler> = new Set()

export const onTerminalError = (handler: TerminalErrorHandler) => {
  terminalErrorHandlers.add(handler)
  return () => terminalErrorHandlers.delete(handler)
}

const notifyTerminalError = () => {
  console.error('[FetchClient] Terminal authentication failure, notifying subscribers')
  terminalErrorHandlers.forEach((handler) => handler())
}

export type ForbiddenErrorHandler = () => void
const forbiddenErrorHandlers: Set<ForbiddenErrorHandler> = new Set()

export const onForbiddenError = (handler: ForbiddenErrorHandler) => {
  forbiddenErrorHandlers.add(handler)
  return () => forbiddenErrorHandlers.delete(handler)
}

const notifyForbiddenError = () => {
  console.error('[FetchClient] Access forbidden (403), notifying subscribers')
  forbiddenErrorHandlers.forEach((handler) => handler())
}

export type BeforeRequestHandler = (endpoint: string, config: FetchRequestConfig) => void
const beforeRequestHandlers: Set<BeforeRequestHandler> = new Set()

/**
 * Registers a synchronous pre-request hook. Handlers may throw to block the
 * request (e.g. client-side policy denial via @cap/authorization) or mutate
 * the config before it is sent. Returns an unsubscribe function.
 */
export const onBeforeRequest = (handler: BeforeRequestHandler): (() => void) => {
  beforeRequestHandlers.add(handler)
  return () => beforeRequestHandlers.delete(handler)
}

class TokenRefreshManager {
  private isRefreshing = false
  private isPaused = false
  private refreshPromise: Promise<string> | null = null
  private failedQueue: Array<{
    resolve: (token: string) => void
    reject: (error: unknown) => void
  }> = []

  private processQueue(error: unknown = null, token: string | null = null) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error)
      } else if (token) {
        promise.resolve(token)
      }
    })
    this.failedQueue = []
  }

  private async refreshTokenRequest(): Promise<string> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${ENDPOINTS.auth.refresh}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Refresh failed with status ${response.status}`)
      }

      const data: RefreshResponseDto = await response.json()

      const accessToken = data.access_token
      const expiresIn = data.expires_in || 3600

      if (!accessToken) {
        throw new Error('No access token in refresh response')
      }

      const expiresAt = Date.now() + expiresIn * 1000

      const newTokens: TokenData = {
        accessToken,
        expiresAt,
      }

      secureTokenManager.setTokens(newTokens)

      return accessToken
    } catch (error) {
      console.error('[Token Refresh] Failed:', (error as Error).message)
      throw error
    }
  }

  private handleRefreshFailure() {
    secureTokenManager.clearTokens()

    try {
      StorageManager.clearAllUserData()
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log(`exception: ${error}`)
      }
    }

    console.warn(
      '[TokenRefreshManager] Token refresh failed, tokens cleared. Application should redirect to login.',
    )

    notifyTerminalError()
  }

  async attemptRefresh(): Promise<string> {
    if (this.isPaused) {
      if (import.meta.env.DEV) {
        console.log('[TokenRefreshManager] Queue is paused, waiting for online status')
      }
      return new Promise((resolve, reject) => {
        this.queueRequest(resolve, reject)
      })
    }

    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = (async () => {
      this.isRefreshing = true

      try {
        const token = await this.refreshTokenRequest()
        this.isPaused = false
        this.processQueue(null, token)
        return token
      } catch (error) {
        const isNetworkError =
          (error instanceof TypeError && (error.message === 'Failed to fetch' || error.message.includes('NetworkError'))) ||
          (error as { status?: number }).status === 0 ||
          (error as { code?: string }).code === 'NETWORK_ERROR'

        if (isNetworkError) {
          console.warn('[TokenRefreshManager] Network failure detected during refresh. Pausing queue.')
          this.isPaused = true
          this.isRefreshing = false
          this.refreshPromise = null
          throw error
        }

        const isAuthFailure =
          (error as { status?: number }).status === 400 ||
          (error as { status?: number }).status === 401 ||
          (error as { status?: number }).status === 403

        if (isAuthFailure) {
          this.handleRefreshFailure()
          this.processQueue(error, null)
          throw error
        }

        this.processQueue(error, null)
        throw error
      } finally {
        if (!this.isPaused) {
          this.isRefreshing = false
          this.refreshPromise = null
        }
      }
    })()

    return this.refreshPromise
  }

  resume() {
    if (!this.isPaused) return
    if (import.meta.env.DEV) {
      console.log('[TokenRefreshManager] Resuming queue...')
    }
    this.isPaused = false
    this.attemptRefresh()
  }

  isRefreshInProgress(): boolean {
    return this.isRefreshing || this.isPaused
  }

  queueRequest(resolve: (token: string) => void, reject: (error: unknown) => void) {
    this.failedQueue.push({ resolve, reject })
  }
}

export const refreshManager = new TokenRefreshManager()

export class FetchClient {
  public readonly baseURL: string
  private defaultHeaders: Record<string, string>
  private timeout: number
  private withCredentials: boolean

  constructor(config: {
    baseURL: string
    headers?: Record<string, string>
    timeout?: number
    withCredentials?: boolean
  }) {
    this.baseURL = config.baseURL
    this.defaultHeaders = config.headers || {}
    this.timeout = config.timeout || 51730
    this.withCredentials = config.withCredentials || false
  }

  public async request<T = unknown>(
    endpoint: string,
    config: FetchRequestConfig = {},
  ): Promise<FetchResponse<T>> {
    if (import.meta.env.DEV) {
      console.log('FetchClient request', endpoint, config)
    }
    for (const handler of beforeRequestHandlers) {
      handler(endpoint, config)
    }
    let url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`

    if (config.params) {
      const params = new URLSearchParams()
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
      const queryString = params.toString()
      if (queryString) {
        url += `${url.includes('?') ? '&' : '?'}${queryString}`
      }
    }

    const headers = new Headers(config.headers)
    Object.entries(this.defaultHeaders).forEach(([key, value]) => {
      if (!headers.has(key)) {
        headers.set(key, value)
      }
    })

    if (currentTenantId && !headers.has(TENANT_ID_HEADER)) {
      headers.set(TENANT_ID_HEADER, currentTenantId)
    }

    if (!endpoint.includes(ENDPOINTS.auth.refresh)) {
      await secureTokenManager.ensureInitialized()

      const tokens = secureTokenManager.getTokens()

      if (tokens) {
        if (secureTokenManager.isTokenExpired()) {
          try {
            let newToken: string
            if (refreshManager.isRefreshInProgress()) {
              newToken = await new Promise<string>((resolve, reject) => {
                refreshManager.queueRequest(resolve, reject)
              })
            } else {
              newToken = await refreshManager.attemptRefresh()
            }
            headers.set('Authorization', `Bearer ${newToken}`)
          } catch {
            console.error('[Fetch Client] Token refresh pre-check failed')
          }
        } else if (tokens.accessToken) {
          headers.set('Authorization', `Bearer ${tokens.accessToken}`)
        }
      }
    }

    const timeout = config.timeout !== undefined ? config.timeout : this.timeout
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)

    let body = config.body
    if (config.data) {
      if (config.data instanceof FormData) {
        body = config.data
        headers.delete('Content-Type')
      } else {
        body = JSON.stringify(config.data)
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json')
        }
      }
    }

    const fetchConfig: RequestInit = {
      ...config,
      headers,
      body,
      signal: controller.signal,
      credentials: config.credentials || (this.withCredentials ? 'include' : undefined),
    }

    try {
      if (import.meta.env.DEV) {
        console.log('FetchClient fetch', url, fetchConfig)
      }
      const response = await fetch(url, fetchConfig)
      clearTimeout(id)
      if (import.meta.env.DEV) {
        console.log('response', response)
      }

      const responseData = await this.parseResponse(response, config.responseType)

      const result: FetchResponse<T> = {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config,
        ok: response.ok,
      }

      if (!response.ok) {
        if (
          response.status === 401 &&
          !config._retry &&
          !endpoint.includes(ENDPOINTS.auth.refresh) &&
          !endpoint.includes(ENDPOINTS.auth.login)
        ) {
          config._retry = true
          try {
            let newToken: string
            if (refreshManager.isRefreshInProgress()) {
              newToken = await new Promise<string>((resolve, reject) => {
                refreshManager.queueRequest(resolve, reject)
              })
            } else {
              newToken = await refreshManager.attemptRefresh()
            }

            const newHeaders = new Headers(config.headers)
            newHeaders.set('Authorization', `Bearer ${newToken}`)

            return this.request<T>(endpoint, {
              ...config,
              headers: Object.fromEntries(newHeaders.entries()),
            })
          } catch {
            throw new HttpError('Token refresh failed', config, result, 'REFRESH_FAILED')
          }
        }

        if (response.status === 403) {
          notifyForbiddenError()
        }

        throw new HttpError(
          (responseData as { message?: string })?.message || `Request failed with status ${response.status}`,
          config,
          result,
          String(response.status),
        )
      }

      return result
    } catch (error) {
      clearTimeout(id)
      if (error instanceof HttpError) throw error

      if ((error as { name?: string }).name === 'AbortError') {
        throw new HttpError('Request timeout', config, undefined, 'TIMEOUT')
      }

      const minimalResponse: FetchResponse<null> = {
        data: null,
        status: 0,
        statusText: 'Network Error',
        headers: new Headers(),
        config,
        ok: false,
      }
      throw new HttpError(
        (error as Error).message || 'Network Error',
        config,
        minimalResponse,
        'NETWORK_ERROR',
      )
    }
  }

  private async parseResponse(response: Response, responseType?: string) {
    if (response.status === 204) return null

    if (responseType === 'blob') return response.blob()
    if (responseType === 'text') return response.text()
    if (responseType === 'arraybuffer') return response.arrayBuffer()
    if (responseType === 'formData') return response.formData()

    try {
      return await response.json()
    } catch {
      return null
    }
  }

  get<T = unknown>(url: string, config?: FetchRequestConfig) {
    return this.request<T>(url, { ...config, method: 'GET' })
  }

  post<T = unknown>(url: string, data?: unknown, config?: FetchRequestConfig) {
    if (import.meta.env.DEV) {
      console.log('ApiClient post', url, data, config)
    }
    return this.request<T>(url, { ...config, method: 'POST', data })
  }

  put<T = unknown>(url: string, data?: unknown, config?: FetchRequestConfig) {
    return this.request<T>(url, { ...config, method: 'PUT', data })
  }

  patch<T = unknown>(url: string, data?: unknown, config?: FetchRequestConfig) {
    return this.request<T>(url, { ...config, method: 'PATCH', data })
  }

  delete<T = unknown>(url: string, config?: FetchRequestConfig) {
    return this.request<T>(url, { ...config, method: 'DELETE' })
  }
}

export const fetchClient = new FetchClient({
  baseURL: API_CONFIG.baseURL,
  headers: { ...API_CONFIG.headers },
  timeout: API_CONFIG.timeout,
  withCredentials: API_CONFIG.withCredentials,
})

export class ApiClient {
  constructor(private instance: FetchClient = fetchClient) {}

  /**
   * Invokes a typed endpoint contract. The URL is resolved from the
   * contract's `resolve` builder (delegating to `API_ENDPOINTS`) and the
   * request/response payload types flow from the contract itself.
   */
  async execute<C extends AnyContract>(
    contract: C,
    args: ContractArgs<C>,
    data?: ContractRequest<C>,
    config?: FetchRequestConfig,
  ): Promise<FetchResponse<ContractResponse<C>>> {
    const url = resolveContractPath(contract, ...args)
    switch (contract.method) {
      case 'GET':
        return this.instance.get<ContractResponse<C>>(url, config)
      case 'POST':
        return this.instance.post<ContractResponse<C>>(url, data, config)
      case 'PUT':
        return this.instance.put<ContractResponse<C>>(url, data, config)
      case 'PATCH':
        return this.instance.patch<ContractResponse<C>>(url, data, config)
      case 'DELETE':
        return this.instance.delete<ContractResponse<C>>(url, config)
      default:
        throw new HttpError(`Unsupported HTTP method: ${contract.method}`, config || {})
    }
  }

  async request<T = unknown>(endpoint: string, config: FetchRequestConfig = {}): Promise<FetchResponse<T>> {
    return this.instance.request<T>(endpoint, config)
  }

  async get<T = unknown>(url: string, config?: FetchRequestConfig): Promise<FetchResponse<T>> {
    return this.instance.get<T>(url, config)
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: FetchRequestConfig,
  ): Promise<FetchResponse<T>> {
    if (import.meta.env.DEV) {
      console.log('ApiClient post', url, data, config)
    }
    return this.instance.post<T>(url, data, config)
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: FetchRequestConfig,
  ): Promise<FetchResponse<T>> {
    return this.instance.put<T>(url, data, config)
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: FetchRequestConfig,
  ): Promise<FetchResponse<T>> {
    return this.instance.patch<T>(url, data, config)
  }

  async delete<T = unknown>(url: string, config?: FetchRequestConfig): Promise<FetchResponse<T>> {
    return this.instance.delete<T>(url, config)
  }

  async uploadFile<T = unknown>(
    url: string,
    files: File | Array<File>,
    fieldName = 'file',
    additionalData?: Record<string, unknown>,
  ): Promise<FetchResponse<T>> {
    const formData = new FormData()

    if (Array.isArray(files)) files.forEach((file) => formData.append(fieldName, file))
    else formData.append(fieldName, files)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) formData.append(key, String(value))
      })
    }

    return this.instance.post<T>(url, formData)
  }

  async uploadFormData<T = unknown>(
    url: string,
    data: Record<string, unknown>,
    method: 'post' | 'put' | 'patch' = 'post',
  ): Promise<FetchResponse<T>> {
    const formData = new FormData()

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) formData.append(key, value)
        else if (Array.isArray(value)) value.forEach((item) => formData.append(key, item))
        else formData.append(key, String(value))
      }
    })

    return this.instance[method]<T>(url, formData)
  }

  get baseURL() {
    return this.instance.baseURL
  }

  async getWithFallback<T = unknown>(
    url: string,
    fallbackData: T,
    config?: FetchRequestConfig,
  ): Promise<FetchResponse<T>> {
    try {
      return await this.instance.get<T>(url, config)
    } catch (error) {
      console.warn(`Failed to fetch ${url}, using fallback data`, error)
      return {
        data: fallbackData,
        status: 200,
        statusText: 'OK (Fallback)',
        headers: new Headers(),
        config: config || {},
        ok: true,
      } as FetchResponse<T>
    }
  }
}

export function handleApiError(error: unknown): ApiErrorResponse {
  if ((error as { response?: { data?: { message?: string; code?: string }; status?: number } }).response) {
    const err = error as { response: { data?: { message?: string; code?: string }; status?: number } }
    return {
      message: err.response.data?.message || 'An error occurred',
      errors: err.response.data as Record<string, string[]>,
      status: err.response.status || 0,
      code: err.response.data?.code,
    }
  }

  if ((error as { request?: unknown }).request) {
    return {
      message: 'No response from server. Please check your connection.',
      status: 0,
      code: 'NETWORK_ERROR',
    }
  }

  return {
    message: (error as Error).message || 'An unexpected error occurred',
    status: 0,
    code: 'UNKNOWN_ERROR',
  }
}

export function isApiError(error: unknown): error is ApiErrorResponse {
  return typeof error === 'object' && error !== null && 'message' in error && 'status' in error
}

export const apiClient = new ApiClient()

export default fetchClient
