/**
 * Endpoint registry drift guard.
 *
 * `API_ENDPOINTS` is the frontend's single source of truth for backend URLs, but
 * nothing structurally tied it to the routes the backend actually serves. When a
 * route was removed or reshaped for a security finding, the registry kept
 * pointing at the old URL and the failure surfaced as a 404 inside a shipped auth
 * flow rather than as a red build.
 *
 * These tests close that loop against a committed snapshot of
 * `node ace list:routes` (refresh it with `node scripts/sync-route-snapshot.mjs`).
 *
 * Scope is the authentication and identity surface: `/api/auth/*`,
 * `/api/user/*`, `/api/mfa/*`, `/api/organizations/*`, the admin tree on both
 * `/api/admin/*` and `/api/v1/admin/*`, and their `/api/v1` counterparts. The
 * product trees that merely sit behind the same auth boundary — blockchain,
 * civil registry, NFC access control, automation, backup, the anonymous guest
 * endpoints — are out of scope by `OUT_OF_SCOPE` below; they are not identity
 * routes and asserting on them would fail for reasons unrelated to what this
 * guard is meant to catch.
 */

import { describe, it, expect } from "vitest";

import routeSnapshot from "./__fixtures__/backend-routes.json";
import { API_ENDPOINTS } from "./endpoints";

interface BackendRoute {
  method: string;
  pattern: string;
  /** Adonis route name, e.g. "api.auth.mfa.setup"; "" for unnamed routes. */
  name: string;
}

const backendRoutes: BackendRoute[] = routeSnapshot.routes;

const AUTH_SURFACE =
  /^\/api\/(auth|user|mfa|admin|organizations|scim|v1\/(auth|user|admin|scim))(\/|$)/;

/**
 * Carved out of `AUTH_SURFACE`: routes that live under an identity prefix but
 * are not identity routes. They are product features that happen to be mounted
 * inside the admin tree, or anonymous-visitor endpoints with no principal at
 * all, and wiring them is a separate piece of work from this guard's subject.
 */
const OUT_OF_SCOPE =
  /^\/api\/(v1\/)?admin\/(backup|guest|docs|sandbox|civil-registry|contact-messages)(\/|$)|\/nfc\/|^\/api\/(v1\/)?admin\/events(\/|$)/;

/**
 * Exemptions matched on the URL rather than the Adonis route name, for the two
 * cases a name cannot reach.
 *
 * The `/api/mfa/*` mount is declared without `.as()`, so every route there
 * shares the empty name and no name-keyed set can single one out. The SCIM
 * trees are named, but there are 32 of them across two mounts and listing each
 * would say the same thing 32 times.
 */
const EXEMPT_PATTERNS: { pattern: RegExp; reason: string }[] = [
  {
    // Mounted a second time at `/api/mfa` for older clients, on the same
    // `totp_controller` methods the registry already reaches through
    // `auth.mfa.setup`, `auth.mfa.verify` and `auth.mfa.stepUp.recovery`.
    pattern: /^\/api\/mfa\/totp\/(enroll|recovery)$/,
    reason: "duplicate mount of the /api/auth/mfa TOTP routes",
  },
  {
    // SCIM 2.0 is an inbound provisioning API: an identity provider calls it
    // with a bearer token issued to the connector, guarded by `scimAuth()`
    // rather than the user session. The browser configures SCIM through
    // `admin.scim.*`; it never speaks SCIM itself.
    pattern: /^\/(api\/)?scim\/v2(\/|$)/,
    reason: "inbound SCIM provisioning API, called by the IdP not the browser",
  },
  {
    // `/api/v1/*` is canonical for auth, but not for admin: several v1 admin
    // routes are gated more weakly than the legacy twins that reach the same
    // controllers — `alert-rules` and `threat-intel` carry no `admin()` at all,
    // and the v1 RBAC policy routes drop the `mfa()` step-up plus
    // `requirePermission('org:manage')` the legacy mount enforces. The registry
    // therefore targets the legacy admin tree, and the v1 twins stay uncovered
    // on purpose. A v1 admin route the registry *does* target is covered
    // normally and never reaches this list. Revisit once the v1 admin mount
    // carries the same middleware as the legacy one.
    pattern: /^\/api\/v1\/admin\//,
    reason: "v1 admin twin, deliberately not called — see the admin exception",
  },
];

/**
 * Backend routes that exist but which no browser client should call, so the
 * coverage test below does not report them as gaps. These are IdP protocol and
 * server-to-server endpoints: they authenticate with client credentials or are
 * driven by an identity provider rather than by our own UI.
 */
