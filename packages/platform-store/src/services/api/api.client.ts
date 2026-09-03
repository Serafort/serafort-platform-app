import { secureTokenManager, TokenData } from "../secureTokenManager";
import StorageManager from "../storage/storage.service";
import { resolveContractPath } from "@cap/api-contracts";
import type {
  AnyContract,
  ContractArgs,
  ContractRequest,
  ContractResponse,
} from "@cap/api-contracts";

export { ENDPOINTS, QUERY_KEYS, API_CONTRACTS } from "@cap/api-contracts";

const getBaseURL = (): string => {
  const envApiUrl = import.meta.env.VITE_API_URL;
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;

  if (!envApiUrl) {
    if (isDev) {
      console.warn('VITE_API_URL not set, using default: ""');
      return "";
    }
    console.error("VITE_API_URL not configured for production");
    throw new Error("VITE_API_URL must be configured in production");
  }

  if (isProd && !envApiUrl.startsWith("https://")) {
    console.error("❌ CRITICAL: Production API must use HTTPS!");
    throw new Error("Production API must use HTTPS protocol");
  }

  return envApiUrl;
};

export const API_CONFIG = {
  baseURL: getBaseURL(),
  timeout: import.meta.env.VITE_API_TIMEOUT
    ? Number(import.meta.env.VITE_API_TIMEOUT)
    : 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;

// ---------------------------------------------------------------------------
// Tenant-aware request context
// Registers the resolved tenant id so every outbound request is scoped to the
// active tenant. The header is only attached once a tenant is known (set by the
// TenantProvider after tenant config resolution) and can be overridden
// per-request via FetchRequestConfig.headers.
// ---------------------------------------------------------------------------
export const TENANT_ID_HEADER = "X-Tenant-Id";
export const IMPERSONATION_SESSION_HEADER = "X-Impersonation-Session-Id";
export const IMPERSONATION_REASON_HEADER = "X-Impersonation-Audit-Reason";
export const IMPERSONATION_ACTOR_HEADER = "X-Impersonation-Actor-Id";

let currentTenantId: string | null = null;
let currentImpersonationSession: ImpersonationSession | null = null;

export function setTenantId(tenantId: string | null | undefined): void {
  currentTenantId = tenantId ?? null;
}

export function getTenantId(): string | null {
  return currentTenantId;
}

export function setImpersonationContext(
  session: ImpersonationSession | null,
): void {
  currentImpersonationSession = session;
}

export function getImpersonationContext(): ImpersonationSession | null {
  return currentImpersonationSession;
}

export type GlobalNotificationPayload = {
  title: string;
  message: string;
  type: "error" | "warning" | "info" | "success";
};

export type GlobalNotificationHandler = (
  notification: GlobalNotificationPayload,
) => void;

let globalNotificationHandler: GlobalNotificationHandler | null = null;

export function setGlobalNotificationHandler(
  handler: GlobalNotificationHandler | null,
): void {
  globalNotificationHandler = handler;
}

export function emitGlobalNotification(
  notification: GlobalNotificationPayload,
): void {
  try {
    if (globalNotificationHandler) {
      globalNotificationHandler(notification);
    }
  } catch {}
}

import {
  RefreshResponseDto,
  ApiResponse,
  PaginatedResponse,
  ApiErrorResponse,
  ImpersonationSession,
} from "@cap/shared-types";
import { ENDPOINTS } from "@cap/api-contracts";

export type { ApiResponse, PaginatedResponse, ApiErrorResponse };

export interface FetchRequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  data?: unknown;
  timeout?: number;
  responseType?: "json" | "text" | "blob" | "arraybuffer" | "formData";
  _retry?: boolean;
  skipGlobalNotification?: boolean;
}

export interface FetchResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: FetchRequestConfig;
  ok: boolean;
}

const DB_ERROR_PATTERNS = [
  /syntax error at or near/i,
  /pg_/i,
  /relation ".*" does not exist/i,
  /column ".*" does not exist/i,
  /violates.*constraint/i,
  /duplicate key value/i,
  /deadlock detected/i,
  /QueryFailedError/i,
  /Sequelize/i,
  /TypeORM/i,
  /Prisma/i,
  /SQLSTATE/i,
  /ORA-\d+/i,
  /ER_DUP_ENTRY/i,
  /MongoError/i,
  /select .* from/i,
  /insert into/i,
  /update .* set/i,
  /delete from/i,
];

