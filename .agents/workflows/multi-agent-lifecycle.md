---
name: multi-agent-lifecycle
description: Execute tasks through the standardized 7-step autonomous engineering loop (Plan -> Test -> Implement -> Review -> Verify -> Remember -> Improve).
---

# Workflow: Multi-Agent Autonomous Lifecycle

This workflow guides any agent through the mandatory 7-step engineering cycle.

---

## Stage 1: Plan
1. **Graphify Exploration**:
   - Query the knowledge graph: `graphify query "<feature-or-fix>"`
   - Check entity relationships: `graphify path "<Source>" "<Target>"`
2. **Tier & Package Classification**:
   - Identify affected packages in `packages/` or `app/`.
   - Check tier constraints (Tier 0 to 5) to ensure dependencies only flow downward.
3. **Blackboard Entry**:
   - Create or update `.agents/blackboard/active-task.json` with intent, target files, and primary specialist agent.

---

## Stage 2: Test
1. **Pre-Implementation Test Scaffolding**:
   - Write or locate failing Vitest tests (`packages/<pkg>/src/**/__tests__/*.test.ts`).
   - Define Playwright test assertions (`app/e2e/*.spec.ts`) if touching user workflows or routes.
2. **Verification Hypothesis**:
   - Clearly state the expected error or failing assertion before writing code.

---

## Stage 3: Implement
1. **Token & Type Disciplines**:
   - Use strict TypeScript from `@cap/shared-types` (zero `any`).
   - Use theme tokens (`theme.palette.*` or CSS vars via `ThemeBridge`), never raw hex literals.
   - Use `AppPaths` for all navigation routes (never hardcoded string paths).
2. **Component Modularity**:
   - Keep files under 300 lines; extract hooks and sub-components.
   - Enforce Zero-PII logging everywhere.

---

## Stage 4: Review
1. **Specialist Cross-Audit**:
   - Run boundary check: `pnpm lint:boundaries`
   - Run route literal check: `pnpm lint:routes`
   - Run circular dependency check: `pnpm lint:circular`
2. **Specialist Delegation (as needed)**:
   - Call `@security` if auth or storage keys changed.
   - Call `@tenant-lifecycle` if multi-tenant state or subscription tiers changed.
   - Call `@widget-engine` if widget manifests or dashboard grids changed.

---

## Stage 5: Verify
1. **Full Type Check**:
   ```bash
   pnpm -r run type-check
   ```
2. **Unit & Integration Tests**:
   ```bash
   pnpm --filter <pkg> exec vitest run
   ```
3. **Visual Driver Verification**:
   - If UI, layouts, or routes changed, execute the Playwright driver:
     ```bash
     node .claude/skills/run-serafort-app/driver.mjs shot /target-route .agents/blackboard/shots/verify.png --shell
     ```
   - Inspect output image (>3 KB, no backdrop veil, high contrast, clean LTR/RTL).

---

## Stage 6: Remember
1. **Record Discoveries**:
   - Open [`.agents/memory/lessons-learned.md`](file:///c:/Node.Js/proj/boilerplate/.agents/memory/lessons-learned.md).
   - Document any unexpected behavior, race conditions, browser quirks, or architectural findings.
   - Include date, files touched, symptom, root cause, and permanent fix.

---

## Stage 7: Improve
1. **Self-Tuning & Hardening**:
   - Add regression tests or linter rules if this bug could recur.
   - Update the relevant specialist persona rule in `.agents/rules/` if new constraints were established.
2. **Knowledge Graph Sync**:
   - Run:
     ```bash
     graphify update .
     ```
   - Verify that `graphify-out/` is updated with fresh AST dependencies.
