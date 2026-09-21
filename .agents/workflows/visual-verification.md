---
name: visual-verification
description: Ground visual QA, layout geometry, responsive breakpoints, and screenshots using the Playwright driver.
---

# Workflow: Visual Verification & Browser Driving

This workflow governs how agents visually inspect, probe, and screenshot the Serafort web application (`@cap/app`) using Playwright.

---

## 1. Prerequisites

1. **Vite Dev Server**:
   Ensure the dev server is active on `http://localhost:5173`:
   ```bash
   pnpm --filter @cap/app run dev
   ```
   Wait for response:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/
   ```

---

## 2. Playwright Driver Commands

The driver is located at:
`node .claude/skills/run-serafort-app/driver.mjs`

### 1. Probe Page State (DOM, Images, Title)
```bash
node .claude/skills/run-serafort-app/driver.mjs probe /
```
Outputs: current URL, page title, `#root` dimensions, and all `<img>` elements with load states and bounding boxes.

### 2. Screenshot Public Routes
```bash
node .claude/skills/run-serafort-app/driver.mjs shot / .agents/blackboard/shots/landing.png
```

### 3. Screenshot Authenticated Shell (`--shell` Flag Mandate)
> [!IMPORTANT]
> `/dashboard` mounts behind an opaque white `MuiBackdrop` at z-index 1400 for ~2.5 seconds during hydration. ALWAYS pass `--shell` for authenticated views.
```bash
node .claude/skills/run-serafort-app/driver.mjs shot /dashboard .agents/blackboard/shots/dashboard.png --shell
```

### 4. Breakpoint & Responsive Verification
- **Desktop Expanded Nav (260px)**: Default or `--width 1440`
- **Collapsed Nav Rail (71px)**: Auto-collapses between `md` and `lg`. Pass `--width 1024`:
  ```bash
  node .claude/skills/run-serafort-app/driver.mjs shot /dashboard .agents/blackboard/shots/dashboard-rail.png --shell --width 1024
  ```
- **Mobile Viewport (<900px)**: Pass `--width 375 --height 812`:
  ```bash
  node .claude/skills/run-serafort-app/driver.mjs shot /dashboard .agents/blackboard/shots/dashboard-mobile.png --shell --width 375 --height 812
  ```

### 5. Dark Mode Verification
The app reads dark mode from the `serafort-settings` cookie. Pass `--dark`:
```bash
node .claude/skills/run-serafort-app/driver.mjs shot /dashboard .agents/blackboard/shots/dashboard-dark.png --shell --dark
```
Verify high-contrast `#032457` navy on `#031433` dark canvas.

### 6. Measure DOM Geometry
```bash
node .claude/skills/run-serafort-app/driver.mjs measure /dashboard ".vertical-nav-header img" --shell
```
Outputs bounding box, parent element box, right-edge margin, and computed visibility.

---

## 3. Screenshot Artifact Verification Checklist

- [ ] Output file exists and is > 3 KB (tiny files indicate blank/white failure).
- [ ] No white backdrop overlay blocking the view.
- [ ] Visual Hierarchy: Primary actions stand out, secondary actions are subdued.
- [ ] Contrast: Text meets WCAG 2.2 AA (4.5:1 ratio).
- [ ] Bidirectional: When testing RTL (`dir="rtl"`), chevrons and drawer alignment flip correctly.
