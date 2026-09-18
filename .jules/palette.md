## 2026-09-07 - Added accessible name to generic OptionMenu component
**Learning:** Added ARIA label to OptionMenu's IconButton to improve screen reader experience for toggle buttons without visual text. Placed it before the spread of props so consumers can still override it if they need a more specific label.
**Action:** When adding default ARIA attributes to reusable components, place them before prop spreading so they act as fallbacks rather than unbreakable overrides.

## 2026-09-09 - Add ARIA label to dynamic list view item actions
**Learning:** Added ARIA label to the "Delete View" IconButton in the DashboardViewSelector. When dealing with dynamically generated lists where multiple identical buttons exist (like "Delete"), it's crucial to include the dynamic item's name in the `aria-label` (e.g., `aria-label={"Delete view " + name}`). This ensures screen reader users know exactly which item they are acting upon rather than just hearing "Delete" multiple times.
**Action:** Always interpolate the item's unique identifier or name into ARIA labels for actions rendered within a list or map function.
