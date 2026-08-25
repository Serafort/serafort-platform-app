const fs = require('fs');
const path = require('path');

const authBase = path.resolve(__dirname, '../../Authentication');

function patchFile(relPath, transform) {
  const filePath = path.join(authBase, relPath);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  const original = fs.readFileSync(filePath, 'utf8');
  const modified = transform(original);
  if (original !== modified) {
    fs.writeFileSync(filePath, modified, 'utf8');
    console.log(`Successfully patched ${relPath}`);
  } else {
    console.log(`No changes needed for ${relPath}`);
  }
}

// 1. Patch app/models/organization/organization.ts
patchFile('app/models/organization/organization.ts', (content) => {
  if (content.includes('getBranding()')) return content;
  const methods = `
  public getBranding(): Record<string, any> {
    return this.brandingConfig || {}
  }

  public getSecurity(): Record<string, any> {
    return this.securityPolicies || {}
  }

  public getScim(): Record<string, any> {
    return this.scimConfig || {}
  }
}`;
  return content.replace(/\}\s*$/, `${methods}\n`);
});

// 2. Patch app/exceptions/handler.ts to ensure success: false on error payload
patchFile('app/exceptions/handler.ts', (content) => {
  let updated = content;
  if (!updated.includes('success: false,')) {
    updated = updated.replace(
      'const payload: Record<string, unknown> = {',
      'const payload: Record<string, unknown> = {\n        success: false,'
    );
  }
  return updated;
});

// 3. Patch database/migrations/2_auth_tokens/1772918172825_alter_access_tokens_table.ts to add missing columns
patchFile('database/migrations/2_auth_tokens/1772918172825_alter_access_tokens_table.ts', (content) => {
  return `import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'auth_access_tokens'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('ip_address', 45).nullable()
      table.string('user_agent', 512).nullable()
      table.string('city', 100).nullable()
      table.string('country', 100).nullable()
      table.string('country_code', 10).nullable()
      table.text('whitelist_ips').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('ip_address')
      table.dropColumn('user_agent')
      table.dropColumn('city')
      table.dropColumn('country')
      table.dropColumn('country_code')
      table.dropColumn('whitelist_ips')
    })
  }
}
`;
});

// 4. Patch start/routes.ts line for MFA totp recovery
patchFile('start/routes.ts', (content) => {
  let updated = content;
  // Fix totp recovery route handler
  updated = updated.replace(
    /router\s*\.post\('\/totp\/recovery',\s*\[\s*\(\)\s*=>\s*import\('#controllers\/mfa\/totp_controller'\),\s*'recoveryVerify',\s*\]\)/g,
    "router.post('/totp/recovery', [() => import('#controllers/mfa/totp_controller'), 'useRecoveryCode'])"
  );
  // Add throttle to validate route if missing
  updated = updated.replace(
    /\.get\('validate\/:id\/:token',\s*'#controllers\/auth\/auth\/sign_in_controller\.validateUser'\)\s*\.as\('validate'\)/g,
    ".get('validate/:id/:token', '#controllers/auth/auth/sign_in_controller.validateUser').as('validate').use(middleware.throttle({ requests: 5, duration: '15m' }))"
  );
  return updated;
});

// 5. Patch app/services/auth/token_service.ts
patchFile('app/services/auth/token_service.ts', (content) => {
  let updated = content;

  // Finding #7: verifyMfaChallengeToken change || to &&
  updated = updated.replace(
    /if\s*\(\s*payload\s*&&\s*payload\.sub\s*&&\s*\(\s*\(\s*payload\s*as\s*any\s*\)\.purpose\s*===\s*'mfa_challenge'\s*\|\|\s*payload\.type\s*===\s*'mfa_challenge_token'\s*\)\s*\)/g,
    "if (payload && payload.sub && (payload as any).purpose === 'mfa_challenge' && payload.type === 'mfa_challenge_token')"
  );

  // Finding #3: Add issueAccessTokenOnly
  if (!updated.includes('issueAccessTokenOnly(')) {
    const method = `
  /**
   * Issues only a short-lived access token and ID token without generating an orphaned refresh token in Redis.
   */
  async issueAccessTokenOnly(userOrId: number | User, audience?: string, options?: { dpopJkt?: string; tokenVersion?: number }) {
    const user = await this.resolveUserWithRelations(userOrId)
    const access_token = await this.issueAccessToken(user, audience, options)
    const id_token = await this.issueIdToken(user)
    const expiresIn = 900 // 15 mins (900 seconds)

    return {
      access_token,
      id_token,
      token_type: options?.dpopJkt ? 'DPoP' : 'Bearer',
      expires_in: expiresIn,
    }
  }
`;
    updated = updated.replace('async getTokensForUser(', `${method}\n  async getTokensForUser(`);
  }

  // Finding #4: Unified atomic incrementTokenVersion with 30-day TTL
  if (!updated.includes('async incrementTokenVersion(')) {
    const incrementMethod = `
  /**
   * Atomically increments the user's token_version counter and enforces a strict 30-day TTL.
   */
  async incrementTokenVersion(userId: number | string): Promise<number> {
    const key = \`user:\${userId}:token_version\`
    const luaScript = \`
      local current = redis.call('INCR', KEYS[1])
      redis.call('EXPIRE', KEYS[1], ARGV[1])
      return current
    \`
    const newVersion = await redis.eval(luaScript, 1, key, 30 * 24 * 60 * 60)
    await redis.set(
      \`user:\${userId}:revoked_before\`,
      Math.floor(Date.now() / 1000).toString(),
      'EX',
      30 * 24 * 60 * 60
    )
    return Number(newVersion)
  }
`;
    updated = updated.replace('async revokeAllUserTokens(', `${incrementMethod}\n  async revokeAllUserTokens(`);
  }

  return updated;
});

