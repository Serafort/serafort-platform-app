---
name: run-serafort-app
description: Build, run, screenshot and drive the Serafort web app (@cap/app). Use when asked to run or start the app, launch the dev server, take a screenshot of a page or the nav drawer, check a UI change in the real browser, or reproduce something visually.
---

# Run the Serafort web app

A React 19 + MUI 7 + Vite 7 SPA (`@cap/app`) inside a pnpm workspace. One
deployable app; everything under `packages/` is a workspace library it consumes.

Agents drive it with **`.claude/skills/run-serafort-app/driver.mjs`** — a
Playwright wrapper that navigates, screenshots, measures DOM geometry and
reports page errors. Start the dev server, then call the driver.

All paths below are relative to the repo root (`boilerplate/`). Verified on
Windows 11 with Git Bash and Node 24.14 / pnpm 10.

## Prerequisites

Node >= 24 and pnpm >= 10 (enforced by `package.json` `engines`). Playwright and
its Chromium build are already workspace dependencies — no extra install step
was needed.

```bash
pnpm install
```

## Run (agent path)

### 1. Start the dev server

```bash
pnpm --filter @cap/app run dev
```

Run it in the background. It serves <http://localhost:5173>. Wait for it
properly rather than sleeping:

```bash
until curl -sf -o /dev/null http://localhost:5173/; do sleep 1; done
```

### 2. Drive it

```bash
# What rendered? url, title, #root size, every <img> with its load state and box
node .claude/skills/run-serafort-app/driver.mjs probe /

# Screenshot a public route
node .claude/skills/run-serafort-app/driver.mjs shot / /tmp/out/landing.png

# Screenshot the authenticated shell (needs --shell, see below)
node .claude/skills/run-serafort-app/driver.mjs shot /dashboard /tmp/out/nav.png --shell --clip 0,0,460,240

# The nav drawer collapses on its own between the md and lg breakpoints
node .claude/skills/run-serafort-app/driver.mjs shot /dashboard /tmp/out/nav-collapsed.png --shell --width 1024 --clip 0,0,460,240

# Measure geometry - box, parent box, right-edge gap, computed visibility
node .claude/skills/run-serafort-app/driver.mjs measure /dashboard ".vertical-nav-header img" --shell
```

Options: `--shell`, `--width N`, `--height N`, `--dark`, `--clip x,y,w,h`,
`--wait <selector>`, `--base <url>`.

**In Git Bash, prefix every driver call with `MSYS_NO_PATHCONV=1`** — MSYS
rewrites a bare `/` argument into a Windows path and the driver navigates to
`http://localhost:5173C:/Program Files/Git/`:

```bash
MSYS_NO_PATHCONV=1 node .claude/skills/run-serafort-app/driver.mjs probe /
```

(The driver also normalises the mangled form defensively, but the env var is the
clean fix. PowerShell needs neither.)

**Always open the screenshot afterwards.** The driver warns
`WARNING: tiny file` under 3 KB and retries up to 3 times, but a
plausibly-sized screenshot of the wrong thing is still possible.

### 3. Stop

```bash
# Windows: find the listener and kill it
PID=$(netstat -ano | grep LISTENING | grep ':5173' | head -1 | awk '{print $NF}')
powershell -NoProfile -Command "Stop-Process -Id $PID -Force"
```

## Run (human path)

`pnpm --filter @cap/app run dev`, then open <http://localhost:5173>. Only the
public site is reachable without a backend (see Gotchas).

## Build and test

```bash
pnpm --filter @cap/app run build        # tsc -b && vite build, ~35-43s, emits PWA sw.js
pnpm --filter @cap/app run type-check   # tsc --noEmit
pnpm --filter <pkg> exec vitest run     # per package; e.g. @cap/theme, @cap/module-auth
```

