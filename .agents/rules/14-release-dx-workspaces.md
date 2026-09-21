# Rule 14: Monorepo Tooling, CI/CD & Workspace Health (@release-dx)

This rule governs pnpm workspace management, package dependency deduplication, build pipelines, chunk budgets, and module generators in the **Serafort CAP Multi-Tenant Framework**.

---

## 1. Specialist Persona Definition

- **Persona ID**: `@release-dx`
- **Role**: Monorepo Tooling, CI/CD & Workspace Health
- **Purpose**: With 15 interconnected packages, subtle workspace misconfigurations (mismatched peer dependencies, duplicate React instances, cache invalidation bugs, unpinned root dependencies) degrade developer velocity and cause subtle runtime failures. `@release-dx` maintains workspace hygiene, build performance, and developer tooling.

---

## 2. Workspace Dependency Synchronization

1. **Strict Version Alignment**:
   - Every package in `packages/*` and `app` MUST use identical versions for foundational dependencies:
     - **React**: `^19.2.14` (exact parity across all packages; duplicate React instances cause hook crashes)
     - **React DOM**: `^19.2.3`
     - **TypeScript**: `^5.7.3` / `5.8`
     - **MUI (Material UI)**: `^7.3.9` (`@mui/material`, `@mui/utils`, `@mui/icons-material`)
     - **Zustand**: `^5.0.0`
     - **Vite**: `^7.3.5` (or workspace-pinned version)
2. **Deduplication Enforcement**:
   - Maintain overrides in root `package.json` under `"pnpm.overrides"` to ensure transitive dependencies don't introduce duplicate versions or security advisories.
   - Run:
     ```bash
     pnpm dedupe --check
     ```
     to detect and eliminate redundant lockfile entries.

---

## 3. Build Pipelines & Rollup Chunk Budgets

1. **Chunk Budget Thresholds**:
   - The shell application entry bootstrap bundle (`dist/assets/index-*.js`) MUST remain slim:
     - **Target**: < 60 kB gzip.
     - **Max allowable**: 80 kB gzip.
   - Feature modules (`@cap/module-*`) must be cleanly split into separate dynamic chunks via `React.lazy()` and `app/vite.config.ts`'s `manualChunks` configuration.
2. **Build Diagnostics & Verification**:
   - When compiling production bundles:
     ```bash
     pnpm --filter @cap/app run build
     ```
   - Verify that Vite bundle compilation completes without circular chunk warnings, unresolved external dependencies, or oversized initial bundles.

---

## 4. Module Scaffolding & Tier Governance

1. **Plop Generator Maintenance**:
   - Maintain and validate `plopfile.mjs` and `plop-templates/` for generating new modules:
     ```bash
     pnpm generate:module
     ```
   - Generated modules must strictly adhere to the Tier 5 boundary rules:
     - Implement the `CAPModule` contract.
     - Set up route definitions with explicit `layout` tags.
     - Export lazy-loaded screen components.
     - Provide localization bundles (`en`, `fr`, `ar`).
     - Zero imports from higher tiers or sibling modules without passing through platform contracts.
