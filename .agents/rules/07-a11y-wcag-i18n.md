# Rule 07: Accessibility (WCAG 2.2 AA), i18n & Bidirectional (LTR & RTL) Parity

This rule governs universal accessibility, multi-tenant multilingual localization, and full bidirectional layout parity (both Left-to-Right and Right-to-Left) across the **Serafort CAP Multi-Tenant Framework**.

---

## 1. Bidirectional Layout Parity: LTR & RTL

Every layout, component, drawer, card, and navigation bar in the framework MUST support **flawless bidirectional rendering in both LTR (Left-to-Right) and RTL (Right-to-Left)** modes.

### 1. The Two Complementary RTL/LTR Strategies
1. **`stylis-plugin-rtl` (MUI Theme Engine)**:
   - Wired into the emotion cache at `@cap/theme` and `@cap/app`.
   - Automatically flips physical MUI `sx` properties (`pl` ↔ `pr`, `ml` ↔ `mr`, `left` ↔ `right`) when the document or theme direction is set to `dir="rtl"`.
   - Developers can safely use standard MUI shorthand properties (`px`, `mx`, `pl`, `pr`) without manually checking the current language direction.
2. **CSS Logical Properties**:
   - For custom CSS, styled components, or complex layouts, prefer CSS logical properties:
     - Use `marginInlineStart` / `marginInlineEnd` instead of `marginLeft` / `marginRight`.
     - Use `paddingInlineStart` / `paddingInlineEnd` instead of `paddingLeft` / `paddingRight`.
     - Use `inlineSize` / `blockSize` instead of `width` / `height`.
     - Use `borderInlineStart` instead of `borderLeft`.

### 2. Bidirectional Iconography & Visual Flow
- Directional navigation icons (e.g. forward/back arrows, breadcrumb chevrons, collapse/expand carats) MUST flip 180 degrees in RTL:
  ```tsx
  <ChevronRightIcon sx={{ transform: theme.direction === 'rtl' ? 'rotate(180deg)' : 'none' }} />
  ```
- Non-directional icons (e.g. search magnifying glass, lock, user profile, checkmark) must NOT be flipped.
- Navigation drawers must anchor to the right edge in RTL and to the left edge in LTR.

---

## 2. Multi-Tenant Internationalization (i18n) Discipline

1. **Zero Hardcoded User-Facing Strings**:
   - Every string presented to the user must be routed through `t('key', 'Default fallback')`.
   - Never hardcode English, French, or Arabic text directly in JSX elements.
   - Shared components in `@cap/layout` must never include hardcoded language strings.
2. **Modular Dictionary Bundles**:
   - Each module declares its localized strings inside `i18n` dictionaries:
     - `en`: English (LTR)
     - `fr`: French (LTR)
     - `ar`: Arabic (RTL)
   - These are assembled dynamically at runtime into `i18next` by `assembleApp`.
3. **Pluralization & Formatting**:
   - Use `i18next` count interpolation for plural forms (`t('items.count', { count })`).
   - Use `Intl.NumberFormat` and `Intl.DateTimeFormat` for currency, numbers, and dates to respect tenant locales.

---

## 3. WCAG 2.2 AA Accessibility Mandates

1. **Semantic HTML & Landmark Structure**:
   - Every page must contain exactly one `<h1>` heading.
   - Structural landmarks must be explicit: `<main id="main-content">`, `<nav aria-label="...">`, `<header>`, `<footer>`.
   - The `<SkipToContent />` component at the app root must be present to allow keyboard users to bypass navigation.
2. **Keyboard Navigation & Focus Management**:
   - All interactive controls (buttons, links, inputs, dropdowns) must be reachable via `Tab` and operable via `Enter` / `Space`.
   - Focus rings must be prominently visible:
     ```css
     :focus-visible {
       outline: 2px solid var(--color-primary);
       outline-offset: 2px;
     }
     ```
   - Modals and drawers must trap focus inside while open and return focus to the triggering element upon closing.
3. **Screen Reader Support (ARIA)**:
   - Provide `aria-label` or `aria-labelledby` for icon-only buttons (e.g. search trigger, theme switcher, close buttons).
   - Form fields must have properly associated `<label>` or `aria-label` tags.
   - Error messages must be linked via `aria-describedby` and status announcements must use `role="alert"` or `aria-live="polite"`.
4. **Color Contrast**:
   - Text must achieve a minimum contrast ratio of **4.5:1** against its background (3:1 for large headers).
   - UI boundary borders must achieve at least **3:1** contrast against adjacent backgrounds.
