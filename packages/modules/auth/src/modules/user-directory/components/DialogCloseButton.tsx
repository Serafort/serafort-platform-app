import React from 'react'
import { IconButton, alpha, type IconButtonProps } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'

/**
 * The close affordance shared by every dialog and drawer in this module.
 *
 * One component instead of six hand-rolled `<IconButton size='small'>`s, so the
 * 44x44px touch target (Fitts), the accessible name and the visible keyboard
 * focus ring are decided in exactly one place.
 */
export default function DialogCloseButton(props: IconButtonProps) {
  const { t } = useTranslation('common')
  const { sx, ...rest } = props

  return (
    <IconButton
      aria-label={t('auth.common.close', 'Close')}
      {...rest}
      sx={[
        (theme) => ({
          width: 44,
          height: 44,
          color: 'text.secondary',
          transition: theme.transitions.create(['background-color', 'color'], {
            duration: theme.transitions.duration.shortest,
          }),
          '&:hover': {
            color: 'text.primary',
            bgcolor: alpha(theme.palette.text.primary, 0.06),
          },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <CloseIcon fontSize='small' />
    </IconButton>
  )
}
