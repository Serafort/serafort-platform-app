## 2026-09-07 - Added accessible name to generic OptionMenu component
**Learning:** Added ARIA label to OptionMenu's IconButton to improve screen reader experience for toggle buttons without visual text. Placed it before the spread of props so consumers can still override it if they need a more specific label.
**Action:** When adding default ARIA attributes to reusable components, place them before prop spreading so they act as fallbacks rather than unbreakable overrides.

## 2024-03-20 - Icon Buttons Need ARIA Labels
**Learning:** Icon buttons that use Tooltip for visual description still need explicit aria-labels for screen readers.
**Action:** Always add aria-label to IconButton components, even when wrapped in a Tooltip. Use the translation system if possible, or literal strings if none available.
