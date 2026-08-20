import type { Theme } from '@mui/material/styles'

const backdrop: Theme['components'] = {
  MuiBackdrop: {
    styleOverrides: {
      root: {
        '&:not(.MuiBackdrop-invisible)': {
          backgroundColor: 'var(--form-modal-backdrop-bg, var(--backdrop-color, rgba(0, 0, 0, 0.65)))',
          backdropFilter: 'var(--form-modal-backdrop-filter, blur(8px))',
          WebkitBackdropFilter: 'var(--form-modal-backdrop-filter, blur(8px))',
        },
      },
    },
  },
}

export default backdrop
