/**
 * Validation Agent — Agent 4/6 — Security Layer 3 (Core Security Gate)
 *
 * Fully client-side validation — no AI call. Validates the Widget DSL against:
 * 1. Schema validation (required fields, data types)
 * 2. Security validation (no executable code, no injections)
 * 3. Component validation (widgetId in approved registry)
 * 4. Tenant validation (theme-compatible, no dangerous overrides)
 */
import type { WidgetDefinition, ValidationOutput } from "@cap/shared-types";
import { globalWidgetRegistry } from "@cap/platform-core";
import { sanitizeWidgetDsl } from "./sanitizer";
import { DSL_SCHEMA_VERSION } from "./dslSchema";

/**
 * Widget metadata used when describing the catalogue to an agent.
 *
 * This is prompt material, NOT the security list. It used to be both, under a
 * comment calling it a mirror of `globalWidgetRegistry` - a hand-copy that had
 * already fallen behind the registry it mirrored, listing six ids where the
 * running app registers fourteen. `getApprovedWidgetIds()` below asks the
 * registry instead, because the registry is what can actually render.
 */
export const APPROVED_WIDGETS = [
  {
    id: "dashboard-widget-weather",
    name: "Weather Widget",
    description:
      "Current weather conditions with temperature, humidity, and wind speed",
    bestFor: ["weather", "climate", "temperature"],
  },
  {
    id: "dashboard-widget-revenueChart",
    name: "Revenue Chart Widget",
    description: "Area chart showing revenue data over time with a target line",
    bestFor: [
      "chart",
      "revenue",
      "sales",
      "trends",
      "analytics",
      "time-series",
    ],
  },
  {
    id: "dashboard-widget-recentOrders",
    name: "Recent Orders / Table Widget",
    description:
      "Data table showing recent records, orders, transactions, or list data",
    bestFor: ["table", "list", "orders", "records", "transactions"],
  },
  {
    id: "dashboard-widget-statCard",
    name: "Stat Card / KPI Widget",
    description:
      "Key Performance Indicator card showing a metric with label, value, trend, and icon",
    bestFor: ["metric", "kpi", "stat", "count", "total", "users", "number"],
  },
  {
    id: "dashboard-widget-aiChat",
    name: "AI Chat Widget",
    description: "Conversational AI chat interface embedded in the dashboard",
    bestFor: ["chat", "ai", "assistant", "conversation", "help"],
  },
  {
    id: "core-dynamic-layout",
    name: "Dynamic Layout Widget",
    description:
      "A highly flexible generic renderer that composes custom UI from a recursive tree of nodes.",
    bestFor: ["custom", "creative", "unique", "composite", "freeform"],
  },
];

/**
 * The components a DSL may name: whatever is registered right now.
 *
 * A component that is not in the registry cannot be rendered, so naming one is
 * an error however plausible it looks. The static catalogue is the fallback
 * for environments where nothing has registered yet (unit tests, SSR), where
 * an empty registry would otherwise reject everything.
 */
export function getApprovedWidgetIds(): string[] {
  const registered = globalWidgetRegistry.getAll().map((d) => d.id);
  return registered.length > 0 ? registered : APPROVED_WIDGETS.map((w) => w.id);
}

/**
 * Data sources the platform can actually serve.
 *
 * `dataSource` has been on `WidgetDefinition` from the start but nothing ever
 * looked at it, so a model could name any provider it liked and the widget
 * would be accepted with a binding that resolves to nothing at render time.
 * Naming a provider that does not exist is a defect, not a preference.
 */
export const DATA_SOURCE_PROVIDERS = [
  "static",
  "rest",
  "dashboard-metrics",
  "tenant-analytics",
] as const;

export type DataSourceProvider = (typeof DATA_SOURCE_PROVIDERS)[number];

