import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Avatar,
  Chip,
  Stack,
  Divider,
  alpha,
  useTheme,
} from '@mui/material'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Groups from '@mui/icons-material/Groups'
import BadgeOutlined from '@mui/icons-material/BadgeOutlined'
import AlternateEmail from '@mui/icons-material/AlternateEmail'
import TimerOutlined from '@mui/icons-material/TimerOutlined'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import BlockOutlined from '@mui/icons-material/BlockOutlined'
import Close from '@mui/icons-material/Close'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../../authorization-engine/services/adminService'
import { Path } from '../../../../routes/path'
import { useAppStore } from '@cap/platform-core'
import {
  AuthPageLayout,
  AuthCard,
  AuthCardHeader,
  AuthOutcomeScreen,
  type AuthTone,
} from '../../components/shared/auth'

interface InvitationDetails {
  id: number
  email: string
  role: string
  status: string
  expiresAt: string
  organization: { id: number; name: string; slug: string }
}

type PageState =
  | 'loading'
  | 'ready'
  | 'accepting'
  | 'declining'
  | 'accepted'
  | 'declined'
  | 'error'
  | 'expired'
  | 'already_used'

export default function JoinOrganization() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const hasRequiredParams = useMemo(() => Boolean(token && email), [token, email])
  const [state, setState] = useState<PageState>(() => (hasRequiredParams ? 'loading' : 'error'))
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  // Server-supplied detail. Kept separate from the translated headline so an
  // untranslated backend string never replaces the localised title.
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!token || !email) return
    const fetchDetails = async () => {
      try {
        const res = await adminService.getInvitationDetails(token, email)
        if (res.status >= 200 && res.status < 300) {
          setInvitation(res.data)
          setState('ready')
        } else {
          const data = res.data as any
          if (data?.status === 'expired') setState('expired')
          else if (data?.status === 'accepted' || data?.status === 'revoked') {
            setState('already_used')
            setErrorMessage(data?.message || '')
          } else {
            setState('error')
            setErrorMessage(data?.message || '')
          }
        }
      } catch {
        setState('error')
        setErrorMessage('')
      }
    }
    fetchDetails()
  }, [token, email])

  const handleAccept = useCallback(async () => {
    if (!token || !email) return
    setState('accepting')
    try {
      const res = await adminService.acceptInvitation(token, email)
      if (res.status >= 200 && res.status < 300) {
        setState('accepted')
        if (invitation?.organization) {
          try {
            useAppStore
              .getState()
              .switchTenant(invitation.organization.slug || invitation.organization.id)
          } catch {
            // Tenant switch is a convenience; the membership is already saved.
          }
        }
      } else {
        const data = res.data as any
        setState('error')
        setErrorMessage(data?.message || '')
      }
    } catch {
      setState('error')
      setErrorMessage('')
    }
  }, [token, email, invitation])

  const handleDecline = useCallback(async () => {
    if (!token || !email) return
    setState('declining')
    try {
      const res = await adminService.declineInvitation(token, email)
      if (res.status >= 200 && res.status < 300) setState('declined')
      else {
        const data = res.data as any
        setState('error')
        setErrorMessage(data?.message || '')
      }
    } catch {
      setState('error')
      setErrorMessage('')
    }
  }, [token, email])

  const primaryCta = (label: string, onClick: () => void) => (
    <Button
      fullWidth
      variant='contained'
      size='large'
      onClick={onClick}
      endIcon={<ArrowForward />}
      sx={{
        minHeight: 48,
        borderRadius: 3,
        fontWeight: 800,
        fontSize: '1rem',
        textTransform: 'none',
      }}
    >
      {label}
    </Button>
  )

  const outcome = (
    tone: AuthTone,
    icon: React.ReactNode,
    title: string,
    description: string,
    actions?: React.ReactNode,
    children?: React.ReactNode,
  ) => (
    <AuthOutcomeScreen
      tone={tone}
      icon={icon}
      title={title}
      description={description}
      actions={actions}
    >
      {children}
    </AuthOutcomeScreen>
  )

  if (state === 'loading') {
    return outcome(
      'primary',
      <Groups sx={{ fontSize: 36 }} />,
      t('organization.loadingTitle', 'Loading invitation…'),
      t(
        'organization.loadingDescription',
        'Please wait while we retrieve your invitation details.',
      ),
      undefined,
      <Box role='status' aria-live='polite' sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>,
    )
  }

  if (state === 'error') {
    return outcome(
      'error',
      <ErrorOutline sx={{ fontSize: 36 }} />,
      t('organization.errorTitle', 'Something went wrong'),
      errorMessage ||
        t('organization.errorDescription', 'We could not load this invitation. Please try again.'),
      primaryCta(t('organization.goToLogin', 'Go to Login'), () => navigate(Path.auth.signin)),
    )
  }

  if (state === 'expired') {
    return outcome(
      'warning',
      <TimerOutlined sx={{ fontSize: 36 }} />,
      t('organization.expiredTitle', 'Invitation Expired'),
      t(
        'organization.expiredDescription',
        'This invitation has expired. Please contact the organization administrator.',
      ),
      primaryCta(t('organization.goToLogin', 'Go to Login'), () => navigate(Path.auth.signin)),
    )
  }

  if (state === 'already_used') {
    return outcome(
      'info',
      <BlockOutlined sx={{ fontSize: 36 }} />,
      t('organization.alreadyUsedTitle', 'Invitation No Longer Valid'),
      errorMessage ||
        t(
          'organization.alreadyUsedDescription',
          'This invitation has already been used or was revoked.',
        ),
      primaryCta(t('organization.goToDashboard', 'Go to Dashboard'), () => navigate('/dashboard')),
    )
  }

  if (state === 'accepted') {
    return outcome(
      'success',
      <CheckCircle sx={{ fontSize: 36 }} />,
      t('organization.acceptedTitle', {
        organization: invitation?.organization.name || '',
        defaultValue: 'Welcome to {{organization}}!',
      }),
      t('organization.acceptedDescription', {
        role: invitation?.role || '',
        defaultValue: 'You have successfully joined as a {{role}}.',
      }),
      primaryCta(t('organization.goToDashboard', 'Go to Dashboard'), () => navigate('/dashboard')),
    )
  }

  if (state === 'declined') {
    return outcome(
      'info',
      <Close sx={{ fontSize: 36 }} />,
      t('organization.declinedTitle', 'Invitation Declined'),
      t('organization.declinedDescription', {
        organization: invitation?.organization.name || '',
        defaultValue: 'You have declined the invitation to join {{organization}}.',
      }),
      primaryCta(t('organization.goToLogin', 'Go to Login'), () => navigate(Path.auth.signin)),
    )
  }

  // --- Ready / in-flight: the invitation itself ---------------------------
  const organizationName = invitation?.organization.name || ''
  const organizationInitial = organizationName.trim().charAt(0).toUpperCase()
  const isBusy = state === 'accepting' || state === 'declining'

  const detailRows = [
    {
      key: 'organization',
      icon: <Groups sx={{ fontSize: 22 }} />,
      label: t('organization.organization', 'Organization'),
      value: organizationName,
      color: theme.palette.primary.main,
    },
    {
      key: 'role',
      icon: <BadgeOutlined sx={{ fontSize: 22 }} />,
      label: t('organization.assignedRole', 'Assigned Role'),
      value: invitation?.role,
      color: theme.palette.success.main,
    },
    {
      key: 'email',
      icon: <AlternateEmail sx={{ fontSize: 22 }} />,
      label: t('organization.invitedEmail', 'Invited Email'),
      value: invitation?.email,
      color: theme.palette.info.main,
    },
  ]

  return (
    <AuthPageLayout maxWidth={480}>
      <AuthCard padding='standard'>
        {/* Organization identity banner — the invitation is from a specific
            tenant, so it leads with that tenant rather than a generic icon. */}
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                borderRadius: '24px',
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main',
                border: '2px solid',
                borderColor: alpha(theme.palette.primary.main, 0.24),
                fontWeight: 900,
                fontSize: '1.75rem',
              }}
            >
              {organizationInitial || <Groups sx={{ fontSize: 32 }} />}
            </Avatar>
          </Box>

          <AuthCardHeader
            title={t('organization.youreInvited', "You're Invited!")}
            subtitle={
              organizationName
                ? t('organization.invitedToJoinNamed', {
                    organization: organizationName,
                    defaultValue: 'You have been invited to join {{organization}}.',
                  })
                : t('organization.invitedToJoin', 'You have been invited to join an organization.')
            }
          />

          {invitation?.role && (
            <Chip
              icon={<BadgeOutlined />}
              label={invitation.role}
              sx={{
                mb: 3,
                fontWeight: 800,
                borderRadius: 2,
                color: 'success.main',
                bgcolor: alpha(theme.palette.success.main, 0.1),
                border: '1px solid',
                borderColor: alpha(theme.palette.success.main, 0.28),
                '& .MuiChip-icon': { color: 'success.main' },
              }}
            />
          )}
        </Box>

        <Stack spacing={2} sx={{ mb: 3 }}>
          {detailRows.map(({ key, icon, label, value, color }) => (
            <Box
              key={key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(color, 0.04),
                border: '1px solid',
                borderColor: alpha(color, 0.12),
              }}
            >
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: alpha(color, 0.1),
                  color,
                  borderRadius: '12px',
                }}
              >
                {icon}
              </Avatar>
              <Box sx={{ minInlineSize: 0 }}>
                <Typography
                  variant='caption'
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.7rem',
                  }}
                >
                  {label}
                </Typography>
                <Typography variant='body1' sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
                  {value}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>

        <Divider sx={{ mb: 3, opacity: 0.5 }} />

        <Stack spacing={1.5}>
          <Button
            fullWidth
            variant='contained'
            size='large'
            onClick={handleAccept}
            disabled={isBusy}
            startIcon={
              state === 'accepting' ? (
                <CircularProgress size={18} color='inherit' />
              ) : (
                <CheckCircle />
              )
            }
            sx={{
              minHeight: 48,
              borderRadius: 3,
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
            }}
          >
            {state === 'accepting'
              ? t('organization.joining', 'Joining...')
              : t('organization.acceptJoin', 'Accept & Join Organization')}
          </Button>
          <Button
            fullWidth
            variant='text'
            size='large'
            onClick={handleDecline}
            disabled={isBusy}
            sx={{
              minHeight: 48,
              borderRadius: 3,
              fontWeight: 600,
              color: 'text.secondary',
              textTransform: 'none',
              '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.04) },
            }}
          >
            {state === 'declining'
              ? t('organization.declining', 'Declining...')
              : t('organization.declineInvitation', 'Decline Invitation')}
          </Button>
        </Stack>

        <Typography
          variant='caption'
          sx={{
            display: 'block',
            mt: 3,
            color: 'text.secondary',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          {t(
            'organization.agreeNote',
            "By accepting, you agree to the organization's policies. If you didn't expect this, you can safely decline.",
          )}
        </Typography>
      </AuthCard>
    </AuthPageLayout>
  )
}
