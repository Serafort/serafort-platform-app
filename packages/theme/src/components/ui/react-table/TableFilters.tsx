import React, { useCallback } from 'react'
import type { IPerson } from './types'
import { CardContent, Grid, MenuItem, TextField } from '@mui/material'

interface TableFiltersProps {
  setData: (data: Array<IPerson>) => void
  tableData?: Array<IPerson>
}

const TableFiltersComponent = ({ setData, tableData }: TableFiltersProps) => {
  const [status, setStatus] = React.useState<string>('')

  React.useEffect(() => {
    const filteredData = tableData?.filter((user) => {
      if (status && user.status !== status) return false
      return true
    })

    setData(filteredData ?? [])
  }, [status, tableData, setData])

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStatus(e.target.value)
  }, [])

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            fullWidth
            id='select-status'
            value={status}
            onChange={handleStatusChange}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>Select Status</MenuItem>
            <MenuItem value='relationship'>relationship</MenuItem>
            <MenuItem value='complicated'>complicated</MenuItem>
            <MenuItem value='single'>single</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export const TableFilters = React.memo(TableFiltersComponent)
export default TableFilters
