import { createTheme } from '@mui/material'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      light: '#30CD9F',
      main: '#218f6f',
      dark: '#30CD9F',
      contrastText: '#59d7b2',
    },
    secondary: {
      light: '#005A2C',
      main: '#003e1e',
      dark: '#005A2C',
      contrastText: '#337b5',
    },
  },
})
export default darkTheme
