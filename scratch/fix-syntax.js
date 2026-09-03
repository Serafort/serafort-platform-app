const fs = require('fs');

const files = [
    'c:\\Node.Js\\proj\\boilerplate\\packages\\modules\\auth\\src\\modules\\identity-broker\\screens\\provisioning\\SyncLogsView.tsx',
    'c:\\Node.Js\\proj\\boilerplate\\packages\\modules\\auth\\src\\modules\\identity-broker\\screens\\sso\\OIDCClientEdit.tsx',
    'c:\\Node.Js\\proj\\boilerplate\\packages\\modules\\auth\\src\\modules\\identity-broker\\screens\\sso\\PermissionConsentScreen.tsx',
    'c:\\Node.Js\\proj\\boilerplate\\packages\\modules\\auth\\src\\modules\\platform-cluster\\screens\\system\\CsrfErrorScreen.tsx',
    'c:\\Node.Js\\proj\\boilerplate\\packages\\modules\\auth\\src\\modules\\platform-cluster\\screens\\system\\MaintenanceScreen.tsx'
];

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/^import from '.*?'.*?$/gm, '');
        content = content.replace(/^import\s+from '.*?'.*?$/gm, '');
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
    }
}