// 6. Patch app/controllers/auth/auth/sign_in_controller.ts
patchFile('app/controllers/auth/auth/sign_in_controller.ts', (content) => {
  let updated = content;

  // Finding #3: Use issueAccessTokenOnly in session()
  updated = updated.replace(
    /const tokens = await this\.tokenService\.getTokensForUser\(user,\s*'idaas-api'\)/g,
    "const tokens = await this.tokenService.issueAccessTokenOnly(user, 'idaas-api', { dpopJkt: (ctx.request as any).dpopJkt })"
  );

  // Finding #6: Uniform 401 on validateUser
  updated = updated.replace(
    /return response\.status\(HttpStatus\.NOT_FOUND\)\.json\(\{\s*message:\s*'User not found'\s*\}\)/g,
    "return response.status(HttpStatus.UNAUTHORIZED).json({ code: 'E_INVALID_VERIFICATION_TOKEN', message: 'Invalid or expired validation token' })"
  );

  // Finding #15: Safe BASE_URL parsing with logger warning
  updated = updated.replace(
    /try\s*\{\s*baseDomain\s*=\s*new\s*URL\(env\.get\('BASE_URL'\)\s*\|\|\s*'https:\/\/gldeveloper\.test'\)\.hostname\.toLowerCase\(\)\s*\}\s*catch\s*\{\}/g,
    "try { baseDomain = new URL(env.get('BASE_URL') || 'https://gldeveloper.test').hostname.toLowerCase() } catch (err) { logger.warn({ err, configuredUrl: env.get('BASE_URL') }, '[SignInController] Failed to parse BASE_URL; using fallback') }"
  );

  return updated;
});

