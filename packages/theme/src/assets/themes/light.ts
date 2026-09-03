import { createTheme, alpha } from '@mui/material/styles';

import { colors as functional } from './palette/functional';

// Define light-mode specific palette tokens locally to override the dark BaseTheme defaults
const lightPrimary = {
  100: '#F3E5F5',
  200: '#E1BEE7',
  300: '#CE93D8',
  400: '#BA68C8',
  500: '#82368C', // Primary Main
  600: '#7B1FA2',
  main: '#82368C',
}

const lightSecondary = {
  main: '#07AEB5',
  light: '#4DB6AC',
  dark: '#00796B',
  contrastText: '#FFF',
}

const lightSurface = {
  100: '#FFFFFF',
  200: '#FFFFFF',
  300: '#F8F9FA',
  400: '#F1F3F5',
  500: '#E9ECEF',
  600: '#CED4DA',
  main: '#F8F9FA',
}

const lightSurfaceMixed = {
  main: '#6C757D',
  500: '#6C757D',
  600: '#495057',
}

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: lightPrimary,
    secondary: lightSecondary,
    error: functional.error,
    warning: functional.warning,
    info: functional.info,
    success: functional.success,
    surface: lightSurface,
    surfaceMixed: lightSurfaceMixed,
    divider: alpha(lightSurfaceMixed[600], 0.12),
    action: {
      hover: alpha(lightPrimary[500], 0.08),
      selected: alpha(lightPrimary[500], 0.16),
      disabled: alpha(lightSurfaceMixed[600], 0.3),
      disabledBackground: alpha(lightSurfaceMixed[600], 0.12),
      focus: alpha(lightPrimary[500], 0.12),
    },
    background: {
      default: lightSurface[300],
      paper: lightSurface[100],
    },
    text: {
      primary: '#1A1A1A',
      secondary: lightSurfaceMixed[500],
      disabled: alpha('#1A1A1A', 0.5),
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    subtitle1: { fontSize: '1rem', fontWeight: 400 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
    body1: { fontSize: '1rem', fontWeight: 400 },
    body2: { fontSize: '0.875rem', fontWeight: 400 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: {
    borderRadius: 8,
    customBorderRadius: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 20,
      xl: 24,
    },
  },
  customShadows: {
    z1: '0px 2px 10px rgba(0,0,0,0.05)',
    z8: '0px 8px 10px rgba(0,0,0,0.08)',
    z16: '0px 16px 10px rgba(0,0,0,0.1)',
    z20: '0px 20px 10px rgba(0,0,0,0.1)',
    z24: '0px 24px 10px rgba(0,0,0,0.1)',
    xs: '0px 2px 4px rgba(0,0,0,0.02)',
    sm: '0px 4px 8px rgba(0,0,0,0.05)',
    md: '0px 8px 16px rgba(0,0,0,0.08)',
    lg: '0px 16px 24px rgba(0,0,0,0.1)',
    xl: '0px 24px 32px rgba(0,0,0,0.1)',
    primary: `0px 4px 10px ${alpha(lightPrimary[500], 0.2)}`,
    secondary: `0px 4px 10px ${alpha(lightSecondary.main, 0.2)}`,
    error: `0px 4px 10px ${alpha(functional.error.main, 0.2)}`,
    warning: `0px 4px 10px ${alpha(functional.warning.main, 0.2)}`,
    info: `0px 4px 10px ${alpha(functional.info.main, 0.2)}`,
    success: `0px 4px 10px ${alpha(functional.success.main, 0.2)}`,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: lightSurface[300],
          color: '#1A1A1A',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 1px 3px rgba(0,0,0,0.05)',
          color: '#1A1A1A',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
      variants: [
        {
          props: { variant: 'contained' },
          style: {
            backgroundColor: lightPrimary[500],
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: lightPrimary[600],
            },
          },
        },
        {
          props: { variant: 'tonal' },
          style: {
            backgroundColor: alpha(lightPrimary[500], 0.1),
            color: lightPrimary[500],
            '&:hover': {
              backgroundColor: alpha(lightPrimary[500], 0.2),
            },
          },
        },
      ],
    },
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
        },
      },
      variants: [
        {
          props: { variant: 'tonal' },
          style: {
            '& .MuiButtonGroup-grouped': {
              backgroundColor: alpha(lightPrimary[500], 0.1),
              color: lightPrimary[500],
              borderColor: alpha(lightPrimary[500], 0.2),
              '&:hover': {
                backgroundColor: alpha(lightPrimary[500], 0.2),
              },
            },
          },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0px 2px 12px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
      variants: [
        {
          props: { variant: 'tonal' },
          style: {
            backgroundColor: alpha(lightPrimary[500], 0.1),
            color: lightPrimary[500],
            '&:hover': {
              backgroundColor: alpha(lightPrimary[500], 0.2),
            },
          },
        },
      ],
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 0,
            margin: 2,
            transitionDuration: '300ms',
            '&.Mui-checked': {
              transform: 'translateX(16px)',
              color: '#fff',
              '& + .MuiSwitch-track': {
                backgroundColor: lightPrimary[500],
                opacity: 1,
                border: 0,
              },
            },
          },
          '& .MuiSwitch-thumb': {
            boxSizing: 'border-box',
            width: 22,
            height: 22,
          },
          '& .MuiSwitch-track': {
            borderRadius: 26 / 2,
            backgroundColor: lightSurface[600],
            opacity: 1,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
        },
        standardError: {
          backgroundColor: alpha(functional.error.main, 0.08),
          color: functional.error.dark,
          '& .MuiAlert-icon': { color: functional.error.main },
        },
        standardWarning: {
          backgroundColor: alpha(functional.warning.main, 0.08),
          color: functional.warning.dark,
          '& .MuiAlert-icon': { color: functional.warning.main },
        },
        standardInfo: {
          backgroundColor: alpha(functional.info.main, 0.08),
          color: functional.info.dark,
          '& .MuiAlert-icon': { color: functional.info.main },
        },
        standardSuccess: {
          backgroundColor: alpha(functional.success.main, 0.08),
          color: functional.success.dark,
          '& .MuiAlert-icon': { color: functional.success.main },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 48,
        },
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          backgroundColor: lightPrimary[500],
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9375rem',
          minWidth: 70,
          padding: '12px 16px',
          color: lightSurfaceMixed[500],
          '&.Mui-selected': {
            color: lightPrimary[500],
            backgroundColor: alpha(lightPrimary[500], 0.05),
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: alpha(lightPrimary[500], 0.1),
          color: lightPrimary[500],
          fontWeight: 600,
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: '8px',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 12px',
          '&.Mui-selected': {
            backgroundColor: alpha(lightPrimary[500], 0.08),
            color: lightPrimary[500],
            '&:hover': {
              backgroundColor: alpha(lightPrimary[500], 0.12),
            },
            '& .MuiListItemIcon-root': {
              color: lightPrimary[500],
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1A1A1A',
          color: '#FFFFFF',
          borderRadius: 6,
          fontSize: '0.75rem',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: alpha(lightSurfaceMixed[600], 0.08),
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0px 24px 48px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0px 8px 16px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          '&.Mui-checked': {
            color: lightPrimary[500],
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&:before': { display: 'none' },
          '&.Mui-expanded': { margin: '8px 0' },
          boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
          border: `1px solid ${alpha(lightSurfaceMixed[600], 0.08)}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: `1px solid ${alpha(lightSurfaceMixed[600], 0.08)}`,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0px 8px 24px rgba(0,0,0,0.08)',
          padding: '4px',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(lightSurface[300], 1),
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: '#1A1A1A',
          fontWeight: 700,
          borderBottom: `1px solid ${alpha(lightSurfaceMixed[600], 0.1)}`,
        },
        root: {
          padding: '16px',
          borderColor: alpha(lightSurfaceMixed[600], 0.05),
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td, &:last-child th': { border: 0 },
          '&.Mui-selected': {
            backgroundColor: alpha(lightPrimary[500], 0.04),
            '&:hover': {
              backgroundColor: alpha(lightPrimary[500], 0.08),
            },
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        gutterBottom: {
          marginBottom: '0.75em',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(lightSurfaceMixed[600], 0.08),
          borderRadius: 8,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: lightPrimary[500],
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: alpha(lightPrimary[500], 0.1),
        },
        bar: {
          borderRadius: 4,
          backgroundColor: lightPrimary[500],
        },
      },
    },
    MuiRating: {
      styleOverrides: {
        iconFilled: {
          color: lightPrimary[500],
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: lightPrimary[500],
        },
        thumb: {
          backgroundColor: '#FFFFFF',
          border: `2px solid ${lightPrimary[500]}`,
          '&:hover, &.Mui-focusVisible': {
            boxShadow: `0px 0px 0px 8px ${alpha(lightPrimary[500], 0.16)}`,
          },
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiSnackbarContent-root': {
            backgroundColor: '#1A1A1A',
            color: '#FFFFFF',
            borderRadius: 12,
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPaginationItem-root': {
            borderRadius: 8,
            '&.Mui-selected': {
              backgroundColor: lightPrimary[500],
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: lightPrimary[600],
              },
            },
          },
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        separator: {
          color: alpha(lightSurfaceMixed[600], 0.3),
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderTop: `1px solid ${alpha(lightSurfaceMixed[600], 0.08)}`,
        },
      },
    },
    MuiSpeedDial: {
      styleOverrides: {
        fab: {
          backgroundColor: lightPrimary[500],
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: lightPrimary[600],
          },
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiImageList: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'hidden',
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          '& .MuiBackdrop-root': {
            backgroundColor: alpha('#1A1A1A', 0.5),
          },
        },
      },
    },
  },
})

export default lightTheme
