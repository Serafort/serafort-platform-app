import boundaries from "eslint-plugin-boundaries";
import tseslint from "typescript-eslint";
import { TIERS, PACKAGE_DIRS } from "./scripts/check-tier-boundaries.mjs";

// This file's one job is the cross-package tier-boundary gate - it is not a
// general-purpose lint config. Each package that lints on its own already has
// its own self-contained `eslint.config.js` for that (react-hooks, prettier,
// etc.); this file is invoked separately and explicitly via
// `pnpm lint:boundaries:eslint`, using `--config` so it applies to every
// package's sources regardless of what that package's own config says.
//
// Why this exists ALONGSIDE scripts/check-tier-boundaries.mjs rather than
// instead of it: that script only regex-matches bare `@cap/x` import
// specifiers, so it cannot see a relative-path escape across a package
// boundary (e.g. a file in packages/layout/src importing
// `../../../platform-core/src/foo` instead of `from '@cap/platform-core'`).
// eslint-plugin-boundaries resolves every import to its real file first, so
// it catches that class of violation too. TIERS/PACKAGE_DIRS are imported
// (not copied) from that script so the two gates can never disagree about
// what the tiers are - update the tier table in exactly one place.

const elements = Object.entries(PACKAGE_DIRS).map(([type, dir]) => ({
  type,
  pattern: `${dir}/**`,
}));

// One disallow policy per package: forbid importing any strictly-higher-tier
// package. Same-tier and lower-tier @cap imports, and anything that isn't a
// recognised @cap element at all (external packages, node builtins), fall
// through to the rule's `default: "allow"` and are left alone - this rule's
// only job is catching upward crossings.
const policies = Object.entries(TIERS)
  .map(([pkg, ordinal]) => {
    const forbidden = Object.entries(TIERS)
      .filter(([, otherOrdinal]) => otherOrdinal > ordinal)
      .map(([name]) => name);
    if (forbidden.length === 0) return null;
    return {
      from: { element: { type: pkg } },
      disallow: { to: { element: { types: { anyOf: forbidden } } } },
      message: `${pkg} may only import packages in a lower tier (see the tier table in CLAUDE.md and scripts/check-tier-boundaries.mjs).`,
    };
  })
  .filter(Boolean);

export default tseslint.config({
  name: "cap/tier-boundaries",
  files: ["packages/**/src/**/*.{ts,tsx}", "app/src/**/*.{ts,tsx}"],
  plugins: { boundaries },
  // This config registers only the boundaries plugin, but source files carry
  // `eslint-disable` comments for rules other configs register (react-hooks,
  // @typescript-eslint/*, ...). Without this, ESLint errors on every such
  // comment ("Definition for rule 'x' was not found") - noise unrelated to
  // tier boundaries that would drown out a real violation. Inline disables
  // for THIS rule still can't be added by accident, since nothing in this
  // repo's source has ever referenced `boundaries/dependencies`.
  linterOptions: {
    noInlineConfig: true,
  },
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
  settings: {
    // Absolute, so element patterns resolve the same way regardless of which
    // directory this is invoked from.
    "boundaries/root-path": import.meta.dirname,
    "boundaries/elements": elements,
    // `boundaries/dependencies` resolves each import via eslint-module-utils,
    // the same shared resolver eslint-plugin-import uses - pointing it at the
    // path-mapped tsconfig (already proven correct: it's what gives madge
    // cross-package resolution) is what lets `@cap/platform-core` resolve to
    // its `src/`, matching the element pattern above, instead of resolving to
    // built `dist/` output the way plain Node resolution would.
    "import/resolver": {
      typescript: { project: "./tsconfig.madge.json" },
    },
  },
  rules: {
    "boundaries/dependencies": ["error", { default: "allow", policies }],
  },
});
