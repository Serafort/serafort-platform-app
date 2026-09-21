# Rule 00: Multi-Agent Orchestration, Autonomous Lifecycle & Knowledge Systems

This rule governs the overarching multi-agent execution framework across the **Serafort CAP Multi-Tenant Platform**. All 17 specialist agents operate within this unified protocol.

---

## 1. The 17 Specialist Agent Matrix

| Persona ID | Specialist Role | Primary Domain | Core Gate Command |
| :--- | :--- | :--- | :--- |
| **`@architect`** | Architecture & Monorepo Governance | Tier boundaries (0-5), `CAPModule` contract, modularity | `pnpm lint:boundaries && pnpm lint:circular` |
| **`@quality`** | Code Quality & Type Guardian | Strict TypeScript, zero `any`, component decomposition | `pnpm -r run type-check` |
| **`@security`** | Cybersecurity & Sentinel Defense | Zero-PII logging, AES-GCM crypto, XSS/SSRF prevention | `.jules/sentinel.md` audit |
| **`@performance`** | Runtime & Core Web Vitals Optimizer | Doherty Threshold (<400ms), bundle budgets (<60kB), rAF | Rollup chunk analysis |
| **`@theme-artisan`** | MUI v7 Design Tokens & Visual Effects | 3-layer tokens, 15 presets, 6 visual effect engines | `composeMuiTheme` verification |
| **`@ux-cognitive`** | Cognitive Heuristics & 4 UI States | 4 Key Principles, 4 UI States, Fitts/Miller Laws | UI state completeness review |
| **`@a11y-i18n`** | Accessibility & Bidirectional Parity | WCAG 2.2 AA, LTR/RTL parity, zero hardcoded strings | `pnpm --filter @cap/app exec vitest` + i18n scan |
| **`@visual-qa`** | Browser Driver & Visual Regression | Headless Playwright driving, DOM geometry, screenshots | `node .claude/skills/run-serafort-app/driver.mjs shot` |
| **`@network-boundary`** | Server-State Cache & API Contracts | React Query keys, optimistic rollbacks, AbortSignal, Zod | `API_QUERY_KEYS` inspection |
| **`@telemetry-audit`** | Observability & Error Sentinels | Zero-PII analytics, ErrorBoundary isolation, RUM vitals | Sentry/telemetry payload audit |
| **`@tenant-lifecycle`** | Multi-Tenancy & Isolation Sentinel | Storage keys (`tenantId:userId:key`), tier guards, teardown | Cross-tenant isolation verification |
| **`@widget-engine`** | Extensibility, Dynamic Plugins & Schema UI | Widget studio runtime, manifests, Zod config validation | Grid persistence & error boundaries |
| **`@mock-fixtures`** | Synthetic Data, MSW & Contract Parity | MSW handlers, contracts parity, multi-tenant presets | `packages/api-contracts` parity check |
| **`@release-dx`** | Monorepo Tooling, CI/CD & Workspace Health | pnpm workspaces, deduplication, Plop generators | `pnpm install --frozen-lockfile` & chunk budget |
| **`@compliance-governance`** | Regulatory Privacy, Audit Trails & Policy | GDPR/HIPAA/SOC 2, immutable audit events, idle locks | Telemetry audit events inspection |
| **`@e2e-journey`** | End-to-End Human Workflow Simulator | Multi-screen Playwright journeys, `AppPaths` compliance | `pnpm --filter @cap/app run test:e2e` & `pnpm lint:routes` |
| **`@flow-state`** | Cross-Screen Context & State Guardian | URL query params over hidden state, React.lazy suspense | Cross-screen handoff & memory cleanup check |

---

## 2. The 7-Step Autonomous Engineering Loop

Every task executed by an agent MUST strictly follow the 7-step cycle:
`Plan -> Test -> Implement -> Review -> Verify -> Remember -> Improve`.

