## 2026-09-07 - Added accessible name to generic OptionMenu component
**Learning:** Added ARIA label to OptionMenu's IconButton to improve screen reader experience for toggle buttons without visual text. Placed it before the spread of props so consumers can still override it if they need a more specific label.
**Action:** When adding default ARIA attributes to reusable components, place them before prop spreading so they act as fallbacks rather than unbreakable overrides.

## 2026-09-09 - Add ARIA label to dynamic list view item actions
**Learning:** Added ARIA label to the "Delete View" IconButton in the DashboardViewSelector. When dealing with dynamically generated lists where multiple identical buttons exist (like "Delete"), it's crucial to include the dynamic item's name in the `aria-label` (e.g., `aria-label={"Delete view " + name}`). This ensures screen reader users know exactly which item they are acting upon rather than just hearing "Delete" multiple times.
**Action:** Always interpolate the item's unique identifier or name into ARIA labels for actions rendered within a list or map function.

## 2024-09-14 - Added dynamic aria-label to Dashboard View Delete button
**Learning:** When adding ARIA labels to buttons rendered in a `.map()` loop (e.g., deleting a specific dashboard view), it is important to include the unique item name (e.g., `aria-label={"Delete " + name + " view"}`) so that screen readers can distinguish between multiple similar buttons on the page.
**Action:** When working on lists, tables, or mapped elements, always interpolate the item's unique identifier into the ARIA label for interactive components.

## 2026-09-12 - Missing ARIA Labels on IconButtons in Dropdowns
**Learning:** Icon-only buttons (like `IconButton`) in complex components such as dropdowns (e.g., NotificationsDropdown, ShortcutsDropdown) frequently miss `aria-label`s, causing screen readers to read them out ambiguously or skip their context entirely.
**Action:** When implementing or reviewing dropdowns or menus with icon-only controls, explicitly check and assign `aria-label`s, preferably using translation keys for internationalization support (e.g., `t('navigation.actionName')`).

## 2024-03-20 - Icon Buttons Need ARIA Labels
**Learning:** Icon buttons that use Tooltip for visual description still need explicit aria-labels for screen readers.
**Action:** Always add aria-label to IconButton components, even when wrapped in a Tooltip. Use the translation system if possible, or literal strings if none available.

## 2024-11-20 - Interpolating Context into ARIA Labels in Dynamic Lists
**Learning:** When rendering dynamic lists with actionable icon buttons (e.g., Delete), screen readers often encounter repetitive and ambiguous labels like "Delete". Without context, users don't know what is being deleted.
**Action:** Always interpolate the unique identifier or name of the item (e.g., `aria-label={'Delete ' + item.name}`) to provide explicit context to screen reader users.

## 2026-09-22 - Adding ARIA labels to IconButtons inside Tooltips and dynamic lists
**Learning:** When adding `aria-label`s to `IconButton`s, the label should be applied directly to the `IconButton` element even if it is wrapped in a `Tooltip` component, to ensure accurate screen reader announcements. Additionally, when the `IconButton` is part of a dynamic list (e.g., mapped over items), the `aria-label` must dynamically interpolate the unique item identifier (like `dep.name` or `log.status`) to provide context and prevent repetitive, ambiguous labeling.
**Action:** Always place the `aria-label` directly on the `IconButton`, and always interpolate unique identifiers into the label string when rendering lists.

## 2026-09-25 - ARIA Labels for Action IconButtons in Drag-and-Drop Canvases
**Learning:** Found an `IconButton` for deleting empty panel slots inside a `WidgetCanvas` component. Although the button was visually described by a `Tooltip`, it lacked an `aria-label`, making it inaccessible to screen reader users navigating the canvas layout builder.
**Action:** Always ensure that structural or layout manipulation actions (like adding/removing slots or panels) have explicit `aria-label`s on their `IconButton`s, even when surrounded by descriptive text or tooltips, to provide clear interaction targets for assistive technologies.
