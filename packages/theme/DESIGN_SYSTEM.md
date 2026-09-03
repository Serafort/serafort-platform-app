# CAP Design System & Component Guidelines

This document provides design system guidelines, styling practices, typography standards, and accessibility rules for components in the CAP Monorepo.

---

## 1. MUI Styling Best Practices

### Prefer `styled()` & `sx` with Tokens
Do NOT hardcode raw hex colors or static pixel values in component files. Always consume tokens from the MUI `Theme` object.

**Correct**:
```tsx
<Box
  sx={{
    backgroundColor: 'background.paper',
    color: 'text.primary',
    borderRadius: (theme) => theme.shape.borderRadius,
    padding: (theme) => theme.spacing(3),
  }}
>
```

**Incorrect**:
```tsx
<div style={{ backgroundColor: '#ffffff', color: '#000', padding: '24px' }}>
```

### RTL-Aware Logical CSS Properties
To support Right-To-Left languages (Arabic `ar`), always use logical CSS properties:
- Use `inlineSize` instead of `width`
- Use `blockSize` instead of `height`
- Use `marginInlineStart` / `marginInlineEnd` instead of `marginLeft` / `marginRight`
- Use `paddingInlineStart` / `paddingInlineEnd` instead of `paddingLeft` / `paddingRight`

> **`stylis-plugin-rtl` auto-flipping:** the app and `@cap/theme` already wire in `stylis-plugin-rtl`, which automatically mirrors MUI's *physical* `sx` shorthands (`px`, `mx`, `pl`, `pr`, etc.) at the CSS-emission level when `dir='rtl'` is set. This means a component using `px`/`mx` is **not** automatically an RTL bug — the physical shorthand is safe because the plugin flips it. Prefer logical properties in hand-written `styled()`/raw CSS and in `sx` where clarity benefits, but do not "fix" working `px`/`mx` usage into logical properties unless the physical property is being applied through a path the plugin does not cover.

---

## 2. Typography & Fonts

- **Sans-Serif (Body & UI)**: Inter (`fontFamily.sans`)
- **Monospace (Code & Keys)**: JetBrains Mono (`fontFamily.mono`)

Font sizes follow standard rem scale (`xs`: 0.75rem, `sm`: 0.875rem, `base`: 1rem, `lg`: 1.125rem, `xl`: 1.25rem, `2xl`: 1.5rem, `3xl`: 1.875rem, `4xl`: 2.25rem).

---

## 3. Accessibility & Landmarks

1. **Landmarks**: Layouts must use semantic HTML tags (`<header>`, `<main>`, `<footer>`, `<aside>`, `<nav>`).
2. **Skip Links**: The `<SkipToContent />` link at app root allows keyboard users to bypass navigation.
3. **Focus States**: Interactive elements must retain visible focus indicators (`:focus-visible`).
4. **Color Contrast**: Text colors must satisfy WCAG 2.1 AA minimum contrast ratios (4.5:1 for normal text, 3:1 for large text).
