import React, { useRef, useMemo, useCallback, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Skeleton,
  Button,
} from '@mui/material'
import ArrowUpward from '@mui/icons-material/ArrowUpward'
import ArrowDownward from '@mui/icons-material/ArrowDownward'
import {
  ColumnDef,
  Column,
  ColumnPinningState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  Row,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import fuzzyFilter from '../react-table/fuzzyFilter'
import type { DensityState } from '../react-table/types'
import DebouncedInput from '../react-table/DebouncedInput'
import DensityFeature from '../react-table/DensityFeature'
import useSkipper from '../react-table/useSkipper'
import TablePaginationComponent from '../TablePaginationComponent'

// Stable references for TanStack Table factories to prevent re-creation on every render
const coreRowModel = getCoreRowModel<any>()
const filteredRowModel = getFilteredRowModel<any>()
const sortedRowModel = getSortedRowModel<any>()
const paginationRowModel = getPaginationRowModel<any>()
const facetedRowModel = getFacetedRowModel<any>()
const facetedUniqueValues = getFacetedUniqueValues<any>()
const facetedMinMaxValues = getFacetedMinMaxValues<any>()
const filterFns = { fuzzy: fuzzyFilter }
const features = [DensityFeature]

function getPinningStyles<T>(column: Column<T, unknown>, isHeader = false): React.CSSProperties {
  const isPinned = column.getIsPinned()
  const isLastLeftPinned = isPinned === 'left' && column.getIsLastColumn('left')
  const isFirstRightPinned = isPinned === 'right' && column.getIsFirstColumn('right')

  return {
    position: isPinned ? 'sticky' : 'relative',
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    zIndex: isPinned ? (isHeader ? 3 : 1) : isHeader ? 2 : 0,
    backgroundColor: isPinned ? 'inherit' : undefined,
    boxShadow: isLastLeftPinned
      ? '4px 0 4px -2px rgba(0,0,0,0.12)'
      : isFirstRightPinned
      ? '-4px 0 4px -2px rgba(0,0,0,0.12)'
      : undefined,
    width: column.getSize(),
  }
}

interface VirtualizedTableProps<T> {
  data: Array<T>
  columns: Array<ColumnDef<T>>
  loading?: boolean
  enableVirtualization?: boolean
  estimatedRowHeight?: number
  enableSearch?: boolean
  enableColumnResizing?: boolean
  initialColumnPinning?: ColumnPinningState
  mode?: 'infinite' | 'pagination' | 'both'
  onLoadMore?: () => void
  hasMore?: boolean
  loadMoreThreshold?: number
}

interface TableRowItemProps<T> {
  row: Row<T>
  density: DensityState
  measureRef?: (node: Element | null) => void
  virtualIndex?: number
}

function TableRowItemComponent<T>({
  row,
  density,
  measureRef,
  virtualIndex,
}: TableRowItemProps<T>) {
  const padding = density === 'sm' ? '4px' : density === 'md' ? '8px' : '16px'

  return (
    <TableRow hover data-index={virtualIndex} ref={measureRef}>
      {row.getVisibleCells().map((cell) => {
        const pinningStyles = getPinningStyles(cell.column, false)

        return (
          <TableCell
            key={cell.id}
            style={{
              padding,
              transition: 'padding 0.2s',
              ...pinningStyles,
            }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        )
      })}
    </TableRow>
  )
}

const MemoizedTableRow = React.memo(TableRowItemComponent) as typeof TableRowItemComponent

function VirtualizedTableComponent<T>({
  data,
  columns,
  loading = false,
  enableVirtualization = true,
  estimatedRowHeight,
  enableSearch = true,
  enableColumnResizing = true,
  initialColumnPinning,
  mode = 'infinite',
  onLoadMore,
  hasMore = false,
  loadMoreThreshold = 5,
}: VirtualizedTableProps<T>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [tableData, setTableData] = React.useState<Array<T>>([...data])
  const [density, setDensity] = React.useState<DensityState>('md')
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>(
    initialColumnPinning ?? { left: [], right: [] },
  )
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()

  const tableContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTableData([...data])
  }, [data])

  const updateData = useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      skipAutoResetPageIndex()
      setTableData((old) =>
        old.map((row, index) => {
          if (index === rowIndex) {
            return {
              ...old[rowIndex]!,
              [columnId]: value,
            }
          }
          return row
        }),
      )
    },
    [skipAutoResetPageIndex],
  )

  const metaObj = useMemo(
    () => ({
      updateData,
    }),
    [updateData],
  )

  const initialStateObj = useMemo(
    () => ({
      pagination: {
        pageSize: mode === 'infinite' ? tableData.length || 10 : 10,
      },
      columnPinning: initialColumnPinning ?? { left: [], right: [] },
    }),
    [mode, tableData.length, initialColumnPinning],
  )

  const stateObj = useMemo(
    () => ({
      rowSelection,
      globalFilter,
      density,
      columnPinning,
    }),
    [rowSelection, globalFilter, density, columnPinning],
  )

  const table = useReactTable({
    data: tableData,
    columns: columns as ColumnDef<T, any>[],
    filterFns,
    state: stateObj,
    initialState: initialStateObj,
    autoResetPageIndex,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnPinningChange: setColumnPinning,
    enableColumnResizing,
    columnResizeMode: 'onChange',
    getCoreRowModel: coreRowModel,
    getFilteredRowModel: filteredRowModel,
    getSortedRowModel: sortedRowModel,
    getPaginationRowModel: paginationRowModel,
    getFacetedRowModel: facetedRowModel,
    getFacetedUniqueValues: facetedUniqueValues,
    getFacetedMinMaxValues: facetedMinMaxValues,
    _features: features,
    onDensityChange: setDensity,
    meta: metaObj,
    enableRowSelection: true,
    debugTable: false,
    debugHeaders: false,
    debugColumns: false,
  })

  const { rows } = table.getRowModel()

  const shouldVirtualize = enableVirtualization && rows.length > 50

  const computedRowHeight = useMemo(() => {
    if (estimatedRowHeight) return estimatedRowHeight
    return density === 'sm' ? 36 : density === 'md' ? 48 : 64
  }, [estimatedRowHeight, density])

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => computedRowHeight,
    overscan: 10,
    enabled: shouldVirtualize,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()

  // Infinite Scroll Trigger
  useEffect(() => {
    if (!onLoadMore || !hasMore || loading || !shouldVirtualize || virtualRows.length === 0) {
      return
    }

    const lastItem = virtualRows[virtualRows.length - 1]
    if (lastItem && lastItem.index >= rows.length - 1 - loadMoreThreshold) {
      onLoadMore()
    }
  }, [virtualRows, rows.length, loadMoreThreshold, hasMore, loading, shouldVirtualize, onLoadMore])

  const totalSize = rowVirtualizer.getTotalSize()

  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start ?? 0 : 0
  const paddingBottom =
    virtualRows.length > 0 ? totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0) : 0

  const fillArray = useMemo(() => Array.from({ length: 5 }, (_, idx) => idx), [])

  const handleSearchChange = useCallback((value: string | number) => {
    setGlobalFilter(String(value))
  }, [])

  const handleToggleDensity = useCallback(() => {
    table.toggleDensity()
  }, [table])

  const cellPaddingStyle = useMemo(
    () => (density === 'sm' ? '4px' : density === 'md' ? '8px' : '16px'),
    [density],
  )

  const showPagination = mode === 'pagination' || mode === 'both'

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardContent>
          <Box display='flex' gap={2} mb={2}>
            <Button variant='contained' onClick={handleToggleDensity}>
              Toggle Density
            </Button>
          </Box>
          {enableSearch && (
            <Box display='flex' justifyContent='space-between' sx={{ mb: 2 }}>
              <Box className='flex flex-col sm:flex-row is-full sm:is-auto items-start sm:items-center gap-4'>
                <DebouncedInput
                  value={globalFilter ?? ''}
                  onChange={handleSearchChange}
                  placeholder='Search...'
                  className='is-full sm:is-auto'
                />
              </Box>
            </Box>
          )}

          <TableContainer
            ref={tableContainerRef}
            sx={{
              maxHeight: shouldVirtualize ? '600px' : 'none',
              overflow: shouldVirtualize ? 'auto' : 'visible',
            }}
          >
            <Table sx={{ minWidth: 650 }} stickyHeader aria-label='virtualized table'>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const pinningStyles = getPinningStyles(header.column, true)
                      const isResizing = header.column.getIsResizing()

                      return (
                        <TableCell
                          key={header.id}
                          colSpan={header.colSpan}
                          style={{
                            padding: cellPaddingStyle,
                            transition: 'padding 0.2s',
                            ...pinningStyles,
                          }}
                        >
                          {header.isPlaceholder ? null : (
                            <Box
                              display='flex'
                              alignItems='center'
                              justifyContent='space-between'
                              sx={{ position: 'relative', pr: enableColumnResizing ? 1.5 : 0 }}
                            >
                              <div
                                onClick={header.column.getToggleSortingHandler()}
                                style={{
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {{
                                  asc: <ArrowUpward fontSize='small' />,
                                  desc: <ArrowDownward fontSize='small' />,
                                }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                              </div>

                              {enableColumnResizing && header.column.getCanResize() && (
                                <Box
                                  onMouseDown={header.getResizeHandler()}
                                  onTouchStart={header.getResizeHandler()}
                                  sx={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 0,
                                    height: '100%',
                                    width: '5px',
                                    cursor: 'col-resize',
                                    userSelect: 'none',
                                    touchAction: 'none',
                                    opacity: isResizing ? 1 : 0.3,
                                    backgroundColor: isResizing
                                      ? 'primary.main'
                                      : 'action.disabledBackground',
                                    '&:hover': {
                                      opacity: 1,
                                      backgroundColor: 'primary.main',
                                    },
                                  }}
                                />
                              )}
                            </Box>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHead>
              {table.getFilteredRowModel().rows.length === 0 ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={table.getVisibleFlatColumns().length} align='center'>
                      No data available
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  {loading &&
                    fillArray.map((idx) => (
                      <TableRow key={`skeleton-row-${idx}`}>
                        {table.getHeaderGroups().map((group) =>
                          group.headers.map((header) => (
                            <TableCell key={`skeleton-cell-${idx}-${header.id}`}>
                              <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
                            </TableCell>
                          )),
                        )}
                      </TableRow>
                    ))}
                  {!loading && shouldVirtualize && (
                    <>
                      {paddingTop > 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={table.getVisibleFlatColumns().length}
                            style={{ height: `${paddingTop}px` }}
                          />
                        </TableRow>
                      )}
                      {virtualRows.map((virtualRow) => {
                        const row = rows[virtualRow.index]
                        return (
                          <MemoizedTableRow
                            key={row.id}
                            row={row}
                            density={density}
                            virtualIndex={virtualRow.index}
                            measureRef={rowVirtualizer.measureElement}
                          />
                        )
                      })}
                      {paddingBottom > 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={table.getVisibleFlatColumns().length}
                            style={{ height: `${paddingBottom}px` }}
                          />
                        </TableRow>
                      )}
                    </>
                  )}
                  {!loading &&
                    !shouldVirtualize &&
                    rows.map((row) => (
                      <MemoizedTableRow key={row.id} row={row} density={density} />
                    ))}
                </TableBody>
              )}
            </Table>
          </TableContainer>
          {shouldVirtualize && mode !== 'pagination' && (
            <Box sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
              Showing {virtualRows.length} of {rows.length} rows (Virtual Scrolling Enabled
              {hasMore ? ' - Infinite Scroll Active' : ''})
            </Box>
          )}
          {showPagination && <TablePaginationComponent table={table} />}
        </CardContent>
      </Card>
    </Box>
  )
}

export const VirtualizedTable = React.memo(
  VirtualizedTableComponent,
) as typeof VirtualizedTableComponent
export default VirtualizedTable
