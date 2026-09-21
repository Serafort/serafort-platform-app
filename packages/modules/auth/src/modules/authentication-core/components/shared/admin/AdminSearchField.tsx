import React from 'react'
import { InputAdornment, TextField } from '@mui/material'
import Search from '@mui/icons-material/Search'
import type { SxProps, Theme } from '@mui/material'

export interface AdminSearchFieldProps {
  value: string
  onChange: (value: string) => void
  /** Already-translated placeholder. */
  placeholder?: string
  /**
   * Already-translated accessible name. A placeholder is not a label, and these
   * fields have no visible one, so this is what a screen reader announces.
   */
  ariaLabel: string
  fullWidth?: boolean
  sx?: SxProps<Theme>
  id?: string
}

/**
 * The filter box above an admin collection.
 *
 * Sized to the 48px minimum rather than MUI's `size='small'` (40px), which the
 * screens used everywhere and which misses the touch-target floor.
 */
const AdminSearchField: React.FC<AdminSearchFieldProps> = ({
  value,
  onChange,
  placeholder,
  ariaLabel,
  fullWidth,
  sx,
  id,
}) => (
  <TextField
    id={id}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    fullWidth={fullWidth}
    slotProps={{
      htmlInput: { 'aria-label': ariaLabel },
      input: {
        startAdornment: (
          <InputAdornment position='start'>
            <Search sx={{ fontSize: 20, color: 'var(--sf-text-tertiary, inherit)' }} />
          </InputAdornment>
        ),
      },
    }}
    sx={{
      '& .MuiOutlinedInput-root': { borderRadius: 'var(--sf-radius-md, 8px)', minHeight: 48 },
      ...sx,
    }}
  />
)

export default AdminSearchField