const NOT_BROWSER_CALLABLE = new Set([
  "api.auth.oidc",
  "api.auth.oidc.backchannelLogout",
  "api.auth.oidc.introspect",
  "api.auth.oidc.par",
  "api.auth.oidc.register",
  "api.auth.saml.sso",
  // Server-rendered sign-in view for the OIDC interaction flow. The SPA renders
  // its own sign-in screen and never fetches this.
  "api.auth.login.view",
  // The user agent posts here by itself, from the `report-uri` in the
  // Content-Security-Policy header. Application code never calls it, and a
  // registry entry would imply it should.
  "api.admin.security.csp",
]);

/**
 * Backend routes that are pure aliases of a route the registry already covers —
 * same controller method, different path. The backend keeps them for older
 * clients; adding a second registry key for the same handler would just create
 * two ways to spell one call.
 */
const DUPLICATE_ALIAS = new Set([
  // → totp_controller.verifyLogin, covered as `auth.mfa.verifyLogin`.
  "api.auth.mfa.totp.verify",
  "api.auth.mfa.totp.verifyLogin",
  // → totp_controller.recoveryVerify, covered as `auth.mfa.recoveryVerify`.
  "api.auth.mfa.totp.recoveryVerify",
]);

/**
 * `/api/v1/auth/*` routes that share a name with something the frontend already
 * calls but are **not** twins of it. Each was checked against the legacy handler
 * and rejected; the registry stays on the legacy route. Recorded here so the
 * coverage test does not read them as gaps, and so nobody repeats the check.
 *
 * - `mfa.totpSetup` / `mfa.totpVerify` — a separate implementation, not a
 *   delegation. Setup answers `{ secret, qrCodeUrl, backupCodes }` against the
 *   legacy `{ qrDataUrl, manualEntry }`, and returns the raw TOTP seed to the
 *   browser where the legacy route keeps it in Redis.
 * - `verifyEmail` — expects `email` + an encrypted `token` in the body. The
 *   mailed link is a *signed URL* for the legacy route, and its signature is
 *   validated against the request URL, so it cannot be moved into a body.
 * - `verifyResetPassword` — despite the name this performs the reset rather
 *   than verifying the link, so its twin is `auth.resetPassword`, not
 *   `auth.verifyResetPassword`. It is also weaker than the legacy reset: it
 *   reads then deletes the token in two steps where the legacy path consumes it
 *   atomically, and it calls `revokeAllUserTokens` rather than the
 *   `revokeAllForUser` the legacy controller moved to under finding T0-8,
 *   leaving opaque bearer tokens valid after a password reset.
 */
const V1_NOT_A_TWIN = new Set([
  "api.v1.auth.mfa.totpSetup",
  "api.v1.auth.mfa.totpVerify",
  "api.v1.auth.verifyEmail",
  "api.v1.auth.verifyResetPassword",
]);

/**
 * Legacy routes the frontend intentionally skips because it calls the
 * `/api/v1/auth/*` twin instead. `/api/v1/*` is the canonical surface for this
 * frontend — the backend group is declared as adhering "strictly to
 * @cap/api-contracts and CAP Boilerplate frontend specs" — so the legacy twin
 * staying uncovered is the intended end state, not a gap.
 */
const SUPERSEDED_BY_V1 = new Set([
  "api.auth.logout",
  "api.auth.signin",
  "api.auth.register",
  "api.auth.register.alias",
  "api.auth.refresh",
  "api.auth.passkey.login.finish",
  "api.auth.passkey.login.start",
  "api.auth.passkey.register.finish",
  "api.auth.passkey.register.start",
  "api.auth.oidc.deviceVerifyAlias",
  "api.user.mfaMethods.alias",
  // `admin.security.health` reads the v1 route: same controller, and it sits
  // with the rest of the v1 security block the dashboard already calls.
  "api.admin.security.health",
  // `user.emailPreferences` reads `/api/v1/user/email-preferences`. The legacy
  // mount's PATCH has no v1 counterpart and no caller.
  "api.user.emailPreferences.show",
  "api.user.emailPreferences.update",
  "api.user.emailPreferences.patch",
]);

/**
 * Backend auth routes the frontend does not reach yet. Every entry here is a
 * known gap being worked through; deleting an entry as it gets wired is the
 * point, so this list should only ever shrink.
 *
 * Empty as of the pass that wired `auth.me` and the authenticated recovery-code
 * step-up. Keep it empty: a genuinely new gap belongs here with a note on what
 * has to happen to close it, not in one of the exemption sets above — those say
 * "never", this says "not yet".
 */
const KNOWN_UNWIRED = new Set<string>([]);

interface RegistryPath {
  /** Dotted key into API_ENDPOINTS, e.g. "auth.mfa.setup" — names the failure. */
  key: string;
  /**
   * Every shape this leaf can resolve to. A plain string leaf has one. A builder
   * has two, because its arguments are not all the same kind of thing: most
   * interpolate a value into the path, so `(id) => \`/api/user/tokens/${id}\``
   * has to compare against `/api/user/tokens/:id`, but some take a whole query
   * string to append, and those only match once the argument is empty. Matching
   * on either shape keeps both kinds honest without the registry having to
   * declare which is which.
   */
  candidates: string[];
}

