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

/** Approved widget registry — mirrors globalWidgetRegistry entries */
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
  approvedWidgetIds = APPROVED_WIDGETS.map((w) => w.id),
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
