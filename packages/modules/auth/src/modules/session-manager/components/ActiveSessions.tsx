import {
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Typography,
  Chip,
  Box,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete';
import DevicesIcon from '@mui/icons-material/Devices';
import { useTranslation } from 'react-i18next'
import { useSessions, useRevokeSession, useRevokeAllSessions } from "@idaas/authentication-core/hooks/useAuthQuery"

export function ActiveSessions() {
  const { t } = useTranslation()
  const { data, isLoading } = useSessions()
  const revokeSessionMutation = useRevokeSession()
  const revokeAllMutation = useRevokeAllSessions()

  if (isLoading) return null

  const handleRevokeSession = (sessionId: string) => {
    if (confirm(t('auth.active_sessions.confirm_end_session'))) {
      revokeSessionMutation.mutate(sessionId, {
        onSuccess: () => alert(t('auth.active_sessions.success_end_session')),
      })
    }
  }

  const handleRevokeAll = () => {
    if (confirm(t('auth.active_sessions.confirm_end_all'))) {
      revokeAllMutation.mutate(undefined, {
        onSuccess: () => alert(t('auth.active_sessions.success_end_all')),
      })
    }
  }

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ padding: { xs: 3, sm: 4 } }}>
        <Box
          display='flex'
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent='space-between'
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2}
          mb={4}
        >
          <Typography variant='h6' sx={{ fontWeight: 700 }}>
            {t('auth.active_sessions.title')}
          </Typography>
          <Button
            variant='outlined'
            color='error'
            size='small'
            onClick={handleRevokeAll}
            disabled={!data?.data.sessions || data.data.sessions.length <= 1}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            {t('auth.active_sessions.button_end_all')}
          </Button>
        </Box>

        <List disablePadding>
          {data?.data.sessions.map((session: any, index: number) => (
            <ListItem
              key={session.id}
              divider={index !== (data?.data.sessions.length || 0) - 1}
              sx={{ py: 2, px: 0 }}
              secondaryAction={
                !session.current && (
                  <IconButton
                    edge='end'
                    onClick={() => handleRevokeSession(session.id)}
                    color='error'
                    size='small'
                  >
                    <DeleteIcon fontSize='small' />
                  </IconButton>
                )
              }
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  backgroundColor: 'primary.light',
                  opacity: 0.8,
                  mr: 2,
                }}
              >
                <DevicesIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              </Box>
              <ListItemText
                primary={
                  <Box display='flex' alignItems='center' gap={1}>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      {session.device_name}
                    </Typography>
                    {session.current && (
                      <Chip
                        label={t('auth.active_sessions.device_current')}
                        size='small'
                        color='primary'
                        sx={{ height: 20, fontSize: '0.75rem', fontWeight: 600 }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Typography variant='body2' color='text.secondary'>
                    {session.ip_address} {' Â· '}
                    {t('auth.active_sessions.last_active', {
                      date: new Date(session.last_activity).toLocaleString(),
                    })}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}