export function sanitizeErrorMessage(
  rawMessage: unknown,
  status?: number,
): { message: string; i18nKey: string } {
  const str =
    typeof rawMessage === "string"
      ? rawMessage
      : (rawMessage as any)?.message || "";

  // If string matches DB/ORM traces or raw SQL leak, return sanitized server error
  const isDbLeak = DB_ERROR_PATTERNS.some((pattern) => pattern.test(str));

  if (isDbLeak || (status && status >= 500)) {
    return {
      message: "A server error occurred. Please try again later.",
      i18nKey: "errors.server_error",
    };
  }

  if (status === 400) {
    return {
      message: str || "Invalid request parameters.",
      i18nKey: "errors.bad_request",
    };
  }
  if (status === 401) {
    return {
      message: str || "Your session has expired or you are unauthorized.",
      i18nKey: "errors.unauthorized",
    };
  }
  if (status === 403) {
    return {
      message: str || "You do not have permission to perform this action.",
      i18nKey: "errors.forbidden",
    };
  }
  if (status === 404) {
    return {
      message: str || "The requested resource was not found.",
      i18nKey: "errors.not_found",
    };
  }
  if (status === 409) {
    return {
      message: str || "A resource conflict occurred. Please refresh.",
      i18nKey: "errors.conflict",
    };
  }
  if (status === 422) {
    return {
      message: str || "Validation failed. Please check your input.",
      i18nKey: "errors.validation_error",
    };
  }
  if (status === 423) {
    return {
      message: str || "This account or resource is temporarily locked.",
      i18nKey: "errors.locked",
    };
  }
  if (status === 429) {
    return {
      message: str || "Too many requests. Please slow down and try again.",
      i18nKey: "errors.rate_limit",
    };
  }
  if (status && status >= 500) {
    return {
      message: "A server error occurred. Please try again later.",
      i18nKey: "errors.server_error",
    };
  }

  return {
    message: str || "An unexpected error occurred.",
    i18nKey: "errors.unknown",
  };
}

export class AppError extends Error {
  config?: FetchRequestConfig;
  response?: FetchResponse<unknown>;
  code?: string;
  status: number;
  i18nKey: string;
  userMessage: string;
  errors?: Record<string, string[]>;

  constructor(options: {
    message?: string;
    userMessage?: string;
    i18nKey?: string;
    config?: FetchRequestConfig;
    response?: FetchResponse<unknown>;
    code?: string;
    status?: number;
    errors?: Record<string, string[]>;
  }) {
    const sanitized = sanitizeErrorMessage(
      options.userMessage || options.message,
      options.status,
    );
    const finalMsg = options.userMessage || sanitized.message;
    super(finalMsg);
    this.name = "AppError";
    this.config = options.config;
    this.response = options.response;
    this.code =
      options.code ||
      (options.status ? String(options.status) : "UNKNOWN_ERROR");
    this.status = options.status || (options.response?.status ?? 0);
    this.i18nKey = options.i18nKey || sanitized.i18nKey;
    this.userMessage = finalMsg;
    this.errors = options.errors;
  }
}

export function isAppError(error: unknown): error is AppError {
  return (
    error instanceof AppError ||
    (typeof error === "object" &&
      error !== null &&
      (error as any).name === "AppError")
  );
}

export class HttpError extends AppError {
  request?: Request;

  constructor(
    message: string,
    config: FetchRequestConfig,
    response?: FetchResponse<unknown>,
    code?: string,
    errors?: Record<string, string[]>,
  ) {
    const status = response?.status ?? 0;
    const sanitized = sanitizeErrorMessage(message, status);
    super({
      message,
      userMessage: sanitized.message,
      i18nKey: sanitized.i18nKey,
      config,
      response,
      code,
      status,
      errors,
    });
    this.name = "HttpError";
  }
}

export type TerminalErrorHandler = () => void;
const terminalErrorHandlers: Set<TerminalErrorHandler> = new Set();

export const onTerminalError = (handler: TerminalErrorHandler) => {
  terminalErrorHandlers.add(handler);
  return () => terminalErrorHandlers.delete(handler);
};

const notifyTerminalError = () => {
  console.error(
    "[FetchClient] Terminal authentication failure, notifying subscribers",
  );
  terminalErrorHandlers.forEach((handler) => handler());
};

export type ForbiddenErrorHandler = () => void;
const forbiddenErrorHandlers: Set<ForbiddenErrorHandler> = new Set();

export const onForbiddenError = (handler: ForbiddenErrorHandler) => {
  forbiddenErrorHandlers.add(handler);
  return () => forbiddenErrorHandlers.delete(handler);
};