/** Patterns that should never appear in DSL values (security enforcement) */
const DANGEROUS_PATTERNS: RegExp[] = [
  /eval\s*\(/i,
  /new\s+Function/i,
  /import\s*\(/i,
  /<\s*script/i,
  /javascript\s*:/i,
  /on\w+\s*=/i, // Event handlers (onclick=, onload=, etc.)
  /data\s*:\s*text\/html/i,
  /vbscript\s*:/i,
];

/** Required top-level fields in WidgetDefinition */
const REQUIRED_FIELDS: (keyof WidgetDefinition)[] = [
  "id",
  "name",
  "version",
  "component",
  "layout",
];

/**
 * Validates a Widget DSL object against all platform security and schema rules.
 * This is the core security gate — any DSL failing validation must not be rendered.
 */
export function validateWidgetDsl(
  dsl: Partial<WidgetDefinition>,
  approvedWidgetIds = getApprovedWidgetIds(),
): ValidationOutput {
  const schemaErrors: string[] = [];
  const securityErrors: string[] = [];
  const tenantErrors: string[] = [];
  const componentErrors: string[] = [];

  // ---- 1. Schema Validation ----
  for (const field of REQUIRED_FIELDS) {
    if (!dsl[field]) {
      schemaErrors.push(`Missing required field: "${String(field)}"`);
    }
  }

  if (dsl.id && typeof dsl.id !== "string") {
    schemaErrors.push('Field "id" must be a string');
  }

  if (dsl.version && !/^\d+\.\d+\.\d+$/.test(dsl.version)) {
    schemaErrors.push(`Field "version" must be SemVer — got "${dsl.version}"`);
  }

  if (dsl.layout) {
    const { width, height } = dsl.layout;
    if (![4, 8, 12].includes(width)) {
      schemaErrors.push(`layout.width must be 4, 8, or 12 — got ${width}`);
    }
    if (![200, 280, 340, 400].includes(height)) {
      schemaErrors.push(
        `layout.height must be 200, 280, 340, or 400 — got ${height}`,
      );
    }
  }

  // ---- 2. Security Validation ----
  const dslString = JSON.stringify(dsl);
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(dslString)) {
      securityErrors.push(`Dangerous pattern detected: ${pattern.source}`);
    }
  }

  // No executable types allowed in props
  if (dsl.props) {
    const checkValue = (val: unknown, path: string) => {
      if (typeof val === "function") {
        securityErrors.push(`Executable function found at props.${path}`);
      } else if (
        typeof val === "string" &&
        DANGEROUS_PATTERNS.some((p) => p.test(val))
      ) {
        securityErrors.push(
          `Dangerous string value at props.${path}: "${val.slice(0, 50)}"`,
        );
      } else if (val && typeof val === "object") {
        Object.entries(val as Record<string, unknown>).forEach(([k, v]) =>
          checkValue(v, `${path}.${k}`),
        );
      }
    };
    Object.entries(dsl.props).forEach(([k, v]) => checkValue(v, k));
  }

  // ---- 3. Component Validation ----
  if (dsl.component) {
    if (!approvedWidgetIds.includes(dsl.component)) {
      componentErrors.push(
        `Component "${dsl.component}" is not in the approved widget registry`,
      );
    }
  }

  // ---- 3b. Data Source Validation ----
  if (dsl.dataSource) {
    const provider = dsl.dataSource.provider;
    if (typeof provider !== "string" || !provider.trim()) {
      schemaErrors.push("dataSource.provider is required when dataSource is set");
    } else if (
      !(DATA_SOURCE_PROVIDERS as readonly string[]).includes(provider)
    ) {
      componentErrors.push(
        `Data source "${provider}" is not a provider this platform serves`,
      );
    }
    if (
      dsl.dataSource.config !== undefined &&
      (typeof dsl.dataSource.config !== "object" ||
        dsl.dataSource.config === null ||
        Array.isArray(dsl.dataSource.config))
    ) {
      schemaErrors.push("dataSource.config must be an object");
    }
  }

  // ---- 4. Tenant Validation ----
  if (dsl.tenantOverrides) {
    const overrideStr = JSON.stringify(dsl.tenantOverrides);
    if (DANGEROUS_PATTERNS.some((p) => p.test(overrideStr))) {
      tenantErrors.push("Dangerous pattern detected in tenantOverrides");
    }
  }

  const isValid =
    schemaErrors.length === 0 &&
    securityErrors.length === 0 &&
    componentErrors.length === 0 &&
    tenantErrors.length === 0;

  return {
    isValid,
    schemaErrors,
    securityErrors,
    tenantErrors,
    componentErrors,
  };
}

