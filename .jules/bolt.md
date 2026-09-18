## 2024-05-18 - Avoid O(n^2) when structuring static data
**Learning:** The `getDepartements` function in `app/src/utils/Functions.ts` converted a static flat list (`zone.ts`) of >14k elements into a nested hierarchy (Departments -> Arrondissements -> Communes -> Localites) using nested `filter` and `reduce` operations inside a `.map` loop. This effectively resulted in O(N^2) time complexity, leading to ~300ms+ execution time.
**Action:** When grouping or joining large static arrays into nested hierarchies on the frontend, always use Hash Maps/Sets to index the arrays once linearly (O(N)), avoiding repeated `.find` or `.filter` traversals. This reduced execution time by over 70% while keeping exact compatibility.

## 2024-05-18 - Hoisting static data reductions
**Learning:** Found an instance in FeatureComparison.tsx where a reduction on a static array was being performed inside the render cycle, unnecessarily recalculating `groupedFeatures` on every render.
**Action:** Always hoist computations that rely entirely on static module-level data outside of React component definitions. This avoids overhead without needing `useMemo`, keeping components lean.
