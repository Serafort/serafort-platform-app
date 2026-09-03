// MUI Imports
import type { Theme } from '@mui/material/styles'
import type {} from '@mui/lab/themeAugmentation'

const timeline: Theme['components'] = {
  MuiTimeline: {
    styleOverrides: {
      root: {
        padding: 0,
      },
    },
  },
  MuiTimelineDot: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        margin: theme.spacing(3, 0),
        boxShadow: 'none',
        '&:has(> i), &:has(> svg)': {
          padding: 6,
        },
        '& > svg, & > i': {
          fontSize: '1.25rem',
        },
        '&:has(svg)': {
          width: 32,
          height: 32,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    },
    variants: [
      {
        props: { variant: 'outlined' },
        style: {
          padding: 5,
          '& + .MuiTimelineConnector-root': {
            backgroundColor: 'transparent',
            borderInlineStart: '1px dashed var(--mui-palette-divider)',
          },
          '&:has(+ .MuiTimelineConnector-root)': {
            marginBlock: '0.625rem',
          },
        },
      },
      {
        props: { variant: 'filled', color: 'grey' },
        style: {
          boxShadow: '0 0 0 3px rgb(var(--mui-palette-action-activeChannel) / 0.04)',
        },
      },
      {
        props: { variant: 'filled', color: 'primary' },
        style: {
          boxShadow: '0 0 0 3px var(--mui-palette-primary-lightOpacity)',
        },
      },
      {
        props: { variant: 'filled', color: 'secondary' },
        style: {
          boxShadow: '0 0 0 3px var(--mui-palette-secondary-lightOpacity)',
        },
      },
      {
        props: { variant: 'filled', color: 'error' },
        style: {
          boxShadow: '0 0 0 3px var(--mui-palette-error-lightOpacity)',
        },
      },
      {
        props: { variant: 'filled', color: 'warning' },
        style: {
          boxShadow: '0 0 0 3px var(--mui-palette-warning-lightOpacity)',
        },
      },
      {
        props: { variant: 'filled', color: 'info' },
        style: {
          boxShadow: '0 0 0 3px var(--mui-palette-info-lightOpacity)',
        },
      },
      {
        props: { variant: 'filled', color: 'success' },
        style: {
          boxShadow: '0 0 0 3px var(--mui-palette-success-lightOpacity)',
        },
      },
      {
        props: { variant: 'filled', color: 'primary' },
        style: {
          backgroundColor: 'var(--mui-palette-primary-main)',
          color: 'var(--mui-palette-primary-contrastText)',
        },
      },
    ],
  },
  MuiTimelineConnector: {
    styleOverrides: {
      root: {
        width: 1,
        backgroundColor: 'var(--mui-palette-divider)',
      },
    },
  },
  MuiTimelineContent: {
    styleOverrides: {
      root: {
        paddingBottom: '1rem',
      },
    },
  },
}

export default timeline