function resolveLeaf(value: string | ((...a: unknown[]) => string)): string[] {
  if (typeof value === "string") return [value];
  const withParams = Array.from({ length: value.length }, () => ":param");
  const withEmpty = Array.from({ length: value.length }, () => "");
  return [value(...withParams), value(...withEmpty)];
}

/** Walk the registry and resolve every leaf to the paths it can produce. */
function collectRegistryPaths(
  value: unknown,
  key = "",
  acc: RegistryPath[] = [],
): RegistryPath[] {
  if (typeof value === "string" || typeof value === "function") {
    acc.push({
      key,
      candidates: resolveLeaf(value as string | ((...a: unknown[]) => string)),
    });
    return acc;
  }
  if (value !== null && typeof value === "object") {
    for (const [childKey, child] of Object.entries(value)) {
      collectRegistryPaths(child, key ? `${key}.${childKey}` : childKey, acc);
    }
  }
  return acc;
}

/** Drop the query string and reduce every param to a single token, so that the
 *  registry's `${email}` and the backend's `:email` compare equal. */
function normalize(path: string): string {
  const withoutQuery = path.split("?")[0];
  const collapsed = withoutQuery.replace(/:[A-Za-z_][A-Za-z0-9_]*\??/g, ":param");
  return collapsed.length > 1 ? collapsed.replace(/\/$/, "") : collapsed;
}

function inScope(path: string): boolean {
  const normalized = normalize(path);
  return AUTH_SURFACE.test(normalized) && !OUT_OF_SCOPE.test(normalized);
}

const registryPaths = collectRegistryPaths(API_ENDPOINTS).filter((entry) =>
  entry.candidates.some(inScope),
);

const authRoutes = backendRoutes.filter((route) => inScope(route.pattern));

/** Exact patterns the backend serves, plus the shorter form of every optional
 *  trailing param (`/sessions/:id?` also answers `/sessions`). */
const servedPaths = new Set<string>();
/** Prefixes from wildcard routes such as `/api/auth/oidc/*`. */
const servedPrefixes: string[] = [];

for (const route of authRoutes) {
  if (route.pattern.endsWith("/*")) {
    servedPrefixes.push(normalize(route.pattern.slice(0, -2)));
    continue;
  }
  servedPaths.add(normalize(route.pattern));
  if (/:[A-Za-z_][A-Za-z0-9_]*\?$/.test(route.pattern)) {
    servedPaths.add(normalize(route.pattern.replace(/\/:[A-Za-z_][A-Za-z0-9_]*\?$/, "")));
  }
}

function isServed(path: string): boolean {
  const normalized = normalize(path);
  if (servedPaths.has(normalized)) return true;
  return servedPrefixes.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

describe("API_ENDPOINTS drift guard", () => {
  it("captured the backend route snapshot", () => {
    expect(backendRoutes.length).toBeGreaterThan(0);
    expect(authRoutes.length).toBeGreaterThan(0);
  });

  it("resolves every registry auth path to a route the backend serves", () => {
    const dead = registryPaths
      .filter((entry) => !entry.candidates.some(isServed))
      .map((entry) => `${entry.key} -> ${entry.candidates.join(" | ")}`);

    expect(
      dead,
      "registry paths with no matching backend route (the backend removed or " +
        "reshaped these; refresh the snapshot if the backend changed on purpose)",
    ).toEqual([]);
  });

  it("has no unlisted gaps in backend auth coverage", () => {
    const covered = new Set(
      registryPaths.flatMap((entry) => entry.candidates.map(normalize)),
    );

    const uncovered = authRoutes
      .filter((route) => {
        if (route.pattern.endsWith("/*")) return false;
        if (NOT_BROWSER_CALLABLE.has(route.name)) return false;
        if (SUPERSEDED_BY_V1.has(route.name)) return false;
        if (DUPLICATE_ALIAS.has(route.name)) return false;
        if (V1_NOT_A_TWIN.has(route.name)) return false;
        if (EXEMPT_PATTERNS.some((e) => e.pattern.test(normalize(route.pattern))))
          return false;
        return !covered.has(normalize(route.pattern));
      })
      .filter((route) => !KNOWN_UNWIRED.has(route.name))
      // The `/api/mfa` mount declares no route names, so reporting the name
      // alone would print a bare "" that names nothing. Fall back to the URL.
      .map((route) => route.name || `${route.method} ${route.pattern}`);

    expect(
      [...new Set(uncovered)].sort(),
      "backend auth routes with no registry entry — wire them, or add to " +
        "KNOWN_UNWIRED / NOT_BROWSER_CALLABLE / SUPERSEDED_BY_V1 / " +
        "DUPLICATE_ALIAS / V1_NOT_A_TWIN / EXEMPT_PATTERNS with a reason",
    ).toEqual([]);
  });
});
