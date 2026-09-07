# Release pipeline — packaging `@cap/app` for production

`@cap/app` ships as a **static site**. There is no server bundle and no
container: production is a directory of hashed assets published to an edge host
that honours `app/public/_headers` (Netlify, Cloudflare Pages, or an equivalent
where the same headers are configured by hand).

The release pipeline turns a commit into exactly one such directory, proves it
was built against the real production environment, and wraps it in a
checksummed archive that can be published, verified, and rolled back.

| | |
| --- | --- |
| Workflow | [`.github/workflows/release.yml`](../.github/workflows/release.yml) |
| Packager | [`scripts/package-release.mjs`](../scripts/package-release.mjs) |
| Local entry point | `pnpm run release:build` |
| Output | `release/serafort-app-<version>-<sha>.tar.gz` (+ `.SHA256SUMS`, `.manifest.json`) |

## How it relates to CI

`ci.yml` answers *"is this commit mergeable?"* — type-check, lint, build, unit,
circular deps, audit, CodeQL, gitleaks, on every PR.

`release.yml` answers *"is this artifact shippable?"*. It re-runs the blocking
gates (a tag can point at any commit, including one that never went through a
PR), then does the three things CI does not: build with production secrets and
variables, verify the produced bundle, and package it.

The pipeline stops at *prepared for production*. It never publishes to a host —
deployment stays a human step until the target platform and its credentials are
provisioned (`analysis/production-readiness-runbook.md`).

## Triggers

| Trigger | Environment | Strict | Result |
| --- | --- | --- | --- |
| `git push origin v1.4.0` (tag `v*`) | `production` | always | Package attached to a GitHub Release, `v1.4.0` |
| Actions → Release → *Run workflow* | your choice | your choice | Package kept as a 90-day workflow artifact |
| `workflow_call` from another workflow | caller's choice | on tags | Package + `package-name` / `sha256` outputs |

A version with a pre-release suffix (`v1.4.0-rc.1`) is published as a GitHub
pre-release, so it never becomes "Latest".

## Required configuration

Set these under **Settings → Secrets and variables → Actions**, either
repository-wide or on the `production` / `staging` environment (environment
values win, which is how staging gets a different API origin).

**Variables**

| Name | Required | Default |
| --- | --- | --- |
| `VITE_API_URL` | yes — must be `https://` | — |
| `VITE_API_PREFIX` | no | `/api` |
| `VITE_API_VERSION` | no | `v1` |
| `VITE_API_TIMEOUT` | no | `15000` |
| `VITE_APP_NAME` | no | `Serafort` |
| `VITE_APP_DESCRIPTION` | no | `TrustKey Platform` |
| `VITE_TENANT_ID` | no | `default` |
| `VITE_SENTRY_ENVIRONMENT` | no | the job's environment name |
| `VITE_SENTRY_TRACES_SAMPLE_RATE` | no | `0.1` |

**Secrets**

| Name | Required | Notes |
| --- | --- | --- |
| `VITE_SENTRY_DSN` | yes for production | Empty ships a build with no error monitoring; the run logs a warning |
| `VITE_STORAGE_ENCRYPTION_KEY` | yes | 32-byte hex: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

`VITE_APP_VERSION` is not configured — the pipeline sets it from the release
version so the running app reports the version it was packaged as.

> Every `VITE_*` value is inlined verbatim into the public browser bundle.
> Storing two of them as Actions secrets keeps them out of the repository; it
> does **not** make them secret from a user. Never add an API key, a database
> credential, or a signing key to this list. See `.env.production.example`.

## What the pipeline verifies

Beyond the re-run CI gates, the packager rejects a bundle that would fail
*after* deployment — the failure mode a green build cannot catch:

- **Missing `index.html`** — not a usable site.
- **Missing `_headers`** — CSP, HSTS and `frame-ancestors` would silently
  disappear in production, since those cannot be expressed as meta tags.
- **The configured API origin is absent from the bundle.** Vite inlines
  `VITE_API_URL` as a string literal, so a correctly configured build provably
  contains it. This is the check that catches a build made without
  `.env.production`.
- **Placeholder API origin** — `api.example.com` inlined in the bundle means
  `VITE_API_URL` never reached the build.
- **PEM private-key block** in a shipped asset.

Under `--strict` (always on for tags), source maps in the bundle and packaging
from a dirty working tree are failures rather than warnings.

`localhost` references are reported but never fail the package: react-router
carries an internal `http://localhost` base sentinel, Sentry's spotlight
integration defaults to a localhost sidecar, and the identity-broker form ships
a localhost redirect-URI *placeholder string*. Gating on them would reject every
legitimate release — the positive API-origin assertion above is the real check.

## What the package contains

```
serafort-app-1.4.0-a1b2c3d/
├── dist/                       static site root — publish this as-is
├── build-manifest.json         version, commit, per-file sha256 + gzip sizes
├── dependency-inventory.json   production dependencies and their licences
└── DEPLOY.txt                  host requirements and rollback, for whoever deploys it
```

Alongside the tarball the workflow keeps `<package>.SHA256SUMS` (verify with
`sha256sum -c`) and a copy of `<package>.manifest.json`, so a reviewer can read
the file list and bundle sizes without unpacking the archive.

The per-file gzip sizes in the manifest make bundle budgets trackable
release-over-release from the artifacts alone — no rebuild needed to answer
"when did the main chunk grow?".

## Running it locally

The same script runs in CI and on a laptop, so a local package is comparable
with a pipeline one:

```bash
# Build + package in one step (uses your local .env.production, if any)
pnpm run release:build

# Or package an existing build
pnpm --filter @cap/app run build
pnpm run release:package -- --version 1.4.0 --strict
```

Useful flags: `--dist <dir>`, `--out <dir>`, `--no-inventory`, `--strict`.
Without `--version` or `RELEASE_VERSION`, the version is taken from an exact git
tag, else `0.0.0-dev+<sha>`.

## Deploying a package

1. Download the tarball from the GitHub Release (or the workflow artifact).
2. `sha256sum -c serafort-app-<version>-<sha>.SHA256SUMS`
3. Unpack and publish `dist/` to the static host.
4. Confirm the host sends the `_headers` set. Netlify and Cloudflare Pages read
   the file directly; anywhere else, replicate it in the platform config.
5. Serve `index.html` as the SPA fallback for unknown paths — never for
   `/api/*`. Cache `/assets/*` immutably; serve `index.html`, `sw.js` and
   `manifest.webmanifest` with `no-cache`.

**Rollback** is re-publishing the previous tarball: each package is a complete,
self-contained site with no build step and no shared state.

## Extending it

- **Automatic deploy**: add a `deploy` job gated on a GitHub `environment` with
  required reviewers, consuming this workflow via `workflow_call` and its
  `package-name` output. Keep packaging and publishing as separate jobs so the
  approval sits between them.
- **Full SBOM**: `dependency-inventory.json` is pnpm's own licence output, which
  needs no extra tooling. If a customer requires CycloneDX or SPDX, add the
  generator as a step in the `package` job and ship both files in the archive.
