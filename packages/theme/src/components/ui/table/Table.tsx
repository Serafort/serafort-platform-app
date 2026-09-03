import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  TableContainer,
  TablePagination,
  Box,
} from '@mui/material'
import PerfectScrollbar from 'react-perfect-scrollbar'
import type { ITableData } from './types'
import TableComponent from './TableComponent'

export default React.forwardRef<any, { loading: boolean; data: ITableData }>(
  (
    {
      loading = false,
      data = {
        header: [],
        rows: [],
      },
    },
    ref,
  ) => {
    const { t } = useTranslation()
    const [rowsPerPage, setRowsPerPage] = React.useState<number>(5)
    const [page, setPage] = React.useState<number>(0)
    const handlePageChange = (_: unknown, newPagE: number) => setPage(newPagE)
    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(event.target.value as unknown as number)
      setPage(0)
    }

    return (
      <>
        {loading && <LinearProgress />}
        <Card sx={{ p: 0 }}>
          <CardContent>
            <PerfectScrollbar>
              <TableContainer>
                <TableComponent
                  ref={ref}
                  loading={loading}
                  data={data}
                  rowsPerPage={rowsPerPage}
                  page={page}
                />
              </TableContainer>
            </PerfectScrollbar>
          </CardContent>
          <CardActions>
            <TablePagination
              component={Box}
              labelRowsPerPage={t('table.rowsPerPage', 'Rows per page')}
              count={data.rows.length}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
            />
          </CardActions>
        </Card>
      </>
    )
  },
)
