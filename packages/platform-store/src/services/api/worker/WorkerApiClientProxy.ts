import type { FetchRequestConfig, FetchResponse } from '../api.client'
import type { WorkerResponsePayload } from './api.worker'

export class WorkerApiClientProxy {
  private worker: Worker
  private pendingRequests = new Map<
    string,
    {
      resolve: (response: FetchResponse<any>) => void
      reject: (error: any) => void
      config: FetchRequestConfig
    }
  >()

  constructor(worker: Worker) {
    this.worker = worker
    this.worker.onmessage = this.handleWorkerMessage.bind(this)
    this.worker.onerror = this.handleWorkerError.bind(this)
  }

  private handleWorkerMessage(event: MessageEvent<WorkerResponsePayload>) {
    const { id, ok, status, statusText, data, headers: rawHeaders, error } = event.data
    const pending = this.pendingRequests.get(id)
    if (!pending) return

    this.pendingRequests.delete(id)

    const headers = new Headers(rawHeaders)

    const response: FetchResponse<any> = {
      data,
      status,
      statusText,
      headers,
      config: pending.config,
      ok,
    }

    if (!ok && error) {
      pending.reject(new Error(error))
    } else {
      pending.resolve(response)
    }
  }

  private handleWorkerError(error: ErrorEvent) {
    console.error('[WorkerApiClientProxy] Web Worker Error:', error)
    this.pendingRequests.forEach(({ reject }) => {
      reject(new Error('Web Worker Error: ' + error.message))
    })
    this.pendingRequests.clear()
  }

  public syncTenantId(tenantId: string | null) {
    this.worker.postMessage({
      id: 'sync-tenant',
      type: 'SYNC_STATE',
      payload: { tenantId },
    })
  }

  public syncAuthToken(authToken: string | null) {
    this.worker.postMessage({
      id: 'sync-auth',
      type: 'SYNC_STATE',
      payload: { authToken },
    })
  }

  public request<T = unknown>(
    url: string,
    config: FetchRequestConfig = {}
  ): Promise<FetchResponse<T>> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    let body: string | undefined = undefined
    if (config.data) {
      body = typeof config.data === 'string' ? config.data : JSON.stringify(config.data)
    } else if (typeof config.body === 'string') {
      body = config.body
    }

    const payload = {
      url,
      method: (config.method || 'GET').toUpperCase(),
      headers: (config.headers as Record<string, string>) || {},
      body,
      timeout: config.timeout,
      responseType: config.responseType || 'json',
    }

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, { resolve, reject, config })
      this.worker.postMessage({
        id: requestId,
        type: 'REQUEST',
        payload,
      })
    })
  }

  public get<T = unknown>(url: string, config?: FetchRequestConfig) {
    return this.request<T>(url, { ...config, method: 'GET' })
  }

  public post<T = unknown>(url: string, data?: unknown, config?: FetchRequestConfig) {
    return this.request<T>(url, { ...config, method: 'POST', data })
  }

  public put<T = unknown>(url: string, data?: unknown, config?: FetchRequestConfig) {
    return this.request<T>(url, { ...config, method: 'PUT', data })
  }

  public patch<T = unknown>(url: string, data?: unknown, config?: FetchRequestConfig) {
    return this.request<T>(url, { ...config, method: 'PATCH', data })
  }

  public delete<T = unknown>(url: string, config?: FetchRequestConfig) {
    return this.request<T>(url, { ...config, method: 'DELETE' })
  }

  public terminate() {
    this.worker.terminate()
    this.pendingRequests.clear()
  }
}
