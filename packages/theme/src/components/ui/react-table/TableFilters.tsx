import React, { useCallback } from 'react'
import { CardContent, Grid, MenuItem, TextField } from '@mui/material'

interface TableFiltersProps {
  status: string
  onStatusChange: (status: string) => void
}

const TableFiltersComponent = ({ status, onStatusChange }: TableFiltersProps) => {
  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onStatusChange(e.target.value)
  }, [onStatusChange])

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
