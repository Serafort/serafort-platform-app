import { useAppStore } from "@cap/platform-store";
import { HttpMethodEnum } from "@cap/shared-types";
import {
  PolicyAction,
  PolicyResource,
  PolicyActionEnum,
} from "../types/policy.types";
import { policyEngine } from "../engine/engine";
import { buildSubject } from "../subject/buildSubject";

/**
 * Minimal structural shape of the request config passed to `beforeRequest`
 * hooks. Kept loose so the enforcer can attach to any fetch-style client
 * (e.g. `FetchClient` from `@cap/platform-store`) without a hard dependency.
 */
export interface FetchRequestLike {
  method?: string;
  data?: unknown;
}

export interface FetchAuthEnforcerOptions {
  /**
   * Block requests client-side before they hit the network. Defaults to
   * `false`; when disabled the enforcer is a no-op (the server remains the
   * authoritative 403 gate).
   */
  optimisticDeny?: boolean;
  /**
   * Map an outgoing request (endpoint + config) to a `PolicyResource`.
   * Returning `undefined` lets the request pass through unguarded.
   */
  getResource?: (
    endpoint: string,
    config: FetchRequestLike,
  ) => PolicyResource | undefined;
  /** Map HTTP method to a PolicyAction (default: GET/HEAD->read, POST/PUT/PATCH->write, DELETE->delete) */
  getAction?: (method?: string) => PolicyAction;
  /** Invoked when a request is blocked client-side */
  onDenied?: (info: {
    endpoint: string;
    action: PolicyAction;
    resource: PolicyResource;
  }) => void;
}

/**
 * Thrown by the enforcer when a request is blocked by policy before it is sent.
 */
export class AuthorizationBlockedError extends Error {
  isAuthBlocked = true;

  constructor(message: string) {
    super(message);
    this.name = "AuthorizationBlockedError";
  }
}

export interface FetchAuthEnforcer {
  /** Synchronous pre-request hook; throws `AuthorizationBlockedError` on deny. */
  beforeRequest: (endpoint: string, config: FetchRequestLike) => void;
}

/**
 * Creates a fetch-based API authorization enforcer. Register the returned
 * `beforeRequest` hook on a fetch client's pre-request pipeline (e.g.
 * `onBeforeRequest` from `@cap/platform-store`).
 */
export function createFetchApiAuthEnforcer(
  options: FetchAuthEnforcerOptions = {},
): FetchAuthEnforcer {
  const defaultGetAction = (method?: string): PolicyAction => {
    const m = (method || "GET").toUpperCase();
    if (m === HttpMethodEnum.GET || m === "HEAD") return PolicyActionEnum.READ;
    if (
      m === HttpMethodEnum.POST ||
      m === HttpMethodEnum.PUT ||
      m === HttpMethodEnum.PATCH
    )
      return PolicyActionEnum.WRITE;
    if (m === HttpMethodEnum.DELETE) return PolicyActionEnum.DELETE;
    return PolicyActionEnum.ACCESS;
  };

  const getAction = options.getAction || defaultGetAction;
  const getResource = options.getResource;

  const beforeRequest: FetchAuthEnforcer["beforeRequest"] = (
    endpoint,
    config,
  ) => {
    if (!options.optimisticDeny || !getResource) return;

    const resource = getResource(endpoint, config);
    if (!resource) return;

    const action = getAction(config.method);
    const user = useAppStore.getState().user;
    const subject = buildSubject(user);

    if (!subject || !policyEngine.can(subject, action, resource)) {
      options.onDenied?.({ endpoint, action, resource });
      throw new AuthorizationBlockedError(
        `[ApiAuthEnforcer] Action '${action}' on resource '${resource.type}' blocked by policy`,
      );
    }
  };

  return { beforeRequest };
}
