import type { Theme } from '@mui/material/styles'
import type { Skin } from '@cap/shared-types'

const card = (skin: Skin): Theme['components'] => {
  return {
    MuiCard: {
      defaultProps: {
        ...(skin === 'bordered' && {
          variant: 'outlined',
        }),
      },
      styleOverrides: {
        root: ({ ownerState }) => ({
          borderRadius: 'var(--comp-card-border-radius, 12px)',
          backgroundColor: 'var(--effect-bg, var(--mui-palette-background-paper))',
          backdropFilter: 'var(--effect-backdrop, none)',
          ...(ownerState.variant !== 'outlined' && {
            boxShadow: 'var(--effect-shadow, var(--comp-card-box-shadow, var(--mui-customShadows-md)))',
          }),
        }),
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: ({ theme: _theme }) => ({
          padding: 'var(--comp-card-padding, var(--mui-spacing-6, 24px))',
          '& + .MuiCardContent-root, & + .MuiCardActions-root': {
            paddingBlockStart: 0,
          },
          '& + .MuiCollapse-root .MuiCardContent-root:first-of-type, & + .MuiCollapse-root .MuiCardActions-root:first-of-type':
            {
              paddingBlockStart: 0,
            },
        }),
        subheader: ({ theme }) => ({
          ...theme.typography.subtitle1,
          color: 'rgb(var(--mui-palette-text-primaryChannel) / 0.55)',
        }),
        action: ({ theme }) => ({
          ...theme.typography.body1,
          color: 'var(--mui-palette-text-disabled)',
          marginBlock: 0,
          marginInlineEnd: 0,
          '& .MuiIconButton-root': {
            color: 'inherit',
          },
        }),
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: ({ theme: _theme }) => ({
          padding: 'var(--comp-card-padding, var(--mui-spacing-6, 24px))',
          color: 'var(--mui-palette-text-secondary)',
          '&:last-child': {
            paddingBlockEnd: 'var(--comp-card-padding, var(--mui-spacing-6, 24px))',
          },
          '& + .MuiCardHeader-root, & + .MuiCardContent-root, & + .MuiCardActions-root': {
            paddingBlockStart: 0,
          },
          '& + .MuiCollapse-root .MuiCardHeader-root:first-of-type, & + .MuiCollapse-root .MuiCardContent-root:first-of-type, & + .MuiCollapse-root .MuiCardActions-root:first-of-type':
            {
              paddingBlockStart: 0,
            },
          '& > .MuiTabPanel-root': {
            paddingInline: 0,
            paddingBlockEnd: 0,
            '&:first-of-type': {
              paddingBlockStart: 0,
              '& ~ .MuiTabPanel-root': {
                paddingBlockStart: 0,
              },
            },
          },
        }),
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: 'var(--comp-card-padding, var(--mui-spacing-6, 24px))',
          '&:where(.card-actions-dense)': {
            padding: 'var(--comp-card-padding-dense, var(--mui-spacing-3, 12px))',
            '& .MuiButton-text': {
              paddingInline: theme.spacing(3),
            },
          },
          '& + .MuiCardHeader-root, & + .MuiCardContent-root, & + .MuiCardActions-root': {
            paddingBlockStart: 0,
          },
          '& + .MuiCollapse-root .MuiCardHeader-root:first-of-type, & + .MuiCollapse-root .MuiCardContent-root:first-of-type, & + .MuiCollapse-root .MuiCardActions-root:first-of-type':
            {
              paddingBlockStart: 0,
            },
        }),
      },
    },
  }
}

export default card
