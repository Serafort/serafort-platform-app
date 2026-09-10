## 2026-09-07 - Added accessible name to generic OptionMenu component
**Learning:** Added ARIA label to OptionMenu's IconButton to improve screen reader experience for toggle buttons without visual text. Placed it before the spread of props so consumers can still override it if they need a more specific label.
**Action:** When adding default ARIA attributes to reusable components, place them before prop spreading so they act as fallbacks rather than unbreakable overrides.

## 2024-11-20 - Interpolating Context into ARIA Labels in Dynamic Lists
**Learning:** When rendering dynamic lists with actionable icon buttons (e.g., Delete), screen readers often encounter repetitive and ambiguous labels like "Delete". Without context, users don't know what is being deleted.
**Action:** Always interpolate the unique identifier or name of the item (e.g., `aria-label={'Delete ' + item.name}`) to provide explicit context to screen reader users.
