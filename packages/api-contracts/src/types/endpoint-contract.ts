/**
 * Typed endpoint contract system.
 *
 * An `EndpointContract` binds three things together so that service layers and
 * the API client can be type-checked against a single definition:
 *   1. the HTTP method,
 *   2. the path (kept as the single source of truth in `API_ENDPOINTS` and
 *      referenced here through the `resolve` builder),
 *   3. the request/response payload shapes.
 *
 * This is the foundation of the contract-driven architecture: instead of
 * hand-rolling `apiClient.get<T>(url)` calls with ad-hoc types per call site,
 * a consumer references one `API_CONTRACTS` entry and both the URL and the
 * payload types flow from the contract.
 */

/** HTTP methods supported by the platform API client. */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * Type-only marker used to attach a payload type to a contract without
 * supplying a runtime value. `request`/`response` slots are value-typed so
 * callers may either pass an example payload (useful as documentation) or a
 * type-only marker:
 *
 * @example
 * response: contractType<AdminUser>()
 */
export function contractType<T>(): T {
  return undefined as unknown as T
}

/**
 * A single typed API endpoint contract.
 *
 * @typeParam M    HTTP method used to invoke the endpoint.
 * @typeParam Req  Request body shape (`undefined` when the endpoint has no body).
 * @typeParam Res  Response body shape (`unknown` when not yet declared).
 * @typeParam Args Tuple of path-argument types consumed by `resolve`.
 */
export interface EndpointContract<
  M extends HttpMethod = HttpMethod,
  Req = undefined,
  Res = unknown,
  Args extends unknown[] = [],
> {
  /** Stable, dot-delimited identifier, e.g. `'auth.login'`. */
  readonly id: string
  /** HTTP method the endpoint is invoked with. */
  readonly method: M
  /**
   * Builds the final path (without the base URL) from optional path arguments.
   * Prefer delegating to the matching `API_ENDPOINTS` entry so the URL string
   * lives in exactly one place.
   */
  readonly resolve: (...args: Args) => string
  /** Request body shape (when the endpoint accepts a payload). */
  readonly request?: Req
  /** Response body shape. */
  readonly response?: Res
}

/** Convenience union constraint used by consumers that accept any contract. */
export type AnyContract = EndpointContract<HttpMethod, unknown, unknown, unknown[]>

/** Extracts the request payload type from a contract. */
export type ContractRequest<C extends AnyContract> = C extends EndpointContract<
  HttpMethod,
  infer Req,
  unknown,
  unknown[]
>
  ? Req
  : undefined

/** Extracts the response payload type from a contract. */
export type ContractResponse<C extends AnyContract> = C extends EndpointContract<
  HttpMethod,
  unknown,
  infer Res,
  unknown[]
>
  ? Res
  : unknown

/** Extracts the path-argument tuple type from a contract. */
export type ContractArgs<C extends AnyContract> = C extends EndpointContract<
  HttpMethod,
  unknown,
  unknown,
  infer Args
>
  ? Args
  : never[]

/**
 * Creates a typed endpoint contract. Point `resolve` at the matching
 * `API_ENDPOINTS` entry so the URL stays in a single place.
 *
 * @example
 * defineEndpoint({
 *   id: 'admin.users.byId',
 *   method: 'GET',
 *   resolve: (id: number) => ENDPOINTS.admin.users.byId(id),
 *   response: AdminUser,
 * })
 */
export function defineEndpoint<
  M extends HttpMethod,
  Args extends unknown[] = [],
  Req = undefined,
  Res = unknown,
>(contract: {
  id: string
  method: M
  resolve: (...args: Args) => string
  request?: Req
  response?: Res
}): EndpointContract<M, Req, Res, Args> {
  return contract as EndpointContract<M, Req, Res, Args>
}

/** Resolves the final path (without base URL) for a contract. */
export function resolveContractPath<C extends AnyContract>(
  contract: C,
  ...args: ContractArgs<C>
): string {
  return contract.resolve(...args)
}
