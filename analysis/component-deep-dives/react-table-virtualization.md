# Component Deep Dive — React-Table & Virtualization

The `@cap/layout` package provides high-performance data presentation components leveraging `@tanstack/react-table` (v8) for tabular state and `@tanstack/react-virtual` (v3) for DOM virtualization.

The implementation comprises three virtualized components located in `packages/layout/src/components/ui/virtualized/`:

- `VirtualizedTable.tsx` (Table-structured data)
- `VirtualizedList.tsx` (Flat linear lists)
- `VirtualizedGrid.tsx` (Grid/Tile layouts)

---

## 1. Table Virtualization (`VirtualizedTable.tsx`)

`VirtualizedTable` coordinates a TanStack Table core instance with a row virtualizer to display large datasets while keeping DOM nodes to a minimum.

### Setup and Integration

```typescript
const table = useReactTable({
  data: tableData,
  columns,
  state: { rowSelection, globalFilter, density },
  // pagination is bypassed by setting page size to data length when virtualized
  initialState: {
    pagination: { pageSize: enableVirtualization ? tableData.length : 10 },
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  // ... custom density features
});

const { rows } = table.getRowModel();

const rowVirtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => tableContainerRef.current,
  estimateSize: () => estimatedRowHeight,
  overscan: 10,
  enabled: enableVirtualization && rows.length > 50,
});
```

### Table-Safe Spacer Layout Strategy

HTML `<table>` elements do not support absolute positioning for rows (`<tr>`) without breaking the native table layout algorithms (such as cell alignment and column width sizing).

To solve this, `VirtualizedTable` uses a **padding/spacer row strategy**:

1.  **Padding Calculation**:
    - `paddingTop`: The distance from the top of the container to the start of the first visible virtual item.
      - `const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0`
    - `paddingBottom`: The distance from the end of the last visible virtual item to the bottom of the virtual scroll height.
      - `const paddingBottom = virtualRows.length > 0 ? totalSize - virtualRows[virtualRows.length - 1].end : 0`
2.  **Rendering Spacers**: Renders blank rows with matching column span before and after the visible rows:
    ```tsx
    {
      paddingTop > 0 && (
        <TableRow>
          <TableCell
            colSpan={table.getVisibleFlatColumns().length}
            style={{ height: `${paddingTop}px` }}
          />
        </TableRow>
      );
    }
    {
      /* Visible virtualized rows map here */
    }
    {
      paddingBottom > 0 && (
        <TableRow>
          <TableCell
            colSpan={table.getVisibleFlatColumns().length}
            style={{ height: `${paddingBottom}px` }}
          />
        </TableRow>
      );
    }
    ```

---

## 2. List Virtualization (`VirtualizedList.tsx`)

`VirtualizedList` provides a standard vertical scroll list virtualization using absolute positioning and translation transforms.

### Absolute Positioning & Dynamic Sizing

Unlike the table implementation, lists do not have structural restrictions and can be positioned freely:

- **Total Height Container**: A container box is set to the total calculated height of all elements (`height: ${rowVirtualizer.getTotalSize()}px`) with `position: 'relative'`.
- **Absolutely Positioned Items**: Individual list items are positioned at the top left and translated vertically:
  - `transform: translateY(${virtualItem.start}px)`
- **Dynamic Measurement**: Attaches the measurement ref:
  - `ref={rowVirtualizer.measureElement}`
    This allows `react-virtual` to measure the actual height of elements at runtime and adjust the offsets dynamically, making it robust for lists with multi-line or variable-height text.

---

## 3. Grid Virtualization (`VirtualizedGrid.tsx`)

`VirtualizedGrid` extends list virtualization to a multi-column tile interface.

### Row-Chunking Strategy

Virtualizing a grid cell-by-cell is inefficient and causes visual gaps during fast horizontal/vertical scrolling. `VirtualizedGrid` solves this by **virtualizing the rows** rather than individual cells.

1.  **Row Calculation**:
    - `const rows = Math.ceil(items.length / columns)`
2.  **Virtualizer Count**:
    - `useVirtualizer` count is set to `rows` instead of `items.length`.
3.  **Cell Slice & CSS Grid**:
    - During mapping of the visible virtual rows, the flat array of items is sliced to extract the elements for that row:
      - `const startIndex = virtualRow.index * columns`
      - `const rowItems = items.slice(startIndex, startIndex + columns)`
    - The row element is absolutely positioned (`transform: translateY(${virtualRow.start}px)`) and uses a CSS Grid layout for internal alignment:
      ```tsx
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap * 8}px`,
        }}
      >
        {rowItems.map((item, colIndex) => (
          <Box key={startIndex + colIndex}>
            {renderItem(item, startIndex + colIndex)}
          </Box>
        ))}
      </Box>
      ```
    - Dynamic row measurement is preserved via `ref={rowVirtualizer.measureElement}` on the row container.

---

## 4. Layout Architecture Comparisons

| Feature / Detail         | `VirtualizedTable`                           | `VirtualizedList`                  | `VirtualizedGrid`                  |
| :----------------------- | :------------------------------------------- | :--------------------------------- | :--------------------------------- |
| **Spacer Mechanism**     | Spacer rows (`TableRow` with dynamic height) | Absolute wrapper with `translateY` | Absolute wrapper with `translateY` |
| **Grid Layout**          | Native `<table>` layouts                     | Single column layout               | CSS Grid (`gridTemplateColumns`)   |
| **Measurement Strategy** | Dynamic (`measureElement` ref)               | Dynamic (`measureElement` ref)     | Dynamic (`measureElement` ref)     |
| **Activation Threshold** | `items.length > 50`                          | `items.length > 50`                | `rows > 20`                        |

### Key Optimization Opportunity — RESOLVED

In `VirtualizedTable.tsx`, the virtualized row element now binds the dynamic measurement ref via `ref={measureRef}` (sourced from `rowVirtualizer.measureElement`) with a `data-index` attribute:

```tsx
<TableRow hover data-index={virtualIndex} ref={measureRef}>
```

- **Outcome**: Table rows are measured at runtime, so variable content (wrapped text, varying descriptions) no longer jumps or misaligns — matching the robust behavior of `VirtualizedList` and `VirtualizedGrid`.
