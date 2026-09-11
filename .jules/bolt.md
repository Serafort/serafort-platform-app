## 2024-05-18 - Hoisting static data reductions
**Learning:** Found an instance in FeatureComparison.tsx where a reduction on a static array was being performed inside the render cycle, unnecessarily recalculating `groupedFeatures` on every render.
**Action:** Always hoist computations that rely entirely on static module-level data outside of React component definitions. This avoids overhead without needing `useMemo`, keeping components lean.
