# Rule 04: Performance, Bundle Size & Runtime Optimization

This rule governs Core Web Vitals, Rollup bundle chunking, DOM style synchronization, and rendering performance in the **Serafort CAP Multi-Tenant Framework**.

---

## 1. Doherty Threshold (<400ms Rule)

1. **Interactive Feedback**:
   - Any user action (click, toggle, input) must provide visible feedback within **400ms**.
   - If an operation takes longer than 400ms:
     - Provide immediate optimistic UI updates, OR
     - Display a loading skeleton/spinner immediately.
2. **Debounced Operations**:
   - Live search queries, tenant color synthesis, or filter inputs must debounce between 250ms–350ms to prevent network thrash and unnecessary re-renders.

---

## 2. Bundle Size & Rollup Chunk Splitting

1. **Keep Entry Bundle Lean**:
   - The main entry bundle (`dist/assets/index-*.js`) must remain slim (< 60 kB gzip).
   - Core libraries and feature modules must be split into dedicated chunks via `manualChunks` in `app/vite.config.ts`:
     - Third-party vendors: `vendor-react`, `vendor-mui`, `vendor-charts`, `vendor-motion`, `vendor-tanstack`, `vendor-router`, `vendor-zustand`, `vendor-i18n`.
     - Feature modules: `module-auth-core`, `module-auth-user-directory`, `module-auth-identity-broker`, `module-auth-mfa`, `module-dashboard`, `module-landing`, `module-widget-studio`, `module-theme`, `module-layout`.
2. **Verify Production Bundle**:
   ```bash
   pnpm --filter @cap/app run build
   ```
   Check the terminal chunk summary for any single bundle triggering the size warning limit.

---

## 3. DOM & CSS Variable Batching (`ThemeBridge`)

1. **Prevent Per-Frame DOM Thrash**:
   - When switching presets or customizing color tokens, rapidly writing to `document.documentElement.style` forces layout recalculation.
   - All tenant variable updates must be coalesced into a single `requestAnimationFrame` write via `ThemeBridge` and `applyThemeVariablesSync`.
2. **Variable Clean-up**:
   - When returning from an effect preset (e.g. Glassmorphism or Brutalism) to a standard preset, obsolete CSS variables (`--glass-*`, `--brutal-*`) must be explicitly removed from the DOM root to avoid style contamination.

---

## 4. Virtualization & Large Data Rendering

1. **Table & List Virtualization**:
   - Any list or table rendering more than 50 items must use `@tanstack/react-virtual` or `@tanstack/react-table` pagination.
2. **Suspense & Code Splitting**:
   - All module route screen components must use `React.lazy()` wrapped in `<React.Suspense fallback={<LoadingSpinner />}>`.
   - Never import screen components statically in route definition files.
