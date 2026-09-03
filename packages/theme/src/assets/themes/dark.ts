import { createTheme, alpha } from '@mui/material/styles';

import { primary, surface, surfaceMixed } from './palette/index';
import { colors as functional } from './palette/functional';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: primary,
    secondary: functional.secondary,
    error: functional.error,
    warning: functional.warning,
    info: functional.info,
    success: functional.success,
    surface: surface,
    surfaceMixed: surfaceMixed,
    divider: primary[600],
    action: {
      hover: alpha(primary[600], 0.08),
      selected: alpha(primary[600], 0.16),
      disabled: alpha(primary[600], 0.3),
      disabledBackground: alpha(primary[600], 0.12),
      focus: alpha(primary[600], 0.12),
    },
    background: {
      default: surface[300],
      paper: surface[200],
    },
    text: {
      primary: primary[600],
      secondary: surfaceMixed[500],
      disabled: alpha(primary[600], 0.5),
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
    z1: '0px 2px 10px rgba(0,0,0,0.1)',
    z8: '0px 8px 10px rgba(0,0,0,0.1)',
    z16: '0px 16px 10px rgba(0,0,0,0.1)',
    z20: '0px 20px 10px rgba(0,0,0,0.1)',
    z24: '0px 24px 10px rgba(0,0,0,0.1)',
    xs: '0px 2px 4px rgba(0,0,0,0.05)',
    sm: '0px 4px 8px rgba(0,0,0,0.1)',
    md: '0px 8px 16px rgba(0,0,0,0.1)',
    lg: '0px 16px 24px rgba(0,0,0,0.1)',
    xl: '0px 24px 32px rgba(0,0,0,0.1)',
    primary: `0px 4px 10px ${alpha(primary[500], 0.2)}`,
    secondary: `0px 4px 10px ${alpha(functional.secondary.main, 0.2)}`,
    error: `0px 4px 10px ${alpha(functional.error.main, 0.2)}`,
    warning: `0px 4px 10px ${alpha(functional.warning.main, 0.2)}`,
    info: `0px 4px 10px ${alpha(functional.info.main, 0.2)}`,
    success: `0px 4px 10px ${alpha(functional.success.main, 0.2)}`,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: surface[300],
          color: primary[600],
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: surface[300],
          boxShadow: 'none',
          borderBottom: `1px solid ${alpha(primary[600], 0.1)}`,
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
            backgroundColor: primary[500],
            '&:hover': {
              backgroundColor: primary[600],
            },
          },
        },
        {
          props: { variant: 'tonal' },
          style: {
            backgroundColor: alpha(primary[500], 0.12),
            color: primary[500],
            '&:hover': {
              backgroundColor: alpha(primary[500], 0.24),
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
              backgroundColor: alpha(primary[500], 0.12),
              color: primary[500],
              borderColor: alpha(primary[500], 0.2),
              '&:hover': {
                backgroundColor: alpha(primary[500], 0.24),
              },
            },
          },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: surface[200],
          borderRadius: 16,
          boxShadow: '0px 2px 10px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: surface[200],
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
            backgroundColor: alpha(primary[500], 0.12),
            color: primary[500],
            '&:hover': {
              backgroundColor: alpha(primary[500], 0.24),
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
                backgroundColor: primary[500],
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
            backgroundColor: surface[500],
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
          backgroundColor: alpha(functional.error.main, 0.1),
          color: functional.error.main,
          '& .MuiAlert-icon': { color: functional.error.main },
        },
        standardWarning: {
          backgroundColor: alpha(functional.warning.main, 0.1),
          color: functional.warning.main,
          '& .MuiAlert-icon': { color: functional.warning.main },
        },
        standardInfo: {
          backgroundColor: alpha(functional.info.main, 0.1),
          color: functional.info.main,
          '& .MuiAlert-icon': { color: functional.info.main },
        },
        standardSuccess: {
          backgroundColor: alpha(functional.success.main, 0.1),
          color: functional.success.main,
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
          backgroundColor: primary[500],
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
          color: surfaceMixed[500],
          '&.Mui-selected': {
            color: primary[500],
            backgroundColor: alpha(primary[500], 0.08),
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: alpha(primary[500], 0.1),
          color: primary[500],
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
            backgroundColor: alpha(primary[500], 0.08),
            color: primary[500],
            '&:hover': {
              backgroundColor: alpha(primary[500], 0.12),
            },
            '& .MuiListItemIcon-root': {
              color: primary[500],
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
          backgroundColor: surfaceMixed[600],
          borderRadius: 6,
          fontSize: '0.75rem',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: alpha(primary[600], 0.1),
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0px 24px 48px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0px 8px 16px rgba(0,0,0,0.1)',
        },
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          '&.Mui-checked': {
            color: primary[500],
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 10px rgba(0,0,0,0.15)',
          '&:hover': {
            boxShadow: '0px 6px 14px rgba(0,0,0,0.2)',
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
          boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: surface[300],
          borderRight: `1px solid ${alpha(primary[600], 0.1)}`,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0px 8px 24px rgba(0,0,0,0.1)',
          padding: '4px',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: surface[200],
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(primary[500], 0.05),
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: primary[600],
          fontWeight: 700,
          borderBottom: `1px solid ${alpha(primary[600], 0.1)}`,
        },
        root: {
          padding: '16px',
          borderColor: alpha(primary[600], 0.05),
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td, &:last-child th': { border: 0 },
          '&.Mui-selected': {
            backgroundColor: alpha(primary[500], 0.08),
            '&:hover': {
              backgroundColor: alpha(primary[500], 0.12),
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
          backgroundColor: alpha(primary[600], 0.08),
          borderRadius: 8,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: primary[500],
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: alpha(primary[500], 0.12),
        },
        bar: {
          borderRadius: 4,
          backgroundColor: primary[500],
        },
      },
    },
    MuiRating: {
      styleOverrides: {
        iconFilled: {
          color: primary[500],
        },
        iconHover: {
          color: primary[600],
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: primary[500],
        },
        thumb: {
          backgroundColor: '#fff',
          border: `2px solid ${primary[500]}`,
          '&:hover, &.Mui-focusVisible': {
            boxShadow: `0px 0px 0px 8px ${alpha(primary[500], 0.16)}`,
          },
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiSnackbarContent-root': {
            backgroundColor: surfaceMixed[600],
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
              backgroundColor: primary[500],
              color: '#fff',
              '&:hover': {
                backgroundColor: primary[600],
              },
            },
          },
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        separator: {
          color: alpha(primary[600], 0.3),
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: surface[300],
          borderTop: `1px solid ${alpha(primary[600], 0.1)}`,
        },
      },
    },
    MuiSpeedDial: {
      styleOverrides: {
        fab: {
          backgroundColor: primary[500],
          '&:hover': {
            backgroundColor: primary[600],
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#030327',
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
          boxShadow: '0px 4px 20px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          '& .MuiBackdrop-root': {
            backgroundColor: alpha(surfaceMixed[600], 0.7),
          },
        },
      },
    },
  },
})

export default darkTheme
