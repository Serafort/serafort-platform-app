# Rule 12: Extensibility, Dynamic Plugins & Schema UI (@widget-engine)

This rule governs the dynamic widget engine, plugin injection, schema validation, and dashboard grid persistence in the **Serafort CAP Multi-Tenant Framework** (`@cap/module-widget-studio` and `@cap/module-dashboard`).

---

## 1. Specialist Persona Definition

- **Persona ID**: `@widget-engine`
- **Role**: Extensibility, Dynamic Plugins & Schema UI
- **Purpose**: Dynamic widget architectures introduce hazardous failure modes: layout collision, unbounded memory leaks in live streaming widgets, unvalidated user configuration schemas, and untrusted widget runtime crashes. `@widget-engine` ensures runtime stability, schema safety, and grid resilience.

---

## 2. Standardized Widget Manifest Contract

All widgets registered in `@cap/module-widget-studio` or dynamic dashboards MUST conform to the standardized widget manifest contract:

```ts
export interface WidgetManifest {
  id: string;                      // Unique widget identifier (e.g. 'chart-mrr', 'ai-summary')
  version: string;                 // SemVer (e.g. '1.0.0')
  name: string;                    // Human-readable title
  category: string;                // 'analytics' | 'operations' | 'ai' | 'finance'
  propsSchema: z.ZodSchema;        // Zod runtime validation schema for configurable props
  supportedLayouts: ('1x1' | '2x1' | '2x2' | '3x2' | 'full')[];
  defaultDimensions: { w: number; h: number; minW?: number; minH?: number };
  permissionsRequired?: string[];  // Required tenant/user permissions
  component: React.LazyExoticComponent<React.ComponentType<any>>;
}
```

### Invariants
1. **No Bare Unchecked Props**: No widget may accept user-configured JSON settings without passing them through its declared `propsSchema` (Zod validation).
2. **Permission Guarding**: Widgets requiring elevated permissions must not appear in the catalog or mount on the grid if the active user or tenant lacks those permissions.

---

## 3. Lazy Chunk Isolation & Defensive Error Boundaries

1. **Lazy Loading**: Every widget component MUST be code-split via `React.lazy()` so unused widgets do not inflate the dashboard chunk size.
2. **Defensive Error Boundaries**:
   - Each widget instance MUST be individually wrapped in a dedicated `ErrorBoundary`.
   - A runtime error, syntax error, or unhandled rejection inside a single widget MUST render a local fallback card with retry controls and telemetry capture.
   - A single crashing widget must NEVER cascade to corrupt other widgets or crash the canvas.
3. **Resource & Memory Leak Prevention**:
   - Widgets subscribing to real-time streams (SSE, WebSockets, or polling intervals) must store cleanup handlers in their `useEffect` teardown functions.
   - Long-running widgets must be profiled for memory leaks using Chrome DevTools or memory profiling tools.

---

## 4. Dashboard Grid Persistence & Responsive Layouts

1. **Persistence Integrity**:
   - Grid coordinates (`x`, `y`, `w`, `h`), breakpoint arrangements (`lg`, `md`, `sm`), and auto-packing parameters must be saved with debounce (<300ms) to prevent storage thrashing.
   - Grid state must be stored in tenant-and-user-scoped storage keys (`tenantId:userId:dashboard_grid`).
2. **Collision & Auto-Packing Rules**:
   - Ensure grid recalculations avoid overlaps and handle responsive breakpoint resizing smoothly.
   - On small viewports (<768px), automatically collapse grid elements into a single-column stacked layout while preserving custom widget ordering.
