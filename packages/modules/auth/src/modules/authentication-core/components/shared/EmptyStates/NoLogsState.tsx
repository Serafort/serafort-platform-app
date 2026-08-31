
import { Box, Typography, Button, Stack, alpha, useTheme } from '@mui/material';
import HistoryToggleOff from '@mui/icons-material/HistoryToggleOff';
import Refresh from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';

interface NoLogsStateProps {
  title?: string
  description?: string
  onAction?: () => void
  actionLabel?: string
}

const NoLogsState = ({ title, description, onAction, actionLabel }: NoLogsStateProps) => {
  const { t } = useTranslation('auth')
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 6,
        textAlign: 'center',
        background: alpha(theme.palette.background.paper, 0.5),
        borderRadius: 4,
        border: '1px dashed',
        borderColor: 'divider',
        minHeight: 300,
      }}
    >
      <Stack spacing={2} alignItems='center'>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: alpha(theme.palette.background.paper, 0.3),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
          }}
        >
          <HistoryToggleOff sx={{ fontSize: 40, color: 'text.disabled' }} />
        </Box>

        <Box>
          <Typography variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {title || t('auth.common.noLogsTitle', 'No activity logs found')}
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', maxWidth: 300 }}>
            {description ||
              t(
                'auth.common.noLogsDesc',
                "We couldn't find any security events for the selected period.",
              )}
          </Typography>
        </Box>

        {onAction && (
          <Button
            startIcon={<Refresh />}
            variant='outlined'
            onClick={onAction}
            sx={{
              mt: 2,
              borderRadius: 2,
              color: 'text.secondary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'text.primary',
                background: alpha(theme.palette.action.hover, 0.5),
              },
            }}
          >
            {actionLabel || t('common.refresh', 'Refresh View')}
          </Button>
        )}
      </Stack>
    </Box>
  )
}

export default NoLogsState
