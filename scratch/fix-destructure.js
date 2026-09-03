const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, search, replace) {
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(search, replace);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Replaced in ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
}

// 1. useAdminQuery.ts
let qPath = 'packages/modules/auth/src/modules/authorization-engine/hooks/useAdminQuery.ts';
if (fs.existsSync(qPath)) {
    let content = fs.readFileSync(qPath, 'utf8');
    content = content.replace(/Permission,\s*/g, '');
    content = content.replace(/import { adminService } from '\.\.\/services\/adminService';/g, "import { adminService, type Permission } from '../services/adminService';");
    fs.writeFileSync(qPath, content, 'utf8');
}

// 2. APITokensDashboard.tsx
replaceInFile(
  'packages/modules/auth/src/modules/authorization-engine/screens/api-tokens/APITokensDashboard.tsx',
  /const { data: tokens, isLoading, _isError } = useApiTokens\(\)/,
  'const { data: tokens, isLoading, isError: _isError } = useApiTokens()'
);

// 3. MachineIdentityManagement.tsx
replaceInFile(
  'packages/modules/auth/src/modules/authorization-engine/screens/api-tokens/MachineIdentityManagement.tsx',
  /const { _t } = useTranslation\('translation'\)/,
  "const { t: _t } = useTranslation('translation')"
);

// 4. rbac.subscriber.ts
replaceInFile(
  'packages/modules/auth/src/modules/authorization-engine/src/services/rbac.subscriber.ts',
  /private _tenantId: string/,
  'private tenantId: string'
);
replaceInFile(
  'packages/modules/auth/src/modules/authorization-engine/src/services/rbac.subscriber.ts',
  /this\._tenantId = tenantId/,
  'this.tenantId = tenantId'
);
replaceInFile(
  'packages/modules/auth/src/modules/authorization-engine/src/services/rbac.subscriber.ts',
  /constructor\(_tenantId: string\)/,
  'constructor(tenantId: string)'
);

// 5. ActiveSessionsManagement.tsx
replaceInFile(
  'packages/modules/auth/src/modules/session-manager/screens/security/ActiveSessionsManagement.tsx',
  /const { data: sessions, isLoading, _isError, refetch } = useActiveSessions\(\)/,
  'const { data: sessions, isLoading, isError: _isError, refetch } = useActiveSessions()'
);

// 6. DomainVerification.tsx
replaceInFile(
  'packages/modules/auth/src/modules/user-directory/screens/admin/organizations/DomainVerification.tsx',
  /const { _t } = useTranslation\('translation'\)/,
  "const { t: _t } = useTranslation('translation')"
);

// 7. AdminOverviewDashboard.tsx
replaceInFile(
  'packages/modules/auth/src/modules/platform-cluster/screens/monitoring/AdminOverviewDashboard.tsx',
  /const { _t } = useTranslation\('common'\)/,
  "const { t: _t } = useTranslation('common')"
);

// 8. ModuleManagementDashboard.tsx
replaceInFile(
  'packages/modules/auth/src/modules/platform-cluster/screens/developer/ModuleManagementDashboard.tsx',
  /const { _t } = useTranslation\('common'\)/,
  "const { t: _t } = useTranslation('common')"
);

// 9. NeuButton.tsx
replaceInFile(
  'packages/theme/src/styled/NeuButton.tsx',
  /background: \(\{\s*variant,\s*backgroundColor,\s*_config\s*\}\) =>/,
  'background: ({ variant, backgroundColor, config: _config }) =>'
);

// 10. useTenantTheme.ts
replaceInFile(
  'packages/theme/src/hooks/useTenantTheme.ts',
  /export interface _UseTenantThemeOptions/,
  'export interface UseTenantThemeOptions'
);

// 11. button.ts
replaceInFile(
  'packages/theme/src/overrides/core-overrides/button.ts',
  /\(\{\s*_theme\s*\}\) => \(\{/,
  '({ theme: _theme }) => ({'
);

// 12. card.ts
replaceInFile(
  'packages/theme/src/overrides/core-overrides/card.ts',
  /\(\{\s*_theme\s*\}\) => \(\{/g,
  '({ theme: _theme }) => ({'
);

// 13. input.ts
replaceInFile(
  'packages/theme/src/overrides/core-overrides/input.ts',
  /\(\{\s*_theme\s*\}\) => \(\{/,
  '({ theme: _theme }) => ({'
);

// 14. MaintenanceScreen.tsx
replaceInFile(
  'packages/modules/auth/src/modules/platform-cluster/screens/system/MaintenanceScreen.tsx',
  /const _theme = useTheme\(\)/,
  '// const _theme = useTheme()'
);

// 15. ImpersonationLogs.tsx
replaceInFile(
  'packages/modules/auth/src/modules/user-directory/screens/admin/users/ImpersonationLogs.tsx',
  /const { _orgId } = useParams\(\)/,
  'const { orgId: _orgId } = useParams()'
);

// 16. DeactivateAccount.tsx
replaceInFile(
  'packages/modules/auth/src/modules/user-directory/screens/settings/DeactivateAccount.tsx',
  /const _theme = useTheme\(\)/,
  '// const _theme = useTheme()'
);

// 17. DeleteAccount.tsx
replaceInFile(
  'packages/modules/auth/src/modules/user-directory/screens/settings/DeleteAccount.tsx',
  /const _deleteAccountMutation = useMutation\(\{/,
  'const deleteAccountMutation = useMutation({'
);

// 18. tenantService.ts
replaceInFile(
  'packages/platform-core/src/services/tenantService.ts',
  /async getTenantConfig\(__slug: string\)/,
  'async getTenantConfig(_slug: string)'
);