/**
 * Agent runner — wraps validation into the agent pipeline format.
 * No AI call: purely deterministic.
 */
export function runValidationAgent(
  dsl: Partial<WidgetDefinition>,
  onProgress?: (msg: string) => void,
): ValidationOutput {
  onProgress?.("Running schema validation...");
  const result = validateWidgetDsl(dsl);

  if (result.isValid) {
    onProgress?.("✓ All validation checks passed");
  } else {
    const allErrors = [
      ...result.schemaErrors,
      ...result.securityErrors,
      ...result.componentErrors,
      ...result.tenantErrors,
    ];
    onProgress?.(`✗ Validation failed: ${allErrors.join(", ")}`);
  }

  return result;
}

/** A one-line summary of what failed, for the pipeline's Validation step. */
export function describeValidationFailure(result: ValidationOutput): string {
  const all = [
    ...result.securityErrors,
    ...result.componentErrors,
    ...result.schemaErrors,
    ...result.tenantErrors,
  ];
  if (all.length === 0) return "Validation failed";
  return all.length === 1 ? all[0] : `${all[0]} (+${all.length - 1} more)`;
}

const mintWidgetId = (): string => {
  // randomUUID needs a secure context; a dev server on a LAN address is not
  // one, and a thrown error here would take the whole run down.
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = crypto.getRandomValues(new Uint8Array(4));
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `widget-${Date.now()}-${hex}`;
  }

  throw new Error('Secure random source unavailable; cannot generate a widget id');
};

export interface ResolvedDsl {
  dsl: WidgetDefinition;
  validation: ValidationOutput;
}

/**
 * Turn a model's raw DSL into something safe to store and render - or say why
 * it is not.
 *
 * The distinction that matters is which fields we are entitled to fill in:
 *
 * - `id`, `name` and `version` are bookkeeping. If the model omits them we
 *   mint them, and that is not a defect.
 * - `component` and `layout` are the model's decisions. The caller used to
 *   invent `{ width: 8, height: 280 }` before spreading the model's object
 *   over it, and `sanitizeWidgetDsl` substitutes "core-dynamic-layout" for a
 *   missing component - so a DSL that named nothing renderable arrived looking
 *   perfectly valid, and the gate (which never ran anyway) would have had
 *   nothing left to catch.
 *
 * Validation therefore runs on the prepared-but-not-yet-coerced object, and
 * sanitisation runs after, where its coercions are a no-op on anything that
 * passed.
 */
export function resolveGeneratedDsl(
  raw: unknown,
  options: { fallbackName?: string } = {},
): ResolvedDsl {
  const source = (
    raw && typeof raw === "object" ? raw : {}
  ) as Partial<WidgetDefinition>;

  const prepared: Partial<WidgetDefinition> = {
    ...source,
    id: source.id || mintWidgetId(),
    name: source.name || options.fallbackName || "Generated widget",
    version: source.version || "1.0.0",
  };

  const validation = validateWidgetDsl(prepared);
  const sanitized = sanitizeWidgetDsl(prepared);

  return {
    dsl: {
      ...sanitized,
      // The sanitiser predates both fields and drops anything it does not
      // know about, so they are carried across explicitly.
      ...(prepared.dataSource ? { dataSource: prepared.dataSource } : {}),
      schemaVersion: DSL_SCHEMA_VERSION,
    },
    validation,
  };
}
