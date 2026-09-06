# Rule 02: Code Quality, Type Safety & Refactoring Standards

This rule governs TypeScript strictness, ESLint rules, component size limits, and test coverage across all packages in the **Serafort CAP Multi-Tenant Framework**.

---

## 1. Strict TypeScript Standards

1. **Zero `any` Policy**:
   - `any` is strictly prohibited. Never introduce `as any`, `(data as any)`, or `error: any`.
   - Use strict types from `@cap/shared-types` or package-local `types/` definitions.
   - For catch blocks, use:
     ```ts
     try {
       // ...
     } catch (err: unknown) {
       const message = err instanceof Error ? err.message : 'Unknown error occurred';
       // handle error
     }
     ```
   - For route factory options, ensure `layout` is typed with `RouteLayout`, never `any`.
2. **Generics & Type Narrowing**:
   - Use discriminated unions for complex UI or workflow states.
   - Provide explicit generic return types on data-fetching hooks and service methods.
3. **Workspace Type Verification**:
   - Run type checks across all packages:
     ```bash
     pnpm -r run type-check
     ```
   - All 15 packages must pass with 0 errors.

---

## 2. Component Modularity & Complexity Limits

1. **The 300-Line Component Guideline**:
   - Component files exceeding 300 lines should be evaluated for decomposition.
   - Separate concerns into:
     - Custom hooks for business logic and state machines (`use[Feature]Flow.ts`).
     - Sub-components for presentational steps or visual chunks (e.g. `StepCredentials.tsx`, `StepMfa.tsx`).
     - Pure helper utilities in `utils/` or `services/`.
2. **DRY Logic Extraction**:
   - Common logic (such as role-based route redirects or token decoding) must be extracted once into shared utilities.
   - Never duplicate conditional branching across mutation callbacks.
3. **Purity of Render Phase**:
   - Never call factory functions (`assembleApp`, theme builders) directly in component render bodies without `useMemo`.
   - Prevent unnecessary re-renders of heavy children by using `React.memo` or stabilizing callbacks with `useCallback`.

---

## 3. Automated Testing Standards

1. **Vitest Unit & Integration Suites**:
   - Every package under `packages/` supports Vitest. Run tests using:
     ```bash
     pnpm --filter <package-name> exec vitest run
     ```
   - Test critical business logic:
     - Token composition and color lightening/darkening (`@cap/theme`).
     - State slice mutations and store hydration (`@cap/platform-store`).
     - ABAC / RBAC policy evaluation (`@cap/authorization`).
     - Dynamic route assembly and layout override resolution (`@cap/layout` & `@cap/platform-core`).
2. **No Dead or Demo Credentials in Shipped Code**:
   - Never ship pre-filled admin or test credentials in `defaultValues`.
   - Demo-fill helpers must be strictly gated:
     ```ts
     const defaultValues = import.meta.env.DEV
       ? { email: 'demo@example.com', password: 'demo-password' }
       : { email: '', password: '' };
     ```
