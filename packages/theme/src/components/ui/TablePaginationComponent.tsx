import React, { useMemo, useCallback } from 'react'
import { Typography, Pagination, Box } from '@mui/material'
import type { Table } from '@tanstack/react-table'

interface TablePaginationProps<T> {
  table: Table<T>
}

function TablePaginationInner<T>({ table }: TablePaginationProps<T>) {
  const filteredRowCount = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination

  const showingText = useMemo(() => {
    if (filteredRowCount === 0) {
      return 'Showing 0 to 0 of 0 entries'
    }
    const from = pageIndex * pageSize + 1
    const to = Math.min((pageIndex + 1) * pageSize, filteredRowCount)
    return `Showing ${from} to ${to} of ${filteredRowCount} entries`
  }, [filteredRowCount, pageIndex, pageSize])

  const pageCount = useMemo(
    () => Math.ceil(filteredRowCount / pageSize),
    [filteredRowCount, pageSize],
  )

  const handlePageChange = useCallback(
    (_: React.ChangeEvent<unknown>, page: number) => {
      table.setPageIndex(page - 1)
    },
    [table],
  )

  return (
    <Box
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      flexWrap='wrap'
      paddingInlineStart='1.5rem'
      paddingBlock='12.5px'
      gap={2}
      sx={{
        borderBlockStartWidth: '1.5rem',
        blockSize: 'auto',
      }}
    >
      <Typography color='text.disabled'>{showingText}</Typography>
      <Pagination
        shape='rounded'
        color='primary'
        variant='outlined'
        count={pageCount}
        page={pageIndex + 1}
        onChange={handlePageChange}
        showFirstButton
        showLastButton
      />
    </Box>
  )
}

export const TablePaginationComponent = React.memo(
  TablePaginationInner,
) as typeof TablePaginationInner
export default TablePaginationComponent
