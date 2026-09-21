#!/usr/bin/env node
/*
 * db.mjs — READ-ONLY SQL against the Authentication service's Postgres.
 *
 * Every statement runs inside `BEGIN READ ONLY … ROLLBACK`, so it cannot
 * change data even if the SQL tries to. Connection settings come from
 * C:\Node.Js\proj\Authentication\.env and the `pg` driver from that project's
 * node_modules — there is no psql on this machine.
 *
 * Usage:
 *   node .claude/skills/audit-page-data/db.mjs "select count(*) from passkey_credentials where user_id = :uid" --email admin@example.com
 *   node .claude/skills/audit-page-data/db.mjs --preset whose passkey_credentials
 *   node .claude/skills/audit-page-data/db.mjs --preset rls passkey_credentials
 *   node .claude/skills/audit-page-data/db.mjs --preset columns audit_logs
 *   node .claude/skills/audit-page-data/db.mjs "..." --as-app    # connect as PG_APP_ROLE (what the running app uses)
 *
 * `:uid` in the SQL is replaced by the id of --email (default admin@example.com).
 * Options: --backend <path to Authentication repo>
 */
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'

const argv = process.argv.slice(2)
const flag = (n, d = null) => (argv.indexOf('--' + n) === -1 ? d : argv[argv.indexOf('--' + n) + 1])
const has = (n) => argv.includes('--' + n)

const BACKEND = flag('backend', 'C:/Node.Js/proj/Authentication')
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(BACKEND, '.env'), 'utf8')
    .split(/\r?\n/)
    .filter((l) => /^[A-Z0-9_]+=/.test(l))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')]
    }),
)
const { Client } = createRequire(path.join(BACKEND, 'package.json'))('pg')

const asApp = has('as-app')
const client = new Client({
  host: env.PG_HOST,
  port: Number(env.PG_PORT),
  database: env.PG_DATABASE,
  user: asApp ? env.PG_APP_ROLE || 'app_runtime' : env.PG_USER,
  password: asApp ? env.PG_APP_ROLE_PASSWORD : env.PG_PASSWORD,
})

const preset = flag('preset')
const table = preset ? argv[argv.indexOf('--preset') + 2] : null
if (table && !/^[a-z_][a-z0-9_]*$/.test(table)) {
  console.error('table name must be a plain identifier')
  process.exit(2)
}
const PRESETS = {
  // Who owns the rows? Catches "the DB has data" when it belongs to other users.
  whose: `select t.user_id, u.email, count(*) from ${table} t left join users u on u.id = t.user_id group by 1,2 order by 3 desc limit 20`,
  // Row-level security flags + policies — rows invisible to the app role.
  rls: `select relname, relrowsecurity, relforcerowsecurity from pg_class where relname = '${table}';
        select policyname, cmd, qual from pg_policies where tablename = '${table}'`,
  columns: `select column_name, data_type, is_nullable from information_schema.columns where table_name = '${table}' order by ordinal_position`,
}

// Raw SQL is always the first argument.
let sql = preset ? PRESETS[preset] : argv[0]?.startsWith('--') ? null : argv[0]
if (!sql) {
  console.error('usage: db.mjs "<sql>" [--email e] [--as-app] | --preset <whose|rls|columns> <table>')
  process.exit(2)
}

await client.connect()
try {
  await client.query('BEGIN READ ONLY')
  if (sql.includes(':uid')) {
    const email = flag('email', 'admin@example.com')
    const u = await client.query('select id from users where email = $1', [email])
    if (!u.rows[0]) throw new Error(`no user with email ${email}`)
    sql = sql.replaceAll(':uid', `'${u.rows[0].id}'`)
  }
  for (const stmt of sql.split(';').map((s) => s.trim()).filter(Boolean)) {
    const r = await client.query(stmt)
    console.log(`> ${stmt.replace(/\s+/g, ' ').slice(0, 120)}`)
    if (r.rows.length) console.table(r.rows)
    else console.log('(0 rows)')
  }
} catch (e) {
  console.error('ERROR:', e.message)
  process.exitCode = 1
} finally {
  await client.query('ROLLBACK').catch(() => {})
  await client.end()
}
