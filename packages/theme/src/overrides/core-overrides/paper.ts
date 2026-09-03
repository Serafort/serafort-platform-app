// MUI Imports
import type { Theme } from '@mui/material/styles'

const paper: Theme['components'] = {
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        backgroundColor: 'var(--effect-bg, var(--mui-palette-background-paper))',
        backdropFilter: 'var(--effect-backdrop, none)',
      },
    },
  },
}

export default paper
