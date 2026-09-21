/**
 * Resolving a widget's `dataSource` binding to actual data.
 *
 * `dataSource` has been on `WidgetDefinition` since the beginning and was,
 * until now, decoration: validated (recently) but never read, so a widget
 * declaring `{provider: "rest", config: {path: "/api/v1/metrics"}}` rendered
 * with whatever static props it happened to carry and no one noticed the
 * binding did nothing.
 *
 * Each provider states what it needs, so a binding that cannot possibly
 * resolve is rejected before a request is made rather than failing at render
 * time with an empty widget.
 */
import { apiClient } from "@cap/platform-core";
import type { WidgetDefinition } from "@cap/shared-types";
import { DATA_SOURCE_PROVIDERS } from "../agents/ValidationAgent";

export type DataSourceBinding = NonNullable<WidgetDefinition["dataSource"]>;

export interface DataSourceResult {
  data: unknown;
  /** Where the value came from, for the panel to show honestly. */
  origin: "inline" | "network";
  fetchedAt: string;
}

export class DataSourceError extends Error {
  constructor(
    message: string,
    readonly kind: "config" | "unsupported" | "network",
  ) {
    super(message);
    this.name = "DataSourceError";
  }
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

/**
 * A path a widget may fetch from.
 *
 * Bindings come from a language model, so the path is treated as untrusted:
 * same-origin only, no protocol, no traversal. A widget that wants data from
 * somewhere else needs a provider that fronts it, which is the point of
 * having providers at all.
 */
const isSafeApiPath = (path: unknown): path is string => {
  if (typeof path !== "string" || !path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("..")) return false;
  return true;
};

interface ProviderHandler {
  /** Reject a binding that cannot work, before any request goes out. */
  validate: (config: Record<string, unknown>) => string | null;
  resolve: (
    config: Record<string, unknown>,
    signal?: AbortSignal,
  ) => Promise<DataSourceResult>;
}

const network = async (
  path: string,
  params: Record<string, unknown> | undefined,
  signal?: AbortSignal,
): Promise<DataSourceResult> => {
  const query =
    params && Object.keys(params).length
      ? `?${new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)]),
        ).toString()}`
      : "";

  try {
    const response = await apiClient.get<unknown>(`${path}${query}`, {
      signal,
    } as never);
    return {
      data: response?.data ?? null,
      origin: "network",
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    throw new DataSourceError(
      err instanceof Error ? err.message : String(err),
      "network",
    );
  }
};

const PROVIDERS: Record<string, ProviderHandler> = {
  /**
   * Data carried in the definition itself. Nothing to fetch, so this is the
   * one provider that works with no backend at all - and the one a generated
   * widget can use to show real sample content immediately.
   */
  static: {
    validate: (config) =>
      config.data === undefined
        ? 'A "static" data source needs its data in config.data'
        : null,
    resolve: async (config) => ({
      data: config.data,
      origin: "inline",
      fetchedAt: new Date().toISOString(),
    }),
  },

  rest: {
    validate: (config) =>
      isSafeApiPath(config.path)
        ? null
        : 'A "rest" data source needs config.path, a same-origin path beginning with "/"',
    resolve: (config, signal) =>
      network(
        config.path as string,
        asRecord(config.params) as Record<string, unknown>,
        signal,
      ),
  },

  "dashboard-metrics": {
    validate: (config) =>
      typeof config.metric === "string" && config.metric.trim()
        ? null
        : 'A "dashboard-metrics" data source needs config.metric',
    resolve: (config, signal) =>
      network(
        "/api/v1/dashboard/metrics",
        { metric: config.metric, ...asRecord(config.params) },
        signal,
      ),
  },

  "tenant-analytics": {
    validate: (config) =>
      typeof config.report === "string" && config.report.trim()
        ? null
        : 'A "tenant-analytics" data source needs config.report',
    resolve: (config, signal) =>
      network(
        "/api/v1/analytics/reports",
        { report: config.report, ...asRecord(config.params) },
        signal,
      ),
  },
};

/** Why this binding cannot resolve, or null when it can. */
export function describeBindingProblem(
  binding: DataSourceBinding | undefined,
): string | null {
  if (!binding) return null;
  if (!(DATA_SOURCE_PROVIDERS as readonly string[]).includes(binding.provider)) {
    return `"${binding.provider}" is not a data source this platform serves`;
  }
  return PROVIDERS[binding.provider].validate(asRecord(binding.config));
}

/** Fetch (or read) the data a binding points at. */
export async function resolveDataSource(
  binding: DataSourceBinding,
  signal?: AbortSignal,
): Promise<DataSourceResult> {
  const handler = PROVIDERS[binding.provider];
  if (!handler) {
    throw new DataSourceError(
      `"${binding.provider}" is not a data source this platform serves`,
      "unsupported",
    );
  }

  const config = asRecord(binding.config);
  const problem = handler.validate(config);
  if (problem) throw new DataSourceError(problem, "config");

  return handler.resolve(config, signal);
}

/** A stable cache key for a binding. */
export function dataSourceKey(binding: DataSourceBinding): string {
  return `${binding.provider}:${JSON.stringify(binding.config ?? {})}`;
}
