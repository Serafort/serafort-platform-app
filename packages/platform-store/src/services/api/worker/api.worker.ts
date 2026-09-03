/**
 * Web Worker for API network requests.
 * Runs fetch execution, header processing, and JSON parsing completely off the main UI thread.
 */

export interface WorkerApiMessage {
  id: string;
  type: "REQUEST" | "SYNC_STATE";
  payload: any;
}

export interface WorkerRequestPayload {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timeout?: number;
  responseType?: "json" | "text" | "arraybuffer";
}

export interface WorkerResponsePayload {
  id: string;
  ok: boolean;
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
  error?: string;
}

let activeTenantId: string | null = null;
let activeAuthToken: string | null = null;

const workerScope: any = typeof self !== "undefined" ? self : null;

if (workerScope) {
  workerScope.onmessage = async (event: MessageEvent<WorkerApiMessage>) => {
    const { id, type, payload } = event.data;

    if (type === "SYNC_STATE") {
      if ("tenantId" in payload) activeTenantId = payload.tenantId;
      if ("authToken" in payload) activeAuthToken = payload.authToken;
      workerScope.postMessage({
        id,
        ok: true,
        status: 200,
        statusText: "OK",
        data: null,
        headers: {},
      });
      return;
    }

    if (type === "REQUEST") {
      const {
        url,
        method,
        headers = {},
        body,
        timeout = 30000,
        responseType = "json",
      }: WorkerRequestPayload = payload;

      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      };

      if (activeTenantId && !requestHeaders["X-Tenant-Id"]) {
        requestHeaders["X-Tenant-Id"] = activeTenantId;
      }

      if (activeAuthToken && !requestHeaders["Authorization"]) {
        requestHeaders["Authorization"] = `Bearer ${activeAuthToken}`;
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body,
          signal: controller.signal,
          credentials: "include",
        });

        clearTimeout(timer);

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((val, key) => {
          responseHeaders[key] = val;
        });

        let data: any = null;
        let transferables: Transferable[] = [];

        if (response.status !== 204) {
          if (responseType === "arraybuffer") {
            const buffer = await response.arrayBuffer();
            data = buffer;
            transferables = [buffer];
          } else if (responseType === "text") {
            data = await response.text();
          } else {
            try {
              data = await response.json();
            } catch {
              data = null;
            }
          }
        }

        const workerResponse: WorkerResponsePayload = {
          id,
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          data,
          headers: responseHeaders,
        };

        workerScope.postMessage(workerResponse, { transfer: transferables });
      } catch (err: any) {
        clearTimeout(timer);

        const isAbort = err?.name === "AbortError";
        const workerResponse: WorkerResponsePayload = {
          id,
          ok: false,
          status: 0,
          statusText: isAbort ? "Request Timeout" : "Network Error",
          data: null,
          headers: {},
          error: err?.message || "Network Error",
        };

        workerScope.postMessage(workerResponse);
      }
    }
  };
}
