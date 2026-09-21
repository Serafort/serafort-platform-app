import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  Stack,
  alpha,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import CheckCircle from '@mui/icons-material/CheckCircle'
import ArrowForward from '@mui/icons-material/ArrowForward'
import Settings from '@mui/icons-material/Settings'
import SecurityIcon from '@mui/icons-material/Security'
import { useTranslation } from 'react-i18next'
import {
  AuthCard,
  AuthCardHeader,
  AuthActionButton,
} from '../../../components/shared/auth'

interface RegistrationSuccessProps {
  userName?: string
  redirectPath?: string
}

export default function RegistrationSuccess({
  userName,
  redirectPath = '/dashboard',
}: RegistrationSuccessProps) {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()

  const handleGoToDashboard = useCallback(() => navigate(redirectPath), [navigate, redirectPath])
  const handleCompleteLater = useCallback(() => navigate('/profile/settings'), [navigate])

  return (
    <Box sx={{ width: '100%' }}>
      <AuthCard padding='comfortable'>
        <AuthCardHeader
          icon={<CheckCircle sx={{ fontSize: 32 }} />}
          tone='success'
          title={t('success.registrationHeading', 'Welcome aboard!')}
          subtitle={
            userName
              ? t('success.welcomeMessage', {
                  name: userName,
                  defaultValue: `Welcome, ${userName}! Your account is ready.`,
                })
              : t(
                  'success.genericSuccessMessage',
                  'Your workspace account has been created successfully.',
                )
          }
        />

        {/* Onboarding Checklist — Peak-End Rule clarity */}
        <Box
          sx={{
            bgcolor: 'var(--sf-surface-sunken, rgba(0, 0, 0, 0.04))',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 'var(--sf-radius-lg, 12px)',
            p: 2,
            mb: 3.5,
            textAlign: 'left',
          }}
        >
          <Typography
            variant='caption'
            sx={{
              fontWeight: 800,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              display: 'block',
              mb: 1,
            }}
          >
            {t('success.checklistHeading', 'Workspace Ready:')}
          </Typography>
          <List dense disablePadding>
            <ListItem disableGutters sx={{ py: 0.25 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CheckCircle color='success' sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText
                primary={t(
                  'success.checklistCredentials',
                  'Identity & session credentials verified',
                )}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              />
            </ListItem>
            <ListItem disableGutters sx={{ py: 0.25 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CheckCircle color='success' sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText
                primary={t(
                  'success.checklistPermissions',
                  'Default tenant permissions configured',
                )}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              />
            </ListItem>
            <ListItem disableGutters sx={{ py: 0.25 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <SecurityIcon color='primary' sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText
                primary={t(
                  'success.checklistTelemetry',
                  'Zero-trust audit telemetry enabled',
                )}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              />
            </ListItem>
          </List>
        </Box>

        <Stack spacing={2}>
          <AuthActionButton
            fullWidth
            onClick={handleGoToDashboard}
            endIcon={<ArrowForward />}
            label={t('success.goToDashboard', 'Enter Workspace Console')}
          />
          <Button
            fullWidth
            variant='outlined'
            onClick={handleCompleteLater}
            startIcon={<Settings sx={{ fontSize: 18 }} />}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 700,
              textTransform: 'none',
              color: 'text.primary',
              borderColor: 'divider',
              '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) },
            }}
          >
            {t('success.completeProfileLater', 'Account & Security Settings')}
          </Button>
        </Stack>

        <Typography
          variant='caption'
          sx={{ mt: 3, display: 'block', color: 'text.disabled', textAlign: 'center' }}
        >
          {t('success.footerNote', 'You can customize roles and tenant settings anytime.')}
        </Typography>
      </AuthCard>
    </Box>
  )
}
