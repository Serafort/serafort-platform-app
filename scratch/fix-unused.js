const fs = require("fs");
const path = require("path");

const log = `../packages/modules/auth/src/modules/authorization-engine/screens/api-tokens/APITokensDashboard.tsx(29,44): error TS6133: 'isError' is declared but its value is never read.
../packages/modules/auth/src/modules/authorization-engine/screens/api-tokens/MachineIdentityManagement.tsx(11,9): error TS6133: 't' is declared but its value is never read.
../packages/modules/auth/src/modules/authorization-engine/src/services/rbac.subscriber.ts(13,11): error TS6133: 'tenantId' is declared but its value is never read.
../packages/modules/auth/src/modules/authorization-engine/src/services/rbac.subscriber.ts(19,33): error TS6133: 'event' is declared but its value is never read.
../packages/modules/auth/src/modules/authorization-engine/src/services/rbac.subscriber.ts(23,30): error TS6133: 'event' is declared but its value is never read.
../packages/modules/auth/src/modules/authorization-engine/src/services/rbac.subscriber.ts(27,30): error TS6133: 'event' is declared but its value is never read.
../packages/modules/auth/src/modules/authorization-engine/src/services/rbac.subscriber.ts(31,27): error TS6133: 'event' is declared but its value is never read.
../packages/modules/auth/src/modules/identity-broker/screens/provisioning/ConnectorDetailView.tsx(3,63): error TS6133: 'Update' is declared but its value is never read.
../packages/modules/auth/src/modules/identity-broker/screens/provisioning/ConnectorDetailView.tsx(706,44): error TS6133: 'idx' is declared but its value is never read.
../packages/modules/auth/src/modules/identity-broker/screens/provisioning/DirectorySyncDashboard.tsx(506,42): error TS2339: Property 'syncLogs' does not exist on type...
../packages/modules/auth/src/modules/identity-broker/screens/provisioning/SyncLogsView.tsx(50,1): error TS6133: 'logger' is declared but its value is never read.
../packages/modules/auth/src/modules/identity-broker/screens/sso/JWKSManagement.tsx(33,11): error TS6196: 'JWKSManagementProps' is declared but never used.
../packages/modules/auth/src/modules/identity-broker/screens/sso/JWKSManagement.tsx(43,7): error TS6133: 'MOCK_KEYS' is declared but its value is never read.
../packages/modules/auth/src/modules/identity-broker/screens/sso/OIDCClientCreate.tsx(9,1): error TS6133: 'VpnKey' is declared but its value is never read.
../packages/modules/auth/src/modules/identity-broker/screens/sso/OIDCClientCreate.tsx(34,9): error TS6133: 'navigate' is declared but its value is never read.
../packages/modules/auth/src/modules/identity-broker/screens/sso/OIDCClientEdit.tsx(37,1): error TS6133: 'VpnKey' is declared but its value is never read.
../packages/modules/auth/src/modules/identity-broker/screens/sso/PermissionConsentScreen.tsx(16,1): error TS6133: 'motion' is declared but its value is never read.
../packages/modules/auth/src/modules/identity-broker/screens/sso/SAMLConfigDashboard.tsx(3,1): error TS6133: 'ExpandMore' is declared but its value is never read.
../packages/modules/auth/src/modules/identity-broker/screens/sso/SAMLConfigDashboard.tsx(11,1): error TS6133: 'InfoOutlined' is declared but its value is never read.
../packages/modules/auth/src/modules/identity-broker/screens/sso/SSFConfiguration.tsx(194,9): error TS6133: 'handleTestSSFStreamClick' is declared but its value is never read.
../packages/modules/auth/src/modules/mfa-orchestrator/screens/MFAVerificationScreen.tsx(18,17): error TS6133: 'setError' is declared but its value is never read.
../packages/modules/auth/src/modules/mfa-orchestrator/services/mfa.service.ts(7,36): error TS6133: 'email' is declared but its value is never read.
../packages/modules/auth/src/modules/mfa-orchestrator/services/mfa.service.ts(8,32): error TS6133: 'data' is declared but its value is never read.
../packages/modules/auth/src/modules/mfa-orchestrator/services/mfa.service.ts(9,29): error TS6133: 'email' is declared but its value is never read.
../packages/modules/auth/src/modules/mfa-orchestrator/services/mfa.service.ts(10,25): error TS6133: 'data' is declared but its value is never read.
../packages/modules/auth/src/modules/mfa-orchestrator/services/mfa.service.ts(19,25): error TS6133: 'userId' is declared but its value is never read.
../packages/modules/auth/src/modules/mfa-orchestrator/services/mfa.service.ts(19,41): error TS6133: 'code' is declared but its value is never read.
../packages/modules/auth/src/modules/platform-cluster/screens/developer/components/ModuleUploadModal.tsx(64,10): error TS6133: 'logCopied' is declared but its value is never read.
../packages/modules/auth/src/modules/platform-cluster/screens/developer/ModuleManagementDashboard.tsx(20,9): error TS6133: 't' is declared but its value is never read.
../packages/modules/auth/src/modules/platform-cluster/screens/monitoring/AdminOverviewDashboard.tsx(177,9): error TS6133: 't' is declared but its value is never read.
../packages/modules/auth/src/modules/platform-cluster/screens/system/CsrfErrorScreen.tsx(9,1): error TS6133: 'motion' is declared but its value is never read.
../packages/modules/auth/src/modules/platform-cluster/screens/system/MaintenanceScreen.tsx(4,1): error TS6133: 'motion' is declared but its value is never read.
../packages/modules/auth/src/modules/platform-cluster/screens/system/MaintenanceScreen.tsx(10,9): error TS6133: 'theme' is declared but its value is never read.
../packages/modules/auth/src/modules/session-manager/screens/security/AccountOverview.tsx(9,11): error TS6196: 'NavItem' is declared but never used.
../packages/modules/auth/src/modules/session-manager/screens/security/ActiveSessionsManagement.tsx(21,38): error TS6133: 'isError' is declared but its value is never read.
../packages/modules/auth/src/modules/user-directory/screens/admin/organizations/DomainVerification.tsx(7,9): error TS6133: 't' is declared but its value is never read.
../packages/modules/auth/src/modules/user-directory/screens/admin/users/ImpersonationLogs.tsx(17,9): error TS6133: 'orgId' is declared but its value is never read.
../packages/modules/auth/src/modules/user-directory/screens/admin/users/ImpersonationLogs.tsx(51,29): error TS6133: 'event' is declared but its value is never read.
../packages/modules/auth/src/modules/user-directory/screens/settings/DeactivateAccount.tsx(13,9): error TS6133: 'theme' is declared but its value is never read.
../packages/modules/auth/src/modules/user-directory/screens/settings/DeleteAccount.tsx(63,9): error TS6133: 'deleteAccountMutation' is declared but its value is never read.
../packages/platform-core/src/services/tenantService.ts(316,11): error TS6133: '_slug' is declared but its value is never read.
../packages/platform-store/src/store/slices/notificationSlice.ts(6,15): error TS6196: 'NotificationType' is declared but never used.
../packages/theme/src/hooks/useTenantTheme.ts(12,11): error TS6196: 'UseTenantThemeOptions' is declared but never used.
../packages/theme/src/overrides/core-overrides/button.ts(80,19): error TS6133: 'theme' is declared but its value is never read.
../packages/theme/src/overrides/core-overrides/card.ts(23,16): error TS6133: 'theme' is declared but its value is never read.
../packages/theme/src/overrides/core-overrides/card.ts(50,16): error TS6133: 'theme' is declared but its value is never read.
../packages/theme/src/overrides/core-overrides/input.ts(81,17): error TS6133: 'theme' is declared but its value is never read.
../packages/theme/src/overrides/MuiLayout.ts(3,36): error TS6133: 'theme' is declared but its value is never read.
../packages/theme/src/styled/NeuButton.tsx(48,46): error TS6133: 'config' is declared but its value is never read.`;

