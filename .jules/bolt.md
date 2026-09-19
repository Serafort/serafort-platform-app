## 2024-05-18 - Avoid O(n^2) when structuring static data
**Learning:** The `getDepartements` function in `app/src/utils/Functions.ts` converted a static flat list (`zone.ts`) of >14k elements into a nested hierarchy (Departments -> Arrondissements -> Communes -> Localites) using nested `filter` and `reduce` operations inside a `.map` loop. This effectively resulted in O(N^2) time complexity, leading to ~300ms+ execution time.
**Action:** When grouping or joining large static arrays into nested hierarchies on the frontend, always use Hash Maps/Sets to index the arrays once linearly (O(N)), avoiding repeated `.find` or `.filter` traversals. This reduced execution time by over 70% while keeping exact compatibility.

## 2026-09-12 - [Array Reduction Performance]
**Learning:** When using array reduction `Array.prototype.reduce` in React components where the source data is a static array defined outside the component, moving the reduction to module level prevents O(n) re-computation on every component render.
**Action:** Hoist pure, static data calculations to the module level rather than leaving them inside the component's render flow or wrapping them in `useMemo`.

## 2024-05-18 - Hoisting static data reductions
**Learning:** Found an instance in FeatureComparison.tsx where a reduction on a static array was being performed inside the render cycle, unnecessarily recalculating `groupedFeatures` on every render.
**Action:** Always hoist computations that rely entirely on static module-level data outside of React component definitions. This avoids overhead without needing `useMemo`, keeping components lean.

## 2024-05-24 - Do not use Math.random() as React Keys
**Learning:** Using `Math.random()` to generate keys in lists (e.g. `key={Math.random()}`) defeats Reacts DOM node reuse optimization, forcing unmounting and remounting on every render which dramatically impacts performance, especially in large tables. Additionally, iterating over `Object.keys(row).filter` within a render loop just to calculate a string key is highly inefficient and impacts render speed.
**Action:** Always map deterministic, stable, unique values to the `key` prop when rendering lists, such as a database ID or a string consisting of `row-index` and `header-key`. Avoid using filter operations or string manipulations inside the map function when generating keys.

## 2024-09-17 - Avoid Math.random() in React keys
**Learning:** Using `Math.random()` in React component `key` props forces React to see the elements as entirely new instances on every single render. This anti-pattern completely disables React's diffing algorithm and causes the entire component sub-tree to unmount and remount repeatedly, leading to disastrous performance issues (especially in complex data grids like tables).
**Action:** Always use stable identifiers for React keys (e.g. `item.id`, `column.key`, or index as a last resort). Never use random functions or Date.now() for list items or elements unless you explicitly want to force a full re-initialization (and even then, handle carefully).

## 2024-11-20 - Replace nested O(n^2) deduplication array methods with O(n) Map traversals
**Learning:** In `SAMLMetadataBrowser.tsx`, array deduplication was performed by combining a `.reduce()` loop with an inner `.find()` lookup, resulting in O(N^2) time complexity. For large lists, such as a large number of SAML entities, this creates significant unnecessary computational overhead on the main thread.
**Action:** When deduplicating merged lists based on a unique identifier (like `entityId`), always use a `Map` structure to index items linearly in O(N) time instead of using nested array methods.