`pnpm -r run lint` fails repo-wide for pre-existing reasons — several packages
have no matching ESLint config ("File ignored because no matching configuration
was supplied") and others carry existing errors. Lint the files you touched
rather than the workspace, and don't treat a red `lint` as your regression.

## Gotchas

- **There is no backend.** `VITE_API_URL` is empty in `.env`, so API calls 404 /
  401 / 400. `[Token Refresh] Failed` and `[refreshAuth] Error: 401` in the
  console are the normal resting state, not a symptom of your change.

- **The first navigation after a cold start can blow a 60s timeout.** Vite is
  still pre-bundling this workspace's dependencies even after the port answers,
  so `curl` succeeding does not mean the app is servable yet. The driver retries
  (`attempt 1 failed (page.goto: Timeout 60000ms exceeded) - retrying`) and the
  second attempt succeeds. Expect it on the first call after starting the server;
  it does not recur.

- **Authenticated routes mount and then vanish.** `/dashboard` renders the full
  shell — vertical nav, menu, navbar — but `LayoutWrapper` keeps it behind a
  `visibility: hidden` veil plus an **opaque white `MuiBackdrop` at z-index
  1400** while it "hydrates", and the auth guard swaps it for the public layout
  after roughly **2.5 seconds**. A screenshot taken naively is pure white even
  though `getComputedStyle(...).visibility` reads `visible` — the backdrop is
  what you are photographing. `--shell` handles it: it holds `/api/v1/auth/*`
  open so the guard never resolves (window stretches to ~10s), strips veil and
  backdrop with an injected **stylesheet**, and acts with no sleeps. Inline
  `style.display = 'none'` does not survive — React re-renders the backdrop and
  wipes it. Adding a `waitForTimeout` after the strip re-loses the race.

- **The nav drawer collapses by viewport, not by clicking.**
  `components/vertical/Navigation.tsx` runs `collapseVerticalNav(true)` when
  `useMediaQuery(theme.breakpoints.between('md','lg'))` matches. So
  `--width 1024` gives the collapsed 71px rail and `--width 1440` the expanded
  260px drawer — no click needed. Clicking the toggle inside the ~2.5s window is
  unreliable; the viewport is the deterministic lever.

- **`--dark` works through the settings cookie, not `prefers-color-scheme`.**
  The app ignores the media query entirely. Mode lives in the settings cookie
  (`themeConfig.settingsCookieName`, currently `serafort-settings`, a JSON value
  like `{"mode":"dark"}`), which `--dark` seeds; the store reads it at
  construction and mirrors every later change back to it. Verified: the nav
  renders `#032457` navy on an `#031433` canvas with the white lockup.
  If you need a mode other than light/dark, set the cookie yourself with
  `--base`-relative Playwright code rather than extending `--dark`.

- **Playwright must be resolved from the workspace root, and it is CommonJS.**
  It is hoisted to `<root>/node_modules/playwright`, so `import ... from
  'playwright'` fails from `app/` or from a scratch directory, and
  `import { chromium } from '<abs path>'` fails too:
  `Named export 'chromium' not found`. The driver does
  `require.resolve('playwright', { paths: [repoRoot] })` then imports the
  default. Copy that pattern for any one-off script.

- **A stale Vite optimizer cache masquerades as a source bug.** After editing a
  file while the dev server is running you may get
  `The requested module '/@fs/.../Logo.tsx' does not provide an export named
  'default'` — on a file that plainly has `export default`. It is the dep
  optimizer, not your code. Also `504 (Outdated Optimize Dep)` on first load.
  Fix: stop the server, `rm -rf app/node_modules/.vite`, restart.

- **`frame-ancestors is ignored when delivered via a <meta> element`** is
  expected. `index.html` carries a CSP fallback; the real policy ships as HTTP
  headers from `app/public/_headers`. The driver filters this one out.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `does not provide an export named 'default'` on a file that has one | Stale Vite cache: stop server, `rm -rf app/node_modules/.vite`, restart |
| `504 (Outdated Optimize Dep)` | Same; or just reload once after a cold start |
| `Cannot navigate to invalid URL ...5173C:/Program Files/Git/` | Git Bash path mangling — prefix `MSYS_NO_PATHCONV=1` |
| `Cannot find package 'playwright'` | Script is outside the workspace root; resolve with `paths: [repoRoot]` as the driver does |
| `Named export 'chromium' not found` | Playwright is CJS — import the default, then destructure |
| Screenshot is blank/white on `/dashboard` | Missing `--shell`, or a sleep crept in after the backdrop strip |
| `no element matched <selector>` on a shell route | Missing `--shell`; the shell had already unmounted |
| Driver prints `attempt N produced an empty result` | Normal flakiness of the shell race; it retries 3x. Persistent failure means the dev server is down |
