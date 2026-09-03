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
 * Scope is deliberately the authentication surface — `/api/auth/*`, `/api/user/*`
 * and `/api/v1/auth/*`. The admin, SCIM and blockchain trees have not been
 * audited against the backend yet, so asserting on them here would fail for
 * reasons unrelated to what this guard is meant to catch.
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

const AUTH_SURFACE = /^\/api\/(auth|user|v1\/auth)(\/|$)/;

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
]);

/**
 * Backend auth routes the frontend does not reach yet. Every entry here is a
 * known gap being worked through; deleting an entry as it gets wired is the
 * point, so this list should only ever shrink.
 */
const KNOWN_UNWIRED = new Set([
  "api.auth.appealBan",
  "api.auth.login.view",
  "api.auth.mfa.totp.recovery",
  "api.auth.mfa.totp.recoveryVerify",
  "api.auth.mfa.totp.verify",
  "api.auth.mfa.totp.verifyLogin",
  "api.auth.oidc.deviceVerify",
  "api.auth.oidc.mfa",
  "api.auth.password.reset.verify_token",
  "api.auth.social.exchange",
  "api.user.deactivate.post",
  "api.user.mfa.methods",
  "api.v1.auth.me",
  "api.v1.auth.mfa.totpSetup",
  "api.v1.auth.mfa.totpVerify",
  "api.v1.auth.verifyEmail",
  "api.v1.auth.verifyResetPassword",
]);

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

const registryPaths = collectRegistryPaths(API_ENDPOINTS).filter((entry) =>
  entry.candidates.some((candidate) => AUTH_SURFACE.test(normalize(candidate))),
);

const authRoutes = backendRoutes.filter((route) =>
  AUTH_SURFACE.test(route.pattern),
);

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
        return !covered.has(normalize(route.pattern));
      })
      .map((route) => route.name)
      .filter((name) => !KNOWN_UNWIRED.has(name));

    expect(
      [...new Set(uncovered)].sort(),
      "backend auth routes with no registry entry — wire them, or add to " +
        "KNOWN_UNWIRED / NOT_BROWSER_CALLABLE / SUPERSEDED_BY_V1 with a reason",
    ).toEqual([]);
  });
});
