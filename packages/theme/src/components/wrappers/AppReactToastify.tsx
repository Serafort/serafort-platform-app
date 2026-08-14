import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import type { BoxProps } from '@mui/material/Box'

import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import type { ToastContainerProps } from 'react-toastify'
import type { Skin } from '@cap/shared-types'
import { useThemeSettings } from '../../context/ThemeSettingsContext'

type Props = ToastContainerProps & {
  boxProps?: BoxProps
}

const ToastifyWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'ownerSkin',
})<BoxProps & { ownerSkin: Skin }>(({ theme, ownerSkin }) => {
  return {
    '& .Toastify__toast': {
      minBlockSize: 46,
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(1.5, 2.5),
      backgroundColor: theme.palette.background.paper,
      boxShadow: ownerSkin === 'bordered' ? 'none' : ((theme as any).customShadows?.md || theme.shadows[6]),
      border: ownerSkin === 'bordered' ? `1px solid ${theme.palette.divider}` : 'none',
      '&:not(.custom-toast)': {
        '& .Toastify__toast-body': {
          color: theme.palette.text.primary,
        },
        '&.Toastify__toast--success': {
          '& .Toastify__toast-icon svg': {
            fill: theme.palette.success.main,
          },
        },
        '&.Toastify__toast--error': {
          '& .Toastify__toast-icon svg': {
            fill: theme.palette.error.main,
          },
        },
        '&.Toastify__toast--warning': {
          '& .Toastify__toast-icon svg': {
            fill: theme.palette.warning.main,
          },
        },
        '&.Toastify__toast--info': {
          '& .Toastify__toast-icon svg': {
            fill: theme.palette.info.main,
          },
        },
      },
    },
    '& .Toastify__toast-body': {
      margin: 0,
      lineHeight: 1.46667,
      fontSize: theme.typography.body1.fontSize,
    },
    '& .Toastify__toast-icon': {
      marginRight: theme.spacing(3),
      height: 20,
      width: 20,
      '& .Toastify__spinner': {
        margin: 3,
        height: 14,
        width: 14,
      },
    },
    '& .Toastify__close-button': {
      color: theme.palette.text.primary,
    },
  }
})

const AppReactToastify = (props: Props) => {
  const { boxProps, ...rest } = props
  const settings = useThemeSettings()

  return (
    <ToastifyWrapper ownerSkin={settings.skin} {...boxProps}>
      <ToastContainer {...rest} />
    </ToastifyWrapper>
  )
}

export default AppReactToastify
