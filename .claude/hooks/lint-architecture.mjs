// PostToolUse hook: after an edit under app/ or packages/, run the fast
// architecture guards (tier boundaries + route literals). Exit code 2 feeds
// stderr back to Claude so violations are fixed in the same turn.
import { spawnSync } from 'node:child_process';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '..', '..', '..');

let input = '';
for await (const chunk of process.stdin) input += chunk;

let filePath = '';
try {
  const payload = JSON.parse(input);
  filePath = payload?.tool_input?.file_path ?? '';
} catch {
  process.exit(0);
}

if (!filePath) process.exit(0);

const normRoot = root.replace(/\\/g, '/').toLowerCase();
const normPath = resolve(filePath).replace(/\\/g, '/');
let rel = '';
if (normPath.toLowerCase().startsWith(normRoot)) {
  rel = normPath.slice(normRoot.length).replace(/^\/+/, '');
} else {
  rel = relative(root, resolve(filePath)).replace(/\\/g, '/');
}

const inScope = /^(app|packages)\/.+\.(ts|tsx)$/.test(rel) && !rel.includes('/dist/');
if (!inScope) process.exit(0);

const checks = [
  ['lint:boundaries', 'scripts/check-tier-boundaries.mjs'],
  ['lint:routes', 'scripts/check-route-literals.mjs'],
];

const failures = [];
for (const [name, script] of checks) {
  const r = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', timeout: 30000 });
  if (r.status !== 0) failures.push(`[${name}] ${rel}\n${(r.stdout || '') + (r.stderr || '')}`.trim());
}

if (failures.length) {
  process.stderr.write(`Architecture guard failed after editing ${rel}:\n\n${failures.join('\n\n')}\n`);
  process.exit(2);
}

process.exit(0);
