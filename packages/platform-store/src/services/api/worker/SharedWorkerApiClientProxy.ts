import * as Comlink from "comlink";
import type {
  SharedApiService,
  WorkerApiRequestPayload,
} from "./api.shared-worker";
import type { FetchRequestConfig, FetchResponse } from "../api.client";

export class SharedWorkerApiClientProxy {
  private rpc: Comlink.Remote<SharedApiService>;

  constructor(worker: SharedWorker | Worker) {
    if ("port" in worker) {
      // SharedWorker: wrap the MessagePort
      worker.port.start();
      this.rpc = Comlink.wrap<SharedApiService>(worker.port);
    } else {
      // Dedicated Worker: wrap worker directly
      this.rpc = Comlink.wrap<SharedApiService>(worker);
    }
  }

  public async syncTenantId(tenantId: string | null): Promise<void> {
    await this.rpc.setTenantId(tenantId);
  }

  public async syncAuthToken(authToken: string | null): Promise<void> {
    await this.rpc.setAuthToken(authToken);
  }

  public async request<T = unknown>(
    url: string,
    config: FetchRequestConfig = {},
  ): Promise<FetchResponse<T>> {
    let body: string | undefined = undefined;
    if (config.data) {
      body =
        typeof config.data === "string"
          ? config.data
          : JSON.stringify(config.data);
    } else if (typeof config.body === "string") {
      body = config.body;
    }

    const payload: WorkerApiRequestPayload = {
      url,
      method: (config.method || "GET").toUpperCase(),
      headers: (config.headers as Record<string, string>) || {},
      body,
      timeout: config.timeout,
      responseType: config.responseType || "json",
    };

    const res = await this.rpc.executeRequest(payload);

    const responseHeaders = new Headers(res.headers);

    const fetchResponse: FetchResponse<T> = {
      data: res.data as T,
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
      config,
      ok: res.ok,
    };

    if (!res.ok && res.error) {
      throw new Error(res.error);
    }

    return fetchResponse;
  }

  public get<T = unknown>(url: string, config?: FetchRequestConfig) {
    return this.request<T>(url, { ...config, method: "GET" });
  }

  public post<T = unknown>(
    url: string,
    data?: unknown,
    config?: FetchRequestConfig,
  ) {
    return this.request<T>(url, { ...config, method: "POST", data });
  }

  public put<T = unknown>(
    url: string,
    data?: unknown,
    config?: FetchRequestConfig,
  ) {
    return this.request<T>(url, { ...config, method: "PUT", data });
  }

  public patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: FetchRequestConfig,
  ) {
    return this.request<T>(url, { ...config, method: "PATCH", data });
  }

  public delete<T = unknown>(url: string, config?: FetchRequestConfig) {
    return this.request<T>(url, { ...config, method: "DELETE" });
  }
}
