
import { Box, Typography, Button, Stack } from '@mui/material';
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 6,
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 4,
        border: '1px dashed rgba(255, 255, 255, 0.1)',
        minHeight: 300,
      }}
    >
      <Stack spacing={2} alignItems='center'>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
          }}
        >
          <HistoryToggleOff sx={{ fontSize: 40, color: 'rgba(255, 255, 255, 0.3)' }} />
        </Box>

        <Box>
          <Typography variant='h6' sx={{ color: 'white', fontWeight: 600 }}>
            {title || t('auth.common.noLogsTitle', 'No activity logs found')}
          </Typography>
          <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.5)', maxWidth: 300 }}>
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
              color: 'rgba(255, 255, 255, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                borderColor: 'white',
                background: 'rgba(255, 255, 255, 0.05)',
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
