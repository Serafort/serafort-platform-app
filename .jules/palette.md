## 2026-09-07 - Added accessible name to generic OptionMenu component
**Learning:** Added ARIA label to OptionMenu's IconButton to improve screen reader experience for toggle buttons without visual text. Placed it before the spread of props so consumers can still override it if they need a more specific label.
**Action:** When adding default ARIA attributes to reusable components, place them before prop spreading so they act as fallbacks rather than unbreakable overrides.
## 2024-09-14 - Added dynamic aria-label to Dashboard View Delete button
**Learning:** When adding ARIA labels to buttons rendered in a `.map()` loop (e.g., deleting a specific dashboard view), it is important to include the unique item name (e.g., `aria-label={"Delete " + name + " view"}`) so that screen readers can distinguish between multiple similar buttons on the page.
**Action:** When working on lists, tables, or mapped elements, always interpolate the item's unique identifier into the ARIA label for interactive components.