const notifyForbiddenError = () => {
  console.error("[FetchClient] Access forbidden (403), notifying subscribers");
  forbiddenErrorHandlers.forEach((handler) => handler());
};

export type BeforeRequestHandler = (
  endpoint: string,
  config: FetchRequestConfig,
) => void;
const beforeRequestHandlers: Set<BeforeRequestHandler> = new Set();

/**
 * Registers a synchronous pre-request hook. Handlers may throw to block the
 * request (e.g. client-side policy denial via @cap/authorization) or mutate
 * the config before it is sent. Returns an unsubscribe function.
 */
export const onBeforeRequest = (
  handler: BeforeRequestHandler,
): (() => void) => {
  beforeRequestHandlers.add(handler);
  return () => beforeRequestHandlers.delete(handler);
};

class TokenRefreshManager {
  private isRefreshing = false;
  private isPaused = false;
  private refreshPromise: Promise<string> | null = null;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
  }> = [];
  private channel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.channel = new BroadcastChannel("cap_token_refresh_sync");
        this.channel.onmessage = (event: MessageEvent) => {
          if (!event.data) return;
          if (event.data.type === "REFRESH_STARTED") {
            this.isRefreshing = true;
          } else if (
            event.data.type === "REFRESH_SUCCESS" &&
            event.data.token
          ) {
            this.isRefreshing = false;
            this.refreshPromise = null;
            this.isPaused = false;
            this.processQueue(null, event.data.token);
          } else if (event.data.type === "REFRESH_FAILURE") {
            this.isRefreshing = false;
            this.refreshPromise = null;
            this.processQueue(
              new Error(event.data.error || "Cross-tab refresh failure"),
              null,
            );
          }
        };
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn(
            "[TokenRefreshManager] BroadcastChannel init error:",
            err,
          );
        }
      }
    }
  }

  private broadcast(message: { type: string; token?: string; error?: string }) {
    try {
      this.channel?.postMessage(message);
    } catch {
      // Ignore broadcast errors
    }
  }

  private processQueue(error: unknown = null, token: string | null = null) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else if (token) {
        promise.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private async refreshTokenRequest(): Promise<string> {
    try {
      const response = await fetch(
        `${API_CONFIG.baseURL}${ENDPOINTS.auth.refresh}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(`Refresh failed with status ${response.status}`);
      }

      const data: RefreshResponseDto = await response.json();

      const accessToken = data.access_token;
      const expiresIn = data.expires_in || 3600;

      if (!accessToken) {
        throw new Error("No access token in refresh response");
      }

      const expiresAt = Date.now() + expiresIn * 1000;

      const newTokens: TokenData = {
        accessToken,
        expiresAt,
      };

      secureTokenManager.setTokens(newTokens);

      return accessToken;
    } catch (error) {
      console.error("[Token Refresh] Failed:", (error as Error).message);
      throw error;
    }
  }

  private handleRefreshFailure() {
    secureTokenManager.clearTokens();

    try {
      StorageManager.clearAllUserData();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log(`exception: ${error}`);
      }
    }

    console.warn(
      "[TokenRefreshManager] Token refresh failed, tokens cleared. Application should redirect to login.",
    );

    notifyTerminalError();
  }

  async attemptRefresh(): Promise<string> {
    if (this.isPaused) {
      if (import.meta.env.DEV) {
        console.log(
          "[TokenRefreshManager] Queue is paused, waiting for online status",
        );
      }
      return new Promise((resolve, reject) => {
        this.queueRequest(resolve, reject);
      });
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.broadcast({ type: "REFRESH_STARTED" });

    this.refreshPromise = (async () => {
      this.isRefreshing = true;

      try {
        const token = await this.refreshTokenRequest();
        this.isPaused = false;
        this.processQueue(null, token);
        this.broadcast({ type: "REFRESH_SUCCESS", token });
        return token;
      } catch (error) {
        const isNetworkError =
          (error instanceof TypeError &&
            (error.message === "Failed to fetch" ||
              error.message.includes("NetworkError"))) ||
          (error as { status?: number }).status === 0 ||
          (error as { code?: string }).code === "NETWORK_ERROR";

        if (isNetworkError) {
          console.warn(
            "[TokenRefreshManager] Network failure detected during refresh. Pausing queue.",
          );
          this.isPaused = true;
          this.isRefreshing = false;
          this.refreshPromise = null;
          this.broadcast({
            type: "REFRESH_FAILURE",
            error: "Network error during token refresh",
          });
          throw error;
        }

        const isAuthFailure =
          (error as { status?: number }).status === 400 ||
          (error as { status?: number }).status === 401 ||
          (error as { status?: number }).status === 403;

        if (isAuthFailure) {
          this.handleRefreshFailure();
          this.processQueue(error, null);
          this.broadcast({
            type: "REFRESH_FAILURE",
            error: (error as Error)?.message || "Auth failure",
          });
          throw error;
        }

        this.processQueue(error, null);
        this.broadcast({
          type: "REFRESH_FAILURE",
          error: (error as Error)?.message,
        });
        throw error;
      } finally {
        if (!this.isPaused) {
          this.isRefreshing = false;
          this.refreshPromise = null;
        }
      }
    })();

    return this.refreshPromise;
  }

  resume() {
    if (!this.isPaused) return;
    if (import.meta.env.DEV) {
      console.log("[TokenRefreshManager] Resuming queue...");
    }
    this.isPaused = false;
    this.attemptRefresh();
  }

  isRefreshInProgress(): boolean {
    return this.isRefreshing || this.isPaused;
  }

  queueRequest(
    resolve: (token: string) => void,
    reject: (error: unknown) => void,
  ) {
    this.failedQueue.push({ resolve, reject });
  }
}

export const refreshManager = new TokenRefreshManager();

export class FetchClient {
  public readonly baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private withCredentials: boolean;

  constructor(config: {
    baseURL: string;
    headers?: Record<string, string>;
    timeout?: number;
    withCredentials?: boolean;
  }) {
    this.baseURL = config.baseURL;
    this.defaultHeaders = config.headers || {};
    this.timeout = config.timeout || 15000;
    this.withCredentials = config.withCredentials || false;
  }

  public async request<T = unknown>(
    endpoint: string,
    config: FetchRequestConfig = {},
  ): Promise<FetchResponse<T>> {
    for (const handler of beforeRequestHandlers) {
      handler(endpoint, config);
    }
    let url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseURL}${endpoint}`;

    if (config.params) {
      const params = new URLSearchParams();
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        url += `${url.includes("?") ? "&" : "?"}${queryString}`;
      }
    }

    const headers = new Headers(config.headers);
    Object.entries(this.defaultHeaders).forEach(([key, value]) => {
      if (!headers.has(key)) {
        headers.set(key, value);
      }
    });

    const effectiveTenantId =
      currentTenantId ||
      (typeof window !== "undefined"
        ? localStorage.getItem("cap_active_tenant_id")
        : null);

    if (effectiveTenantId && !headers.has(TENANT_ID_HEADER)) {
      headers.set(TENANT_ID_HEADER, effectiveTenantId);
    }

    if (!headers.has("X-Request-ID")) {
      headers.set(
        "X-Request-ID",
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`,
      );
    }

    if (currentImpersonationSession) {
      if (!headers.has(IMPERSONATION_SESSION_HEADER)) {
        headers.set(
          IMPERSONATION_SESSION_HEADER,
          currentImpersonationSession.sessionId,
        );
      }
      if (
        currentImpersonationSession.reason &&
        !headers.has(IMPERSONATION_REASON_HEADER)
      ) {
        headers.set(
          IMPERSONATION_REASON_HEADER,
          currentImpersonationSession.reason,
        );
      }
      if (
        currentImpersonationSession.actorUserId &&
        !headers.has(IMPERSONATION_ACTOR_HEADER)
      ) {
        headers.set(
          IMPERSONATION_ACTOR_HEADER,
          String(currentImpersonationSession.actorUserId),
        );
      }
    }

    if (!endpoint.includes(ENDPOINTS.auth.refresh)) {
      await secureTokenManager.ensureInitialized();

      const tokens = secureTokenManager.getTokens();

      if (tokens) {
        if (secureTokenManager.isTokenExpired()) {
          try {
            let newToken: string;
            if (refreshManager.isRefreshInProgress()) {
              newToken = await new Promise<string>((resolve, reject) => {
                refreshManager.queueRequest(resolve, reject);
              });
            } else {
              newToken = await refreshManager.attemptRefresh();
            }
            headers.set("Authorization", `Bearer ${newToken}`);
          } catch {
            console.error("[Fetch Client] Token refresh pre-check failed");
          }
        } else if (tokens.accessToken) {
          headers.set("Authorization", `Bearer ${tokens.accessToken}`);
        }
      }
    }

    const timeout =
      config.timeout !== undefined ? config.timeout : this.timeout;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    let body = config.body;
    if (config.data) {
      if (config.data instanceof FormData) {
        body = config.data;
        headers.delete("Content-Type");
      } else {
        body = JSON.stringify(config.data);
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }
      }
    }

    const fetchConfig: RequestInit = {
      ...config,
      headers,
      body,
      signal: controller.signal,
      credentials:
        config.credentials || (this.withCredentials ? "include" : undefined),
    };

    try {
      const response = await fetch(url, fetchConfig);
      clearTimeout(id);

      const responseData = await this.parseResponse(
        response,
        config.responseType,
      );

      const result: FetchResponse<T> = {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config,
        ok: response.ok,
      };

      if (!response.ok) {
        if (
          response.status === 401 &&
          !config._retry &&
          !endpoint.includes(ENDPOINTS.auth.refresh) &&
          !endpoint.includes(ENDPOINTS.auth.login)
        ) {
          config._retry = true;
          try {
            let newToken: string;
            if (refreshManager.isRefreshInProgress()) {
              newToken = await new Promise<string>((resolve, reject) => {
                refreshManager.queueRequest(resolve, reject);
              });
            } else {
              newToken = await refreshManager.attemptRefresh();
            }

            const newHeaders = new Headers(config.headers);
            newHeaders.set("Authorization", `Bearer ${newToken}`);

            return this.request<T>(endpoint, {
              ...config,
              headers: Object.fromEntries(newHeaders.entries()),
            });
          } catch {
            throw new HttpError(
              "Token refresh failed",
              config,
              result,
              "REFRESH_FAILED",
            );
          }
        }

        if (response.status === 403) {
          notifyForbiddenError();
        }

        const rawMsg =
          (responseData as { message?: string; error?: string })?.message ||
          (responseData as { error?: string })?.error ||
          `Request failed with status ${response.status}`;
        const errorDetails = (
          responseData as { errors?: Record<string, string[]> }
        )?.errors;
        const httpError = new HttpError(
          rawMsg,
          config,
          result,
          String(response.status),
          errorDetails,
        );

        if (!config.skipGlobalNotification && response.status !== 401) {
          emitGlobalNotification({
            title: response.status >= 500 ? "Server Error" : "Request Notice",
            message: httpError.userMessage,
            type: response.status >= 500 ? "error" : "warning",
          });
        }

        throw httpError;
      }

      return result;
    } catch (error) {
      clearTimeout(id);
      if (error instanceof HttpError) throw error;

      if ((error as { name?: string }).name === "AbortError") {
        const timeoutError = new HttpError(
          "Request timeout",
          config,
          undefined,
          "TIMEOUT",
        );
        if (!config.skipGlobalNotification) {
          emitGlobalNotification({
            title: "Request Timeout",
            message: timeoutError.userMessage,
            type: "error",
          });
        }
        throw timeoutError;
      }

      const minimalResponse: FetchResponse<null> = {
        data: null,
        status: 0,
        statusText: "Network Error",
        headers: new Headers(),
        config,
        ok: false,
      };
      const netError = new HttpError(
        (error as Error).message || "Network Error",
        config,
        minimalResponse,
        "NETWORK_ERROR",
      );
      if (!config.skipGlobalNotification) {
        emitGlobalNotification({
          title: "Network Error",
          message: netError.userMessage,
          type: "error",
        });
      }
      throw netError;
    }
  }

  private async parseResponse(response: Response, responseType?: string) {
    if (response.status === 204) return null;

    if (responseType === "blob") return response.blob();
    if (responseType === "text") return response.text();
    if (responseType === "arraybuffer") return response.arrayBuffer();
    if (responseType === "formData") return response.formData();

    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  get<T = unknown>(url: string, config?: FetchRequestConfig) {
    return this.request<T>(url, { ...config, method: "GET" });
  }

  post<T = unknown>(url: string, data?: unknown, config?: FetchRequestConfig) {
    return this.request<T>(url, { ...config, method: "POST", data });
  }

  put<T = unknown>(url: string, data?: unknown, config?: FetchRequestConfig) {
    return this.request<T>(url, { ...config, method: "PUT", data });
  }

  patch<T = unknown>(url: string, data?: unknown, config?: FetchRequestConfig) {
    return this.request<T>(url, { ...config, method: "PATCH", data });
  }

  delete<T = unknown>(url: string, config?: FetchRequestConfig) {
    return this.request<T>(url, { ...config, method: "DELETE" });
  }
}

export const fetchClient = new FetchClient({
  baseURL: API_CONFIG.baseURL,
  headers: { ...API_CONFIG.headers },
  timeout: API_CONFIG.timeout,
  withCredentials: API_CONFIG.withCredentials,
});

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
    const url = resolveContractPath(contract, ...args);
    switch (contract.method) {
      case "GET":
        return this.instance.get<ContractResponse<C>>(url, config);
      case "POST":
        return this.instance.post<ContractResponse<C>>(url, data, config);
      case "PUT":
        return this.instance.put<ContractResponse<C>>(url, data, config);
      case "PATCH":
        return this.instance.patch<ContractResponse<C>>(url, data, config);
      case "DELETE":
        return this.instance.delete<ContractResponse<C>>(url, config);
      default:
        throw new HttpError(
          `Unsupported HTTP method: ${contract.method}`,
          config || {},
        );
    }
  }

  async request<T = unknown>(
    endpoint: string,
    config: FetchRequestConfig = {},
  ): Promise<FetchResponse<T>> {
    return this.instance.request<T>(endpoint, config);
  }

  async get<T = unknown>(
    url: string,
    config?: FetchRequestConfig,
  ): Promise<FetchResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: FetchRequestConfig,
  ): Promise<FetchResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: FetchRequestConfig,
  ): Promise<FetchResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: FetchRequestConfig,
  ): Promise<FetchResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }

  async delete<T = unknown>(
    url: string,
    config?: FetchRequestConfig,
  ): Promise<FetchResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  async uploadFile<T = unknown>(
    url: string,
    files: File | Array<File>,
    fieldName = "file",
    additionalData?: Record<string, unknown>,
  ): Promise<FetchResponse<T>> {
    const formData = new FormData();

    if (Array.isArray(files))
      files.forEach((file) => formData.append(fieldName, file));
    else formData.append(fieldName, files);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== null && value !== undefined)
          formData.append(key, String(value));
      });
    }

    return this.instance.post<T>(url, formData);
  }

  async uploadFormData<T = unknown>(
    url: string,
    data: Record<string, unknown>,
    method: "post" | "put" | "patch" = "post",
  ): Promise<FetchResponse<T>> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) formData.append(key, value);
        else if (Array.isArray(value))
          value.forEach((item) => formData.append(key, item));
        else formData.append(key, String(value));
      }
    });

    return this.instance[method]<T>(url, formData);
  }

  get baseURL() {
    return this.instance.baseURL;
  }

  async getWithFallback<T = unknown>(
    url: string,
    fallbackData: T,
    config?: FetchRequestConfig,
  ): Promise<FetchResponse<T>> {
    try {
      return await this.instance.get<T>(url, config);
    } catch (error) {
      console.warn(`Failed to fetch ${url}, using fallback data`, error);
      return {
        data: fallbackData,
        status: 200,
        statusText: "OK (Fallback)",
        headers: new Headers(),
        config: config || {},
        ok: true,
      } as FetchResponse<T>;
    }
  }
}

export function handleApiError(error: unknown): ApiErrorResponse {
  if (isAppError(error)) {
    return {
      message: error.userMessage,
      errors: error.errors as Record<string, string[]> | undefined,
      status: error.status,
      code: error.code,
    };
  }

  if (
    (
      error as {
        response?: {
          data?: { message?: string; code?: string; error?: string };
          status?: number;
        };
      }
    ).response
  ) {
    const err = error as {
      response: {
        data?: { message?: string; code?: string; error?: string };
        status?: number;
      };
    };
    const rawMsg =
      err.response.data?.message ||
      err.response.data?.error ||
      "An error occurred";
    const sanitized = sanitizeErrorMessage(rawMsg, err.response.status);
    return {
      message: sanitized.message,
      errors: (err.response.data as any)?.errors as
        | Record<string, string[]>
        | undefined,
      status: err.response.status || 0,
      code:
        err.response.data?.code ||
        (err.response.status ? String(err.response.status) : undefined),
    };
  }

  if ((error as { request?: unknown }).request) {
    return {
      message: "No response from server. Please check your connection.",
      status: 0,
      code: "NETWORK_ERROR",
    };
  }

  const raw = (error as Error)?.message || "An unexpected error occurred";
  const sanitized = sanitizeErrorMessage(raw);

  return {
    message: sanitized.message,
    status: 0,
    code: "UNKNOWN_ERROR",
  };
}

export function isApiError(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "status" in error
  );
}

export const apiClient = new ApiClient();

export default fetchClient;