```
┌─────────┐     ┌────────┐     ┌───────────┐     ┌──────────┐
│ 1. PLAN │ ──> │2. TEST │ ──> │3.IMPLEMENT│ ──> │4. REVIEW │
└─────────┘     └────────┘     └───────────┘     └──────────┘
                                                       │
┌───────────┐     ┌────────────┐     ┌──────────┐      │
│7. IMPROVE │ <── │6. REMEMBER │ <── │5. VERIFY │ <────┘
└───────────┘     └────────────┘     └──────────┘
```

### Step 1: PLAN (Discovery & Architectural Alignment)
- **Consult Graphify**: Run `graphify query "<task/concept>"` or check `graphify-out/wiki/index.md` before reading raw files.
- **Check Tier Hierarchy**: Verify which package tiers (0 to 5) are involved and identify boundary constraints (`scripts/check-tier-boundaries.mjs`).
- **Formulate Intent**: Identify affected specialist agents and establish an implementation plan.

### Step 2: TEST (Specification & Hypothesis)
- Adopt a test-driven posture: identify existing test suites or define test cases before modifying production code.
- Prepare Vitest unit tests (`pnpm --filter <pkg> exec vitest run`) or Playwright end-to-end assertions (`pnpm --filter @cap/app run test:e2e`).
- Define exact failure/success criteria.

### Step 3: IMPLEMENT (Token & Contract Rigor)
- Execute changes with zero `any`, token-based styling (no hardcoded CSS colors), explicit route layouts (`'admin'`, `'public'`, `'noLayout'`), and zero PII logging.
- Decompose components exceeding 300 lines into focused hooks and sub-components.

### Step 4: REVIEW (Specialist Cross-Examination)
- Perform self-review using relevant specialist personas:
  - Architecture check: Did we violate tier dependencies? Run `pnpm lint:boundaries`.
  - Route check: Did we use string literals instead of `AppPaths`? Run `pnpm lint:routes`.
  - Circular check: Did we introduce import cycles? Run `pnpm lint:circular`.

### Step 5: VERIFY (Rigorous Multi-Layer Verification)
- Run workspace type checks across all 15 packages: `pnpm -r run type-check`.
- Execute package-level Vitest suites.
- **Visual Grounding with Playwright Driver**:
  - For any screen or navigation change, run the headless driver:
    ```bash
    node .claude/skills/run-serafort-app/driver.mjs shot /target-path .agents/blackboard/verification.png --shell
    ```
  - Verify screenshot dimensions, contrast, LTR/RTL parity, and layout geometry.

