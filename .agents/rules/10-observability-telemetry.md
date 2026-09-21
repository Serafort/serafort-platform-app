# Rule 10: Observability, Telemetry & Error Sentinels

This rule governs structured client-side instrumentation, error boundaries, contextual breadcrumbs, and Real User Monitoring (RUM) in the **Serafort CAP Multi-Tenant Framework**.

---

## 1. Zero-PII Instrumentation Governance

Observability is essential, but it must strictly adhere to Rule 03 (Zero-PII).

1. **Allowed Telemetry Payload Fields**:
   - Event name (e.g. `'theme_preset_changed'`, `'widget_added'`, `'auth_flow_step'`)
   - Anonymized / Hashed identifiers (e.g. `tenantId`, `role`, `subscriptionTier`)
   - Performance metrics (duration in ms, DOM element counts, viewport dimensions)
   - Component name and route path (`/auth/login`, `/dashboard/widgets`)
2. **Strictly Prohibited in Telemetry / Analytics**:
   - Raw email addresses, usernames, real names, phone numbers.
   - Passwords, MFA OTP codes, API keys, authorization bearer tokens.
   - Raw query string parameters that may contain sensitive credentials (e.g. reset tokens, invitation codes).

---

## 2. Granular Error Boundaries & Contextual Breadcrumbs

1. **Widget & Module Error Isolation**:
   - Never let a failure in one widget or sub-module crash the entire dashboard shell.
   - Every independent dashboard widget and lazy-loaded route chunk must be wrapped in a React `ErrorBoundary`:
     ```tsx
     <ErrorBoundary
       fallbackRender={({ error, resetErrorBoundary }) => (
         <WidgetErrorFallback error={error} onRetry={resetErrorBoundary} />
       )}
       onError={(error, info) => {
         telemetryService.captureException(error, {
           componentStack: info.componentStack,
           moduleId: 'dashboard-widget-studio',
         });
       }}
     >
       <DynamicLayoutWidget widget={widget} />
     </ErrorBoundary>
     ```
2. **Safe Breadcrumbs**:
   - Before capturing an exception, record safe breadcrumbs (user navigation route, button clicks by ID, network status).
   - Sanitize all breadcrumb URLs and metadata before dispatching to monitoring backends (Sentry / OpenTelemetry / Datadog).

---

## 3. Real User Monitoring (RUM) & Doherty Threshold Enforcement

1. **Measuring the Doherty Threshold (<400ms) in the Wild**:
   - Synthetic tests alone do not reflect real-world device and network fragmentation.
   - Track Core Web Vitals and key user interaction latencies:
     - **Interaction to Next Paint (INP)**: Target < 200ms (Good), < 400ms (Acceptable).
     - **Largest Contentful Paint (LCP)**: Target < 2.5s.
     - **Cumulative Layout Shift (CLS)**: Target < 0.1.
2. **Operation Performance Marks**:
   - Use the User Timing API for critical workflows:
     ```ts
     performance.mark('theme-switch-start');
     // execute theme switch
     performance.mark('theme-switch-end');
     performance.measure('theme-switch-duration', 'theme-switch-start', 'theme-switch-end');
     ```
   - Log warnings in DEV mode if any UI mutation exceeds 400ms without displaying a loading skeleton.
