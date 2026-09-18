## 2024-05-18 - Avoid O(n^2) when structuring static data
**Learning:** The `getDepartements` function in `app/src/utils/Functions.ts` converted a static flat list (`zone.ts`) of >14k elements into a nested hierarchy (Departments -> Arrondissements -> Communes -> Localites) using nested `filter` and `reduce` operations inside a `.map` loop. This effectively resulted in O(N^2) time complexity, leading to ~300ms+ execution time.
**Action:** When grouping or joining large static arrays into nested hierarchies on the frontend, always use Hash Maps/Sets to index the arrays once linearly (O(N)), avoiding repeated `.find` or `.filter` traversals. This reduced execution time by over 70% while keeping exact compatibility.

## 2026-09-12 - [Array Reduction Performance]
**Learning:** When using array reduction `Array.prototype.reduce` in React components where the source data is a static array defined outside the component, moving the reduction to module level prevents O(n) re-computation on every component render.
**Action:** Hoist pure, static data calculations to the module level rather than leaving them inside the component's render flow or wrapping them in `useMemo`.
