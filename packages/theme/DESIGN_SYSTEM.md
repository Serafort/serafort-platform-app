# CAP Design System & UX Engineering Playbook

This document serves as the single source of truth for UX design principles, human psychology patterns, technical styling rules, accessibility standards, and component engineering practices across the CAP Monorepo.

---

## Table of Contents
1. [4 Key Principles Guiding UI](#1-4-key-principles-guiding-ui)
2. [Loading Psychology & Performance Engineering](#2-loading-psychology--performance-engineering)
3. [Anti-Dark Patterns & UX Ethics](#3-anti-dark-patterns--ux-ethics)
4. [Cognitive UX Laws & Engineering Architecture](#4-cognitive-ux-laws--engineering-architecture)
5. [The 4 UI States Architecture](#5-the-4-ui-states-architecture)
6. [Modern Form Design & Validation (Revolut Standards)](#6-modern-form-design--validation-revolut-standards)
7. [Secure & Actionable Error Handling](#7-secure--actionable-error-handling)
8. [Visual Tokens, Fluid Typography & Liquid Glass](#8-visual-tokens-fluid-typography--liquid-glass)
9. [MUI Styling Best Practices & Logical Properties](#9-mui-styling-best-practices--logical-properties)

---

## 1. 4 Key Principles Guiding UI

Every screen, component, and interaction pattern across the framework is anchored in four core visual principles:

1. **Visual Hierarchy**: Guiding the eye to the most important information first.
   - *Architecture*: Establish an unmistakable focal point on every screen. Use weight, opacity, and scale levers (`--font-display` to `--font-body`) rather than raw size alone.
2. **Contrast**: Making elements legible and distinct from one another.
   - *Architecture*: Enforce strict 4.5:1 text contrast and 3:1 graphical boundary contrast. High-contrast primary CTA buttons isolate core actions from secondary options.
3. **Alignment**: Creating visual order to reduce the user's mental effort.
   - *Architecture*: Strict alignment to the 8px/4px spatial grid, cohesive baseline typography alignment, and symmetric RTL/LTR mirroring.
4. **Proximity**: Grouping related elements to indicate that they share a function.
   - *Architecture*: Form labels sit 4-8px from their inputs; distinct cards are spaced by 24-32px. Use Bento card boundaries to declare logical cohesion.

---

## 2. Loading Psychology & Performance Engineering

Users do not perceive time objectively; their perception of speed depends on visual feedback, spatial predictability, and interaction responsiveness.

### Skeletons vs. Spinners vs. Optimistic UI

| Pattern | Best Use Case | Psychology / Perception |
| :--- | :--- | :--- |
| **Content Skeletons (`.state-loading-shimmer`)** | Feeds, data tables, dashboards, profile cards. | Reduces perceived load time by visually pre-constructing the layout and guiding user gaze. |
| **Inline Spinners** | Buttons during submission, isolated dropdown searches (< 2s). | Confirms an active action without distracting the user with heavy layout reconstruction. |
| **Optimistic UI** | Low-risk interactions (toggles, bookmarks, likes, item ordering). | Gives the illusion of zero-latency by updating UI immediately, syncing in background with rollback on failure. |

### The "Six Loading Mistakes" & Engineering Remedies

1. **Missing Action Locks (Double-Click Bug)**:
   - *Problem*: Users rapidly click buttons, causing duplicate API requests, duplicated orders, or race conditions.
   - *Remedy*: Apply 100ms debounce/locks (`.action-lock-transition`, `actionLock: 100ms`). Disable pointer events immediately upon submission while transitioning to the loading state.
2. **Layout Shifts (CLS Violations)**:
   - *Problem*: Late-loading assets or data push UI elements down, causing accidental clicks or jarring flickers.
   - *Remedy*: Always specify min-heights or skeleton dimensions matching the target content (`minHeight`, reserved aspect ratio).
3. **Unbounded Slow Requests (Hanging UI)**:
   - *Problem*: Slow networks leave components in infinite spinners without resolution.
   - *Remedy*: Enforce hard timeouts (e.g., 10s-15s) with a clear fallback retry state and user-friendly error message.
4. **Missing Progress Mechanics on Multi-Step Tasks**:
   - *Problem*: Long background processes (file uploads, exports) shown as indeterminate spinners cause abandonment.
   - *Remedy*: Chunk tasks into discrete steps and provide percentage progress or step indicators (`Step 2 of 4: Processing data chunks`).
5. **Full-Page Blocking**:
   - *Problem*: Freezing the entire window for a secondary widget's data fetch.
   - *Remedy*: Isolate component data fetching; keep navigation and unrelated cards interactive.
6. **Scrollbar Pop-in Layout Jitter**:
   - *Problem*: When dynamic content exceeds viewport height, scrollbars appear and cause a 15px layout shift.
   - *Remedy*: Enforced globally in `@cap/theme` with `scrollbar-gutter: stable;` on `html` and `body`.

### The Labor Illusion
For complex automated tasks (e.g., pricing analysis, tenant report aggregation, AI model evaluation), immediate instant results can paradoxically lower perceived value. Intentionally displaying brief, animated progress steps ("Scanning database...", "Calculating optimal rates...", "Finalizing configuration...") builds trust and reinforces perceived algorithmic effort.

---

## 2. Anti-Dark Patterns & UX Ethics

The CAP framework strictly rejects manipulative dark patterns in favor of transparent, respectful user experiences.

### Confirmshaming Prevention
Never manipulate users into taking an action through guilt-inducing, passive-aggressive opt-out copy.
- ❌ **Dark Pattern**: *"No thanks, I hate saving money"* or *"No, I prefer being unorganized"*
- ✅ **Ethical Pattern**: *"Keep current plan"* vs. *"Upgrade to Pro"*

### Confirmation Modals & Action Clarity
- **Verb / Noun Pairs**: Confirmation dialog titles and action buttons must explicitly declare the action and target.
  - ❌ Vague: *"Are you sure?"* -> `[ Yes ]` / `[ No ]`
  - ✅ Explicit: *"Delete Tenant Workspace?"* -> `[ Delete Workspace ]` (Destructive) / `[ Cancel ]` (Neutral)
- **Hierarchy & Visual Weight**:
  - Primary destructive actions use `color="error"` with clear contrast.
  - Neutral / dismissal actions use `variant="outlined"` or `variant="text"`.
  - Avoid placing destructive buttons as default auto-focused elements.

### Ethical Subscription & Account Workflows
- **Cancellation Transparency**: Users must be able to cancel or downgrade with the same number of steps required to subscribe.
- **Feedback Without Coercion**: Optional feedback surveys are acceptable, but retention flows must not trap users in endless confirmation loops or hidden exit paths.

---

## 3. Cognitive UX Laws & Engineering Architecture

The CAP Framework adheres strictly to cognitive psychology heuristics and user experience laws. For the comprehensive directory, see [`laws_of_ux.md`](./laws_of_ux.md).

### Core Cognitive Laws in UI Architecture

| UX Law / Heuristic | Psychological Premise | Monorepo Engineering Implementation |
| :--- | :--- | :--- |
| **Aesthetic-Usability Effect** | Users perceive aesthetically pleasing design as more usable. | Refined `@cap/theme` presets, liquid glass cards, and fluid typography (`clamp()`). |
| **Hick’s Law** | Decision time increases with option count and complexity. | Progressive disclosure in tenant configuration; multi-step forms (> 6 fields); sensible defaults. |
| **Jakob’s Law** | Users expect your app to work like other apps they know. | Standard top/left navigation, standard keyboard shortcuts (`Cmd/Ctrl+K`), top-right user controls. |
| **Fitts’s Law** | Acquisition time depends on target distance and size. | Minimum 44px-48px touch targets (`minHeight: 48px` on inputs, `var(--touch-target-min)`). |
| **Doherty Threshold** | Productivity soars when interaction responds in <400ms. | Micro-animations capped at 150-300ms; button action locks (`100ms`); instant skeleton feedback. |
| **Miller’s Law & Chunking** | Working memory holds 7 ± 2 items. | Navigation menus and toolbars capped at 5-7 items per group; Bento grid modular cards. |
| **Tesler’s Law (Complexity)** | Every system has irreducible complexity. | Complex multi-tenant token compilation and routing wrapped in framework abstractions (`@cap/platform-core`). |
| **Postel’s Law** | Be liberal in what you accept, conservative in what you send. | Resilient form inputs with format masks; normalized frontend data payloads sent to typed APIs. |
| **Von Restorff Effect** | Distinct items among similar ones are best remembered. | High-contrast contained primary CTA buttons, featured pricing badges, critical error banners. |
| **Zeigarnik & Goal-Gradient** | Incomplete tasks are remembered; motivation rises near goal. | Multi-step onboarding progress bars, profile completeness meters, draft auto-save badges. |
| **Peak-End Rule** | Experiences are judged by their peak and their conclusion. | Rewarding success states (`.state-success-glow`), delightful confirmation screens, clean logout flow. |
| **Law of Proximity & Region** | Proximate items and bounded regions form perceived groups. | Bento grid boundaries, explicit card elevation (`background.paper`), 4-8px input-label spacing vs 24px section gaps. |
| **Law of Similarity & Connectedness** | Visually similar or connected elements are seen as related. | Uniform component overrides (`getComponentOverrides`), pipeline step connectors, linked tab indicators. |
| **Paradox of the Active User** | Users start using software immediately without reading docs. | 4 UI States with self-explanatory empty states (`.state-empty-container`) featuring instant CTAs. |
| **Occam’s Razor & Flow** | Simplest solution is best; immersion requires zero friction. | Single-click workflows, elimination of redundant confirmation steps, zero CLS (`scrollbar-gutter: stable;`). |

### RTL & Spatial Layout Discipline
- **Mirrored Layouts**: Arabic (`ar`) and RTL locales mirror navigation, icon positions, and progress flows.
- **Logical Properties**: Always prefer CSS logical properties (`marginInlineStart`, `paddingInlineEnd`, `inlineSize`, `blockSize`) or `@cap/theme`'s RTL styling pipeline.

---

## 4. The 4 UI States Architecture

Every widget, data view, and interactive component MUST define and render all 4 UI states:

```
┌────────────────────────────────────────────────────────┐
│                   Component State Box                  │
├──────────────┬──────────────┬──────────────┬───────────┤
│ 1. IDLE /    │ 2. LOADING   │ 3. SUCCESS   │ 4. ERROR  │
│    EMPTY     │              │              │           │
│ Guide & CTA  │ Shimmer      │ Clear        │ Actionable│
│ container    │ Skeleton     │ confirmation │ remedy &  │
│              │ & Lock       │ & feedback   │ isolation │
└──────────────┴──────────────┴──────────────┴───────────┘
```

1. **Empty State (`.state-empty-container`)**:
   - Used when zero records exist (zero inbox, new tenant, no search results).
   - Must feature a clear visual icon, friendly non-technical explanation, and an actionable CTA button (`Create First Item`).
2. **Loading State (`.state-loading-shimmer`)**:
   - Used during asynchronous data retrieval.
   - Preserves component geometry to avoid layout shifts.
3. **Success State (`.state-success-glow`)**:
   - Provides clear feedback following a user mutation (saving settings, inviting team member).
   - Dismisses automatically for non-blocking actions or provides explicit next steps.
4. **Error State (`.state-error-inline`)**:
   - Clear explanation of what went wrong, avoiding technical jargon, paired with a distinct retry/remedy button.

---

## 5. Modern Form Design & Validation (Revolut Standards)

Modern financial and SaaS interfaces demand crisp visual structure, large interactive areas, and instantaneous feedback.

### Form Visual Tokens
- **Rounded Corners**: 12px (`var(--radius-lg)`) for input containers.
- **Large Touch Targets**: Minimum 44px height for mobile ergonomics (`minHeight: 48px` default on inputs, 44px on primary buttons).
- **Floating Labels**: Smooth scale transform (`0.75`) with subtle background clearance when focused.
- **Focus Rings**: Accessible 3px brand glow (`0 0 0 3px rgba(99, 102, 241, 0.15)`) without harsh pixel jumps.

### Validation Mechanics
- **Live Inline Validation**: Validate on `blur` or after a typing debounce, not on initial keystroke (to avoid premature error shouting).
- **Dynamic Character Counters**: When fields have character limits, display remaining counters near the helper text.
- **Phone & Formatting Masks**: Automatically format numbers and codes without forcing users to type brackets or dashes manually.

---

## 6. Secure & Actionable Error Handling

### Security Best Practice: Stack Trace Masking
- ⚠️ **Zero Raw Backend Errors**: NEVER render raw database exceptions, SQL queries, or internal file system paths to the end user.
- **Frontend Masking**: Log technical details to monitoring services (`console.error` in dev/staging), while displaying clear, human-friendly remediation text to the user.

### Error Placement Matrix

```
Severity / Scope            Recommended Presentation
─────────────────────────────────────────────────────────────
Field-level validation   →  Inline helper text below input
Transient background op  →  Toast / Snackbar notification
Component failure        →  Isolated Card Error Boundary with Retry
Critical / Blocking auth →  Modal dialog with forced resolution
```

### Component Isolation (Graceful Degradation)
Wrap independent dashboard widgets in React Error Boundaries. If a third-party metrics widget fails, the rest of the application (navigation, billing, user management) must remain fully functional.

---

## 7. Visual Tokens, Fluid Typography & Liquid Glass

### Fluid `clamp()` Typography Scale
The typography system uses mathematical `clamp()` functions to seamlessly scale text between mobile viewports and ultra-wide displays without abrupt media query jumps:

```css
--font-display: clamp(2.25rem, 1.75rem + 3vw, 3.75rem);
--font-h1: clamp(2.00rem, 1.50rem + 2.5vw, 3.25rem);
--font-h2: clamp(1.75rem, 1.35rem + 2.0vw, 2.75rem);
--font-h3: clamp(1.50rem, 1.25rem + 1.5vw, 2.25rem);
--font-h4: clamp(1.25rem, 1.10rem + 1.0vw, 1.75rem);
--font-h5: clamp(1.125rem, 1.05rem + 0.5vw, 1.375rem);
--font-h6: clamp(1.00rem, 0.95rem + 0.3vw, 1.15rem);
--font-body: clamp(0.875rem, 0.825rem + 0.2vw, 1.00rem);
```

### Figma Liquid Glass Architecture
Liquid glass elevates standard glassmorphism with multi-layer specular highlights, refractive borders, and inner depth shadows:

```tsx
import { LiquidGlassCard } from '@cap/theme';

<LiquidGlassCard blur="24px" opacity={0.82}>
  <Typography variant="h5">Liquid Surface</Typography>
  <Typography variant="body1">Multi-layer specular highlights with inner shadows.</Typography>
</LiquidGlassCard>
```

Or via CSS utility class:
```html
<div class="liquid-glass-effect">...</div>
```

---

## 8. MUI Styling Best Practices & Logical Properties

### Token Consumption
Always consume tokens from the MUI `Theme` object or design token CSS variables:

```tsx
<Box
  sx={{
    backgroundColor: 'background.paper',
    color: 'text.primary',
    borderRadius: (theme) => theme.shape.borderRadius,
    padding: (theme) => theme.spacing(3),
    minInlineSize: 'var(--touch-target-min)',
  }}
>
```

### RTL-Aware Logical CSS Properties
- Use `inlineSize` instead of `width`
- Use `blockSize` instead of `height`
- Use `marginInlineStart` / `marginInlineEnd` instead of `marginLeft` / `marginRight`
- Use `paddingInlineStart` / `paddingInlineEnd` instead of `paddingLeft` / `paddingRight`
