---
name: agent-delegation
description: Protocol for inter-agent delegation, context hand-offs, blackboard state sharing, and specialist invocation.
---

# Workflow: Inter-Agent Delegation & Blackboard Protocol

This workflow details how specialist agents invoke other specialist agents and exchange data using the repository's shared blackboard.

---

## 1. When to Delegate

An agent should delegate sub-tasks when a task requires specialized governance:

| Scenario / Need | Delegating Agent | Target Specialist | Expected Output |
| :--- | :--- | :--- | :--- |
| Crypto, client storage encryption, or PII audit | Any | `@security` | Encryption audit & Zero-PII signoff |
| Multi-tenant storage keys or tenant teardown | `@architect` | `@tenant-lifecycle` | Scoped storage key validation (`tenantId:userId:key`) |
| Dynamic widget manifest, Zod schema, or grid | Any | `@widget-engine` | Manifest validation & error boundary isolation |
| Offline tests, contract fixtures, MSW state | `@quality` | `@mock-fixtures` | Fixtures derived from `@cap/api-contracts` |
| Workspace dependencies, bundle chunks, generators | Any | `@release-dx` | pnpm version sync & <60kB chunk audit |
| GDPR/HIPAA/SOC 2 audit logs, idle timeout | `@security` | `@compliance-governance` | Immutable client audit event integration |
| Multi-screen human user journeys, browser back/fwd | `@flow-state` | `@e2e-journey` | Playwright journey spec passing without 404s |
| Screen URL params, `<Suspense>` skeletons, unmount | `@ux-cognitive` | `@flow-state` | Bookmarkable URL params & cleanup lifecycle |
| Visual verification, DOM geometry, screenshots | Any | `@visual-qa` | Verified screenshot via `driver.mjs` with `--shell` |

---

## 2. Delegation Handshake Steps

1. **Write Context to Blackboard**:
   - The calling agent creates or appends to `.agents/blackboard/active-task.json`:
     ```json
     {
       "delegationId": "del-001",
       "callingAgent": "@flow-state",
       "targetSpecialist": "@e2e-journey",
       "objective": "Verify browser refresh and back-button on multi-step widget configuration flow",
       "contextFiles": [
         "packages/modules/widget-studio/src/screens/WidgetConfigScreen.tsx"
       ],
       "constraints": [
         "Must test URL query param persistence without storing state in memory-only Zustand",
         "Must adhere to AppPaths routing standard"
       ]
     }
     ```
2. **Invoke Target Agent**:
   - The calling agent outputs the formal delegation statement:
     ```
     CALLING SPECIALIST: @e2e-journey
     TASK: Verify browser back/forward and refresh state on /dashboard/widgets/studio
     INPUT CONTEXT: .agents/blackboard/active-task.json
     ```
3. **Target Specialist Execution**:
   - The target specialist executes the task adhering strictly to its rule in `.agents/rules/`.
   - Records findings and output artifacts on the blackboard.
4. **Handoff Return & Synthesis**:
   - The target specialist posts completion back to the blackboard.
   - The calling agent reads the blackboard and resumes the orchestrating lifecycle.