### Step 6: REMEMBER (Knowledge Persistence)
- Any non-obvious debugging discovery, edge case, race condition (e.g. the 2.5s `--shell` backdrop pattern), or architectural gotcha MUST be documented in:
  [`.agents/memory/lessons-learned.md`](file:///c:/Node.Js/proj/boilerplate/.agents/memory/lessons-learned.md)
- Ensure findings are written with reproducible examples and clear remediation steps.

### Step 7: IMPROVE (Continuous System Self-Tuning)
- Review whether the issue could happen again.
- If a pattern failed:
  - Enhance lint rules or add an architectural boundary assertion in `scripts/`.
  - Add an automated regression test in the package or Playwright e2e suite.
  - Update the relevant specialist persona rule in `.agents/rules/` to prevent future agents from repeating the mistake.
- **Sync Knowledge Graph**: Run `graphify update .` to update the AST graph with the new codebase state.

---

## 3. Inter-Agent Blackboard Protocol (Information Sharing)

Agents collaborate via a shared **Blackboard** located at:
[`.agents/blackboard/`](file:///c:/Node.Js/proj/boilerplate/.agents/blackboard/)

### Blackboard State Schema
When an agent completes a phase or delegates work, it writes a blackboard entry (e.g., `.agents/blackboard/active-task.json`):

```json
{
  "taskId": "task-uuid-or-slug",
  "originatingAgent": "@architect",
  "activeSpecialist": "@tenant-lifecycle",
  "status": "in_progress",
  "context": {
    "affectedPackages": ["@cap/platform-store", "@cap/layout"],
    "tierRange": [1, 2],
    "graphifyNodes": ["useTenant", "TenantProvider", "secureStorage"]
  },
  "findings": [
    "Identified un-prefixed storage key in secureStorage slice for tenant preferences"
  ],
  "verificationArtifacts": [
    ".agents/blackboard/shots/tenant-switch-verified.png"
  ],
  "nextAction": "Invoke @security to verify AES-GCM encryption on the new tenant scoped key"
}
```

### Information Sharing Principles
1. **Never Duplicate Analysis**: Before analyzing an area, check `.agents/blackboard/` and `.agents/memory/` for prior agent findings.
2. **Context Passing**: When transferring tasks, agents pass the blackboard context including file paths, line numbers, and verified constraints.
3. **Artifact Sharing**: Screenshots taken by `@visual-qa` or `@e2e-journey` are referenced on the blackboard so downstream agents (@theme-artisan, @ux-cognitive) can inspect visual results without re-running the browser.

---

## 4. Agent-to-Agent Delegation Protocol

Agents can directly invoke and delegate sub-tasks to other specialist personas.

### Standard Delegation Matrix

```
User / Lead Agent
       │
       ├──> @architect ──────────────> @security (review crypto/PII on new architecture)
       │         │
       │         └───────────────────> @release-dx (scaffold compliant package)
       │
       ├──> @widget-engine ──────────> @performance (benchmark widget render latency)
       │         │
       │         └───────────────────> @compliance-governance (check audit trail on widget export)
       │
       ├──> @tenant-lifecycle ───────> @mock-fixtures (seed Tenant A vs Tenant B mock data)
       │         │
       │         └───────────────────> @network-boundary (wipe query cache on tenant switch)
       │
       └──> @flow-state ─────────────> @e2e-journey (simulate multi-screen human user journey)
                 │
                 └───────────────────> @visual-qa (capture hydrated shell screenshot)
```

### Delegation Invocation Contract
When delegating, the calling agent MUST state:
1. **Target Agent**: E.g., `DELEGATE TO: @security`
2. **Objective**: Specific single-responsibility goal.
3. **Blackboard Context**: Affected files, line numbers, and existing test results.
4. **Verification Requirement**: The exact verification command or artifact expected before returning control.

Example:
```markdown
DELEGATE TO: @mock-fixtures
GOAL: Create deterministic MSW handlers for tenant feature-flag overrides conforming to @cap/api-contracts.
CONTEXT: packages/api-contracts/src/endpoints/tenant.ts
EXPECTED DELIVERABLE: Fixture factory in packages/api-contracts/src/__fixtures__/tenant.ts passing typecheck.
```

---

## 5. Mandatory Graphify & Visual QA Directives

### Graphify Mandate
1. **Before Modifying Code**:
   - Run `graphify query "<query>"` to identify dependencies and callers.
   - Run `graphify path "<SourceFile>" "<TargetFile>"` to ensure no illegal tier boundary bridges exist.
2. **After Modifying Code**:
   - Always run `graphify update .` to update the AST graph so downstream agents operate on an up-to-date model.

### Visual QA Playwright Mandate
1. Any modification touching:
   - Layout components (`@cap/layout`)
   - Navigation menus (`NavItemConfig`)
   - Theme palettes or visual effect presets (`@cap/theme`)
   - Route transitions or lazy chunks (`@cap/platform-core`)
   **MUST be verified using the visual driver**:
   ```bash
   node .claude/skills/run-serafort-app/driver.mjs probe /
   node .claude/skills/run-serafort-app/driver.mjs shot /dashboard .agents/blackboard/shots/dashboard.png --shell
   ```
2. Inspect the screenshot to verify that:
   - File size is > 3 KB (not a blank canvas or failed render).
   - Authenticated veil and backdrop at z-index 1400 are stripped cleanly.
   - Contrast, typography, and alignment satisfy the 4 Key UI Principles.
