## 2026-09-12 - [Array Reduction Performance]
**Learning:** When using array reduction `Array.prototype.reduce` in React components where the source data is a static array defined outside the component, moving the reduction to module level prevents O(n) re-computation on every component render.
**Action:** Hoist pure, static data calculations to the module level rather than leaving them inside the component's render flow or wrapping them in `useMemo`.
