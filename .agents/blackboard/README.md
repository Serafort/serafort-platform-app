# Multi-Agent Blackboard Directory

This directory serves as the inter-agent shared blackboard for the **Serafort CAP Multi-Tenant Platform**. Agents write context, active task statuses, findings, and verification screenshots here to share information and eliminate redundant analysis.

---

## Directory Structure

```
.agents/blackboard/
  ├── README.md               # This specification
  ├── active-task.json        # Currently running multi-agent task state and handoff context
  └── shots/                  # Playwright driver verification screenshots
```

---

## Active Task Schema (`active-task.json`)

When an agent initiates a task or passes context to another specialist, it writes or updates `active-task.json`:

```json
{
  "taskId": "task-uuid-or-slug",
  "originatingAgent": "@architect",
  "activeSpecialist": "@tenant-lifecycle",
  "status": "in_progress",
  "phase": "plan",
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

---

## Blackboard Invariants

1. **Zero-PII**: Never write raw user passwords, tokens, or PII into blackboard JSON files.
2. **Deterministic References**: Use workspace-relative paths for code references and screenshots.
3. **Continuous Cleanup**: Archived or finished tasks are logged in `.agents/memory/lessons-learned.md` before `active-task.json` is reset for the next task.
