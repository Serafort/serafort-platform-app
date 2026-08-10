import React, { useMemo, useCallback, useEffect } from 'react'
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
import fuzzyFilter from './fuzzyFilter'
import type { DensityState, IPerson } from './types'
import TableFilters from './TableFilters'
import DebouncedInput from './DebouncedInput'
import DensityFeature from './DensityFeature'
import useSkipper from './useSkipper'
import defaultColumn from './defaultColumn'

// Stable references for TanStack Table factories
const coreRowModel = getCoreRowModel<any>()
const filteredRowModel = getFilteredRowModel<any>()
const sortedRowModel = getSortedRowModel<any>()
const paginationRowModel = getPaginationRowModel<any>()
const facetedRowModel = getFacetedRowModel<any>()
const facetedUniqueValues = getFacetedUniqueValues<any>()
const facetedMinMaxValues = getFacetedMinMaxValues<any>()
const filterFns = { fuzzy: fuzzyFilter }
const features = [DensityFeature]

interface LocalTableRowProps {
  row: Row<IPerson>
  density: DensityState
}

function LocalTableRowComponent({ row, density }: LocalTableRowProps) {
  const padding = density === 'sm' ? '4px' : density === 'md' ? '8px' : '16px'

  return (
    <TableRow hover>
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          style={{
            padding,
            transition: 'padding 0.2s',
          }}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

const MemoizedLocalTableRow = React.memo(LocalTableRowComponent)

interface LocalTableProps {
  data: Array<IPerson>
  columns: Array<ColumnDef<IPerson>>
  loading?: boolean
}

function LocalTableInner({ data, columns, loading = false }: LocalTableProps) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [tableData, setTableData] = React.useState<Array<IPerson>>([...data])
  const [density, setDensity] = React.useState<DensityState>('md')
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()

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
        pageSize: 10,
      },
    }),
    [],
  )

  const stateObj = useMemo(
    () => ({
      rowSelection,
      globalFilter,
      density,
    }),
    [rowSelection, globalFilter, density],
  )

  const table = useReactTable({
    data: tableData,
    columns,
    defaultColumn,
    filterFns,
    state: stateObj,
    initialState: initialStateObj,
    autoResetPageIndex,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
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

  const fillArray = useMemo(() => Array.from({ length: 5 }, (_, idx) => idx), [])

  const handleToggleDensity = useCallback(() => {
    table.toggleDensity()
  }, [table])

  const handleSearchChange = useCallback((value: string | number) => {
    setGlobalFilter(String(value))
  }, [])

  const cellPaddingStyle = useMemo(
    () => (density === 'sm' ? '4px' : density === 'md' ? '8px' : '16px'),
    [density],
  )

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardContent>
          <Button variant='contained' onClick={handleToggleDensity}>
            Toggle Density
          </Button>
          <TableFilters setData={setTableData} tableData={data} />
          <Box display='flex' justifyContent='space-between'>
            <Box className='flex flex-col sm:flex-row is-full sm:is-auto items-start sm:items-center gap-4'>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={handleSearchChange}
                placeholder='Search User'
                className='is-full sm:is-auto'
              />
            </Box>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 650 }} stickyHeader aria-label='sticky table'>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{
                          padding: cellPaddingStyle,
                          transition: 'padding 0.2s',
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          <div onClick={header.column.getToggleSortingHandler()}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <ArrowUpward />,
                              desc: <ArrowDownward />,
                            }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                          </div>
                        )}
                      </TableCell>
                    ))}
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
                      <TableRow key={`skeleton-local-${idx}`}>
                        {table.getHeaderGroups().map((group) =>
                          group.headers.map((header) => (
                            <TableCell key={`skeleton-local-cell-${idx}-${header.id}`}>
                              <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
                            </TableCell>
                          )),
                        )}
                      </TableRow>
                    ))}
                  {!loading &&
                    table.getRowModel().rows.map((row) => (
                      <MemoizedLocalTableRow key={row.id} row={row} density={density} />
                    ))}
                </TableBody>
              )}
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}

export const LocalTable = React.memo(LocalTableInner)
export default LocalTable
