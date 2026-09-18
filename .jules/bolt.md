## 2024-05-18 - Avoid O(n^2) when structuring static data
**Learning:** The `getDepartements` function in `app/src/utils/Functions.ts` converted a static flat list (`zone.ts`) of >14k elements into a nested hierarchy (Departments -> Arrondissements -> Communes -> Localites) using nested `filter` and `reduce` operations inside a `.map` loop. This effectively resulted in O(N^2) time complexity, leading to ~300ms+ execution time.
**Action:** When grouping or joining large static arrays into nested hierarchies on the frontend, always use Hash Maps/Sets to index the arrays once linearly (O(N)), avoiding repeated `.find` or `.filter` traversals. This reduced execution time by over 70% while keeping exact compatibility.

## 2024-05-19 - Hoisting Static Data Reductions
**Learning:** When trying to prevent unnecessary recalculations of derived data (like grouped or mapped arrays) in React components, if the source data is a static constant defined outside the component, `useMemo` is suboptimal. The calculation will still be evaluated when the module is loaded and memoized on component mount, but hoisting the calculation entirely outside the component ensures it only runs once per module load, rather than on every component instance mount.
**Action:** Before using `useMemo` with an empty dependency array for static data, evaluate if the data processing can just be hoisted to the module scope.

## 2024-09-17 - Avoid Math.random() in React keys
**Learning:** Using `Math.random()` in React component `key` props forces React to see the elements as entirely new instances on every single render. This anti-pattern completely disables React's diffing algorithm and causes the entire component sub-tree to unmount and remount repeatedly, leading to disastrous performance issues (especially in complex data grids like tables).
**Action:** Always use stable identifiers for React keys (e.g. `item.id`, `column.key`, or index as a last resort). Never use random functions or Date.now() for list items or elements unless you explicitly want to force a full re-initialization (and even then, handle carefully).
