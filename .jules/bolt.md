## 2024-05-18 - Avoid O(n^2) when structuring static data
**Learning:** The `getDepartements` function in `app/src/utils/Functions.ts` converted a static flat list (`zone.ts`) of >14k elements into a nested hierarchy (Departments -> Arrondissements -> Communes -> Localites) using nested `filter` and `reduce` operations inside a `.map` loop. This effectively resulted in O(N^2) time complexity, leading to ~300ms+ execution time.
**Action:** When grouping or joining large static arrays into nested hierarchies on the frontend, always use Hash Maps/Sets to index the arrays once linearly (O(N)), avoiding repeated `.find` or `.filter` traversals. This reduced execution time by over 70% while keeping exact compatibility.

## 2024-05-24 - Do not use Math.random() as React Keys
**Learning:** Using `Math.random()` to generate keys in lists (e.g. `key={Math.random()}`) defeats Reacts DOM node reuse optimization, forcing unmounting and remounting on every render which dramatically impacts performance, especially in large tables. Additionally, iterating over `Object.keys(row).filter` within a render loop just to calculate a string key is highly inefficient and impacts render speed.
**Action:** Always map deterministic, stable, unique values to the `key` prop when rendering lists, such as a database ID or a string consisting of `row-index` and `header-key`. Avoid using filter operations or string manipulations inside the map function when generating keys.

## 2024-09-17 - Avoid Math.random() in React keys
**Learning:** Using `Math.random()` in React component `key` props forces React to see the elements as entirely new instances on every single render. This anti-pattern completely disables React's diffing algorithm and causes the entire component sub-tree to unmount and remount repeatedly, leading to disastrous performance issues (especially in complex data grids like tables).
**Action:** Always use stable identifiers for React keys (e.g. `item.id`, `column.key`, or index as a last resort). Never use random functions or Date.now() for list items or elements unless you explicitly want to force a full re-initialization (and even then, handle carefully).