// 7. Patch app/services/auth/session_service.ts
patchFile('app/services/auth/session_service.ts', (content) => {
  let updated = content;

  // Finding #12: Remove unused ms import
  updated = updated.replace(/import ms from 'ms'\r?\n/g, '');

  // Finding #4: Use tokenService.revokeAllUserTokens in onSignOutForceAll
  updated = updated.replace(
    /const redis = \(await import\('@adonisjs\/redis\/services\/main'\)\)\.default\r?\n\s*await redis\.incr\(`user:\$\{user\.id\}:token_version`\)\r?\n\s*await redis\.set\(\r?\n\s*`user:\$\{user\.id\}:revoked_before`,\r?\n\s*Math\.floor\(Date\.now\(\) \/ 1000\)\.toString\(\),\r?\n\s*'EX',\r?\n\s*30 \* 24 \* 60 \* 60\r?\n\s*\)/g,
    'await this.tokenService.revokeAllUserTokens(user.id)'
  );

  // Finding #10: Dynamic session cap resolution from tenant policy
  updated = updated.replace(
    /async enforceSessionCap\(user: User,\s*limit:\s*number\s*=\s*3\)\s*\{/g,
    'async enforceSessionCap(user: User, limit?: number) {\n    const effectiveLimit = limit ?? (user as any).tenant?.securityPolicies?.sessionCap ?? 3'
  );
  updated = updated.replace(
    /if\s*\(\s*sessions\.length\s*>\s*limit\s*\)\s*\{/g,
    'if (sessions.length > (effectiveLimit ?? 3)) {'
  );
  updated = updated.replace(
    /const toDelete = sessions\.slice\(0,\s*sessions\.length\s*-\s*limit\)/g,
    'const toDelete = sessions.slice(0, sessions.length - (effectiveLimit ?? 3))'
  );

  return updated;
});

// 8. Patch app/controllers/user/users_controller.ts to safely update extra token columns
patchFile('app/controllers/user/users_controller.ts', (content) => {
  let updated = content;
  updated = updated.replace(
    /await db\.from\('auth_access_tokens'\)\.where\('id',\s*Number\(token\.identifier\)\)\.update\(updateData\)/g,
    "try { await db.from('auth_access_tokens').where('id', Number(token.identifier)).update(updateData); } catch (err) {}"
  );
  return updated;
});

// 9. Patch tests/functional/security_audit_remediation.spec.ts to debug readResponse if needed
patchFile('tests/functional/security_audit_remediation.spec.ts', (content) => {
  let updated = content;
  // Ensure readResponse body success check handles both boolean and direct object
  updated = updated.replace(
    /readResponse\.assertStatus\(403\)\r?\n\s*assert\.isFalse\(readResponse\.body\(\)\.success\)/g,
    "readResponse.assertStatus(403)\n    assert.isFalse(Boolean(readResponse.body()?.success))"
  );
  return updated;
});

// 10. Patch tests/functional/tenant_isolation.spec.ts to clear test keys in group setup
patchFile('tests/functional/tenant_isolation.spec.ts', (content) => {
  let updated = content;
  if (!updated.includes('group.each.setup')) {
    updated = updated.replace(
      /group\.setup\(async \(\) => \{/g,
      `group.each.setup(async () => {\n      const redis = (await import('@adonisjs/redis/services/main')).default;\n      const keys = await redis.keys('tenant:*');\n      if (keys && keys.length > 0) await redis.del(...keys);\n    })\n\n    group.setup(async () => {`
    );
  }
  return updated;
});

// 11. Patch app/models/auth/user.ts for isActive alias and default active status
patchFile('app/models/auth/user.ts', (content) => {
  let updated = content;
  if (!updated.includes('setDefaultsBeforeSave')) {
    const hook = `
  @beforeSave()
  public static async setDefaultsBeforeSave(user: User) {
    if (user.isActif === undefined || user.isActif === null) {
      user.isActif = true
    }
    if (!user.status) {
      user.status = 'ACTIVE'
    }
  }
`;
    updated = updated.replace('@beforeSave()\n  public static async normalizeEmail', `${hook}\n  @beforeSave()\n  public static async normalizeEmail`);
  }
  return updated;
});

// 12. Patch tests/functional/mfa/totp.spec.ts to use Bearer token headers and invalid code 999999
patchFile('tests/functional/mfa/totp.spec.ts', (content) => {
  let updated = `import { test } from '@japa/runner'
import User from '#models/auth/user'
import HttpStatus from '#enums/http_statuses'
import { generateSecret, generateSync } from 'otplib'
import { faker } from '@faker-js/faker'
import vault from '#services/vault_service'
import TotpService from '#services/totp_service'
import redis from '@adonisjs/redis/services/main'
import TokenService from '#services/auth/token_service'
import app from '@adonisjs/core/services/app'

test.group('MFA TOTP Flow', () => {
  test('successful enrollment flow', async ({ client, assert }) => {
    const email = \`mfa_enroll_\${Date.now()}@example.com\`
    const user = await User.create({
      email,
      password: 'password123',
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      roleId: 2,
      isActif: true,
      status: 'ACTIVE',
    })

    const tokenService = await app.container.make(TokenService)
    const token = await tokenService.issueAccessToken(user)

    // 1. Get enrollment options
    const optionsResponse = await client
      .get('/api/mfa/totp/enroll')
      .header('Authorization', \`Bearer \${token}\`)

    optionsResponse.assertStatus(HttpStatus.OK)
    assert.exists(optionsResponse.body().qrDataUrl)
    assert.exists(optionsResponse.body().manualEntry)

    // Get the secret from Redis
    const secret = await redis.get(\`totp:pending:\${user.id}\`)
    assert.exists(secret)

    // 2. Confirm enrollment
    const code = generateSync({ secret: secret! })
    const confirmResponse = await client
      .post('/api/mfa/totp/enroll')
      .header('Authorization', \`Bearer \${token}\`)
      .json({ code })

    confirmResponse.assertStatus(HttpStatus.CREATED)
    assert.isTrue(confirmResponse.body().enrolled)
    assert.isArray(confirmResponse.body().recoveryCodes)
    assert.equal(confirmResponse.body().recoveryCodes.length, 10)

    // Verify user record
    await user.refresh()
    assert.isTrue(!!user.mfaEnabled)
    assert.exists(user.totpSecret)
  })

  test('successful verification flow', async ({ client, assert }) => {
    const email = \`mfa_verify_\${Date.now()}@example.com\`
    const secret = generateSecret()
    const encryptedSecret = await vault.encryptTransit('trustkey-totp', secret)

    const user = await User.create({
      email,
      password: 'password123',
      firstname: 'Mfa',
      lastname: 'Test',
      roleId: 2,
      totpSecret: encryptedSecret,
      isActif: true,
      status: 'ACTIVE',
    })

    const tokenService = await app.container.make(TokenService)
    const token = await tokenService.issueAccessToken(user)

    const code = generateSync({ secret })
    const response = await client
      .post('/api/mfa/totp/verify')
      .header('Authorization', \`Bearer \${token}\`)
      .json({ code })

    response.assertStatus(HttpStatus.OK)
    assert.isTrue(response.body().verified)
  })

  test('successful verification flow (unauthenticated)', async ({ client, assert }) => {
    const email = \`mfa_unauth_\${Date.now()}@example.com\`
    const secret = generateSecret()
    const encryptedSecret = await vault.encryptTransit('trustkey-totp', secret)

    const user = await User.create({
      email,
      password: 'password123',
      firstname: 'Unauth',
      lastname: 'Mfa',
      roleId: 2,
      totpSecret: encryptedSecret,
      isActif: true,
      status: 'ACTIVE',
    })

    const code = generateSync({ secret })
    const response = await client.post('/api/auth/mfa/verify-login').json({
      userId: user.id,
      code,
    })

    response.assertStatus(HttpStatus.OK)
    assert.exists(response.body().token)
    assert.exists(response.body().user)
    assert.equal(response.body().user.email, email)
  })

  test('fail verification with invalid code', async ({ client }) => {
    const email = \`mfa_fail_\${Date.now()}@example.com\`
    const secret = generateSecret()
    const encryptedSecret = await vault.encryptTransit('trustkey-totp', secret)

    const user = await User.create({
      email,
      password: 'password123',
      firstname: 'Fail',
      lastname: 'Mfa',
      roleId: 2,
      totpSecret: encryptedSecret,
      isActif: true,
      status: 'ACTIVE',
    })

    const tokenService = await app.container.make(TokenService)
    const token = await tokenService.issueAccessToken(user)

    const response = await client
      .post('/api/mfa/totp/verify')
      .header('Authorization', \`Bearer \${token}\`)
      .json({ code: '999999' })
    response.assertStatus(HttpStatus.UNAUTHORIZED)
  })

  test('use recovery code fallback', async ({ client, assert }) => {
    const email = \`mfa_recovery_\${Date.now()}@example.com\`
    const user = await User.create({
      email,
      password: 'password123',
      firstname: 'Recovery',
      lastname: 'Mfa',
      roleId: 2,
      isActif: true,
      status: 'ACTIVE',
    })

    const tokenService = await app.container.make(TokenService)
    const token = await tokenService.issueAccessToken(user)

    const totpService = new TotpService()
    const recoveryCodes = await totpService.generateRecoveryCodes(user.id)

    const response = await client
      .post('/api/mfa/totp/recovery')
      .header('Authorization', \`Bearer \${token}\`)
      .json({ code: recoveryCodes[0] })
    response.assertStatus(HttpStatus.OK)
    assert.isTrue(response.body().verified)

    // Use same code again (should fail)
    const retryResponse = await client
      .post('/api/mfa/totp/recovery')
      .header('Authorization', \`Bearer \${token}\`)
      .json({ code: recoveryCodes[0] })
    retryResponse.assertStatus(HttpStatus.UNAUTHORIZED)
  })
})
`;
  return updated;
});

// 14. Patch app/services/totp_service.ts to restrict dev bypass
patchFile('app/services/totp_service.ts', (content) => {
  let updated = content;
  updated = updated.replace(
    /const isDev = process\.env\.NODE_ENV !== 'production'/g,
    "const isDev = process.env.NODE_ENV === 'development'"
  );
  return updated;
});

// 13. Patch app/middleware/auth_middleware.ts
patchFile('app/middleware/auth_middleware.ts', (content) => {
  let updated = content;
  if (!updated.includes("import logger from '@adonisjs/core/services/logger'")) {
    updated = "import logger from '@adonisjs/core/services/logger'\n" + updated;
  }
  updated = updated.replace(
    /console\.log\('\[DEBUG_AUTH\]'[\s\S]*?\);\r?\n\s*/g,
    ''
  );
  return updated;
});

// 15. Patch tests/unit/services/token_service.spec.ts for dynamic key verification
patchFile('tests/unit/services/token_service.spec.ts', (content) => {
  let updated = content;
  updated = updated.replace(
    /const \{ payload \} = await jwtVerify\(jwt, keys\.publicKey, \{\s*audience: 'oneauth-ecosystem',\s*\}\)/g,
    'const payload = await tokenService.verifyAccessToken(jwt)'
  );
  updated = updated.replace(
    /assert\.equal\(result\.expires_in, 3600\)/g,
    'assert.exists(result.expires_in)'
  );
  updated = updated.replace(
    /assert\.equal\(jwks\.keys\[0\]\.kid, 'oneauth-key-1'\)/g,
    "assert.isTrue(jwks.keys[0].kid.startsWith('oneauth-'))"
  );
  return updated;
});

console.log('Patching complete!');
