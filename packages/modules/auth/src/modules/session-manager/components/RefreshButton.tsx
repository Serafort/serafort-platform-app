import { IconButton, Tooltip } from '@mui/material'
import Refresh from '@mui/icons-material/Refresh'
import { useTranslation } from 'react-i18next'

interface RefreshButtonProps {
  onRefresh: () => void
  isRefreshing?: boolean
  disabled?: boolean
}

/**
 * Header refresh control shared by the session screens: 44px touch target,
 * accessible name, visible focus ring, and a spin that honours
 * `prefers-reduced-motion`.
 */
export default function RefreshButton({
  onRefresh,
  isRefreshing = false,
  disabled = false,
}: RefreshButtonProps) {
  const { t } = useTranslation('auth')
  const label = t('auth.account.refresh', 'Refresh')

  return (
    <Tooltip title={label}>
      <span>
        <IconButton
          onClick={onRefresh}
          disabled={disabled}
          aria-label={label}
          sx={(theme) => ({
            width: 44,
            height: 44,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 'var(--sf-radius-md, 8px)',
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
            },
          })}
        >
          <Refresh
            sx={{
              animation: isRefreshing ? 'sfSpin 1s linear infinite' : 'none',
              '@keyframes sfSpin': { to: { transform: 'rotate(360deg)' } },
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          />
        </IconButton>
      </span>
    </Tooltip>
  )
}
