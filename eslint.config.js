import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

// Workspace architectural layers.
// Note: several @cap/module-* and @cap/civil-registry packages listed below are provisioned
// ahead of package creation to reserve their architectural layer boundaries.
// Workspace architectural layers, ordered by the real dependency DAG.
//
// The authoritative gate is `pnpm lint:boundaries`
// (scripts/check-tier-boundaries.mjs): only some packages carry an ESLint
// config and `pnpm -r run lint` fails repo-wide for unrelated reasons, so an
// ESLint-only boundary check silently skips most of the tree. Keep the two in
// sync - the script's TIERS map is the source of truth.
//
// Note: several @cap/module-* and @cap/civil-registry packages listed below are
// provisioned ahead of package creation to reserve their architectural layer.
const Layers = {
  FOUNDATION: ["@cap/shared-types"],
  LAYER_1: ["@cap/api-contracts"],
  LAYER_2: ["@cap/platform-store"],
  LAYER_3: ["@cap/theme"],
  LAYER_4: ["@cap/auth-contracts", "@cap/authorization"],
  LAYER_5: ["@cap/platform-core"],
  LAYER_6: ["@cap/layout", "@cap/civil-registry"],
  LAYER_7: [
    "@cap/module-admin",
    "@cap/module-auth",
    "@cap/module-dashboard",
    "@cap/module-landing",
    "@cap/module-theme",
    "@cap/module-widget-studio",
    "@cap/module-kyc",
    "@cap/module-digital-id",
    "@cap/module-blockchain-idaas",
    "@cap/module-monitoring-alerts",
    "@cap/module-user",
  ],
  LAYER_8: ["@cap/app"],
  ID_AAS: [
    "@idaas/authentication-core",
    "@idaas/authorization-engine",
    "@idaas/identity-broker",
    "@idaas/mfa-orchestrator",
    "@idaas/passwordless-service",
    "@idaas/platform-cluster",
    "@idaas/session-manager",
    "@idaas/user-directory",
  ],
};

/** Ordered low -> high, so a layer may import only from earlier entries. */
const ORDERED = [
  Layers.FOUNDATION,
  Layers.LAYER_1,
  Layers.LAYER_2,
  Layers.LAYER_3,
  Layers.LAYER_4,
  Layers.LAYER_5,
  Layers.LAYER_6,
  Layers.LAYER_7,
  Layers.LAYER_8,
];

/** Everything strictly above `index` - i.e. what this layer must not import. */
const above = (index) => ORDERED.slice(index + 1).flat();

/**
 * Boundary rule for one layer: forbid importing anything above it.
 * `index` is the layer's position in ORDERED.
 */
function boundaryRuleFor(index, label) {
  const forbidden = above(index);
  if (forbidden.length === 0) return {};
  return {
    "import/no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: forbidden,
            message: `${label} may only import packages in a lower tier. See scripts/check-tier-boundaries.mjs.`,
          },
        ],
      },
    ],
  };
}

export const baseConfig = tseslint.config({
  plugins: {
    import: importPlugin,
  },
  rules: {
    "import/no-unresolved": "error",
    "import/order": [
      "warn",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling"],
          "index",
          "object",
          "type",
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
  },
});

/**
 * Per-layer boundary configs, keyed by package source glob so they actually
 * apply. Previously these were declared but never attached to any `files`
 * pattern, which is why upward imports went undetected for so long.
 */
const LAYER_GLOBS = [
  { index: 0, label: "@cap/shared-types (tier 0)", files: ["packages/shared-types/src/**/*.{ts,tsx}"] },
  { index: 1, label: "@cap/api-contracts (tier 1)", files: ["packages/api-contracts/src/**/*.{ts,tsx}"] },
  { index: 2, label: "@cap/platform-store (tier 1)", files: ["packages/platform-store/src/**/*.{ts,tsx}"] },
  { index: 3, label: "@cap/theme (tier 1)", files: ["packages/theme/src/**/*.{ts,tsx}"] },
  { index: 4, label: "Platform services (tier 2)", files: ["packages/auth-contracts/src/**/*.{ts,tsx}", "packages/authorization/src/**/*.{ts,tsx}"] },
  { index: 5, label: "@cap/platform-core (tier 3)", files: ["packages/platform-core/src/**/*.{ts,tsx}"] },
  { index: 6, label: "@cap/layout (tier 4)", files: ["packages/layout/src/**/*.{ts,tsx}"] },
  { index: 7, label: "Feature modules (tier 5)", files: ["packages/modules/*/src/**/*.{ts,tsx}"] },
];

export const boundaryConfigs = LAYER_GLOBS.map(({ index, label, files }) => ({
  name: `cap/boundary/${label}`,
  files,
  plugins: { import: importPlugin },
  rules: boundaryRuleFor(index, label),
})).filter((c) => Object.keys(c.rules).length > 0);

/** Back-compat alias for consumers that imported the old shape. */
export const layerConfigs = boundaryConfigs;

export default [...baseConfig, ...boundaryConfigs];