const regex =
  /^\.\.\/([^:]+)\((\d+),(\d+)\): error (TS\d+): '(.*?)' is declared but (?:its value )?is never (?:read|used)\./gm;

let match;
const edits = {};

while ((match = regex.exec(log)) !== null) {
  const file = match[1];
  const line = parseInt(match[2], 10);
  const col = parseInt(match[3], 10);
  const type = match[4];
  const variable = match[5];

  if (!edits[file]) edits[file] = [];
  edits[file].push({ line, col, type, variable });
}

for (const [file, fileEdits] of Object.entries(edits)) {
  const filePath = path.resolve("c:/Node.Js/proj/boilerplate", file);
  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    continue;
  }

  let lines = fs.readFileSync(filePath, "utf-8").split("\n");

  // Process edits from bottom to top so line numbers don't shift
  fileEdits.sort((a, b) => b.line - a.line);

  for (const edit of fileEdits) {
    let text = lines[edit.line - 1];

    // For function arguments, replace with underscore
    if (
      text.includes("(") &&
      text.includes(")") &&
      !text.trim().startsWith("import") &&
      !text.trim().startsWith("type ") &&
      !text.trim().startsWith("interface ")
    ) {
      text = text.replace(
        new RegExp(`\\b${edit.variable}\\b`),
        `_${edit.variable}`,
      );
    } else if (text.trim().startsWith("import")) {
      // Remove from import
      text = text.replace(new RegExp(`\\b${edit.variable}\\b\\s*,?`), "");
      // Clean up empty imports
      text = text.replace(/\{\s*\}/, "");
      if (
        text.trim() === "import from '" + text.split("'")[1] + "';" ||
        text.trim() === "import '" + text.split("'")[1] + "';" ||
        text.trim() === 'import ""' ||
        text.match(/^import ['"]/)
      ) {
        // Let's just leave it if it's empty, or comment it out
        if (!text.includes("{") && !text.includes(" as ")) {
          text = "// " + text;
        }
      }
    } else {
      // Just prefix with underscore for other things like local variables
      text = text.replace(
        new RegExp(`\\b${edit.variable}\\b`),
        `_${edit.variable}`,
      );
    }

    lines[edit.line - 1] = text;
  }

  fs.writeFileSync(filePath, lines.join("\n"), "utf-8");
  console.log("Fixed:", filePath);
}
