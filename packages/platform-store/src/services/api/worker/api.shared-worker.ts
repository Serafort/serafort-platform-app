import * as Comlink from 'comlink'

export interface WorkerApiRequestPayload {
  url: string
  method: string
  headers: Record<string, string>
  body?: string
  timeout?: number
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer' | 'formData'
}

export interface WorkerApiResponsePayload<T = any> {
  ok: boolean
  status: number
  statusText: string
  data: T
  headers: Record<string, string>
  error?: string
}

export class SharedApiService {
  private activeTenantId: string | null = null
  private activeAuthToken: string | null = null
  private inFlightRequests = new Map<string, Promise<WorkerApiResponsePayload<any>>>()

  public setTenantId(tenantId: string | null): void {
    this.activeTenantId = tenantId
  }

  public setAuthToken(authToken: string | null): void {
    this.activeAuthToken = authToken
  }

  public getTenantId(): string | null {
    return this.activeTenantId
  }

  public getAuthToken(): string | null {
    return this.activeAuthToken
  }

  /**
   * Executes network fetch off-thread.
   * If an identical GET request is currently in-flight across ANY connected tab,
   * deduplicates the request and returns the existing in-flight Promise.
   */
  public async executeRequest<T = any>(
    payload: WorkerApiRequestPayload
  ): Promise<WorkerApiResponsePayload<T>> {
    const { url, method, headers = {}, body, timeout = 30000, responseType = 'json' } = payload
    const upperMethod = method.toUpperCase()

    // Deduplication Key for GET requests across all tabs
    const isGet = upperMethod === 'GET'
    const dedupeKey = isGet ? `${upperMethod}:${url}:${JSON.stringify(headers)}` : null

    if (dedupeKey && this.inFlightRequests.has(dedupeKey)) {
      if (import.meta.env.DEV) {
        console.log(`[SharedWorker API] Deduplicating in-flight request: ${url}`)
      }
      return this.inFlightRequests.get(dedupeKey)!
    }

    const requestPromise = (async (): Promise<WorkerApiResponsePayload<T>> => {
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      }

      if (this.activeTenantId && !requestHeaders['X-Tenant-Id']) {
        requestHeaders['X-Tenant-Id'] = this.activeTenantId
      }

      if (this.activeAuthToken && !requestHeaders['Authorization']) {
        requestHeaders['Authorization'] = `Bearer ${this.activeAuthToken}`
      }

      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeout)

      try {
        const response = await fetch(url, {
          method: upperMethod,
          headers: requestHeaders,
          body,
          signal: controller.signal,
          credentials: 'include',
        })

        clearTimeout(timer)

        const responseHeaders: Record<string, string> = {}
        response.headers.forEach((val, key) => {
          responseHeaders[key] = val
        })

        let data: any = null

        if (response.status !== 204) {
          if (responseType === 'arraybuffer') {
            data = await response.arrayBuffer()
          } else if (responseType === 'blob') {
            data = await response.blob()
          } else if (responseType === 'text') {
            data = await response.text()
          } else if (responseType === 'formData') {
            data = await response.formData()
          } else {
            try {
              data = await response.json()
            } catch {
              data = null
            }
          }
        }

        return {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          data,
          headers: responseHeaders,
        }
      } catch (err: any) {
        clearTimeout(timer)

        const isAbort = err?.name === 'AbortError'
        return {
          ok: false,
          status: 0,
          statusText: isAbort ? 'Request Timeout' : 'Network Error',
          data: null as any,
          headers: {},
          error: err?.message || 'Network Error',
        }
      } finally {
        if (dedupeKey) {
          this.inFlightRequests.delete(dedupeKey)
        }
      }
    })()

    if (dedupeKey) {
      this.inFlightRequests.set(dedupeKey, requestPromise)
    }

    return requestPromise
  }
}

const serviceInstance = new SharedApiService()

// Listen for SharedWorker connection events (multi-tab)
if (typeof self !== 'undefined' && 'onconnect' in self) {
  ;(self as any).onconnect = (event: MessageEvent) => {
    const port = event.ports[0]
    Comlink.expose(serviceInstance, port)
  }
} else if (typeof self !== 'undefined') {
  // Dedicated Worker fallback
  Comlink.expose(serviceInstance)
}
