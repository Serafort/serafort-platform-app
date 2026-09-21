# Rule 08: Visual QA, Browser Driving & Regression Testing

This rule governs automated browser driving, visual regression verification, DOM geometry inspection, and shell hydration race handling in the **Serafort CAP Multi-Tenant Framework**.

---

## 1. Using the Playwright Driver

The repository includes a purpose-built Playwright driver for AI agents located at:
`node .claude/skills/run-serafort-app/driver.mjs`

### Common Agent Commands
```bash
# 1. Probe a page (extract URL, title, #root dimensions, every <img> state and bounding box)
node .claude/skills/run-serafort-app/driver.mjs probe /

# 2. Screenshot a public page
node .claude/skills/run-serafort-app/driver.mjs shot / /tmp/out/landing.png

# 3. Screenshot authenticated shell (MUST pass --shell)
node .claude/skills/run-serafort-app/driver.mjs shot /dashboard /tmp/out/nav.png --shell --clip 0,0,460,240

# 4. Measure DOM geometry (bounding box, parent box, right-edge gap, computed visibility)
node .claude/skills/run-serafort-app/driver.mjs measure /dashboard ".vertical-nav-header img" --shell
```

*(Note: In Git Bash on Windows, prefix commands with `MSYS_NO_PATHCONV=1` to avoid `/` path rewriting).*

---

## 2. The Authenticated Shell Hydration Race (`--shell`)

### The Hydration Backdrop Pattern
1. When navigating to `/dashboard`, the shell mounts behind a `visibility: hidden` veil plus an **opaque white `MuiBackdrop` at z-index 1400** while dynamic modules hydrate.
2. In mock/local environments without an active backend, the auth guard resolves and swaps to the public layout after ~2.5 seconds.
3. Taking a screenshot naively captures a blank white screen because the backdrop covers the viewport.

### How `--shell` Solves This
- Passes `--shell` to the driver:
  - Holds `/api/v1/auth/*` requests open so the auth guard doesn't fail fast (stretches window to ~10s).
  - Injects a dedicated stylesheet that strips the veil and hides the backdrop cleanly with no sleeps.
  - Captures the true authenticated navigation drawer, top bar, and content area.

---

## 3. Viewport & Breakpoint Testing

1. **Desktop Breakpoints**:
   - **Expanded Navigation Drawer (260px)**: Default viewport `--width 1440` or `--width 1280`.
   - **Collapsed Navigation Rail (71px)**: Between `md` and `lg` breakpoints, the drawer automatically collapses to a rail. Pass `--width 1024` to verify collapsed rail geometry.
   - **Mobile Breakpoint (<900px)**: The navigation collapses into a temporary slide-over drawer toggled by the hamburger button.
2. **Dark Mode Verification**:
   - The driver `--dark` flag seeds the `serafort-settings` cookie with `{"mode":"dark"}`.
   - Verify that dark theme colors match brand standards (`#032457` navy on `#031433` dark canvas) and maintain high contrast.
3. **Artifact Image Inspection**:
   - When taking screenshots, always verify the output file size is greater than 3 KB.
   - Review the generated image to verify alignment, contrast, visual hierarchy, and token consistency.
