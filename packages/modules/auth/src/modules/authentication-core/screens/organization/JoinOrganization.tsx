import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, CircularProgress, Avatar, Stack, Divider, alpha, useTheme } from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Groups from '@mui/icons-material/Groups';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import TimerOutlined from '@mui/icons-material/TimerOutlined';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import Close from '@mui/icons-material/Close';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { adminService } from '@auth/authorization-engine/services/adminService';

interface InvitationDetails {
  id: number; email: string; role: string; status: string; expiresAt: string
  organization: { id: number; name: string; slug: string }
}
type PageState = 'loading' | 'ready' | 'accepting' | 'declining' | 'accepted' | 'declined' | 'error' | 'expired' | 'already_used'

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
  const [errorMessage, setErrorMessage] = useState(() => hasRequiredParams ? '' : 'Invalid invitation link.')

  useEffect(() => {
    if (!token || !email) return
    const fetchDetails = async () => {
      try {
        const res = await adminService.getInvitationDetails(token, email)
        if (res.status >= 200 && res.status < 300) { setInvitation(res.data); setState('ready') }
        else {
          const data = res.data as any
          if (data?.status === 'expired') setState('expired')
          else if (data?.status === 'accepted' || data?.status === 'revoked') { setState('already_used'); setErrorMessage(data?.message || 'This invitation is no longer valid.') }
          else { setState('error'); setErrorMessage(data?.message || 'Could not load invitation details.') }
        }
      } catch { setState('error'); setErrorMessage('Failed to load invitation.') }
    }
    fetchDetails()
  }, [token, email])

  const handleAccept = useCallback(async () => {
    if (!token || !email) return
    setState('accepting')
    try {
      const res = await adminService.acceptInvitation(token, email)
      if (res.status >= 200 && res.status < 300) setState('accepted')
      else { const data = res.data as any; setState('error'); setErrorMessage(data?.message || 'Failed to accept invitation.') }
    } catch { setState('error'); setErrorMessage('Failed to accept invitation.') }
  }, [token, email])

  const handleDecline = useCallback(async () => {
    if (!token || !email) return
    setState('declining')
    try {
      const res = await adminService.declineInvitation(token, email)
      if (res.status >= 200 && res.status < 300) setState('declined')
      else { const data = res.data as any; setState('error'); setErrorMessage(data?.message || 'Failed to decline invitation.') }
    } catch { setState('error'); setErrorMessage('Failed to decline invitation.') }
  }, [token, email])

  const wrapBox = (icon: React.ReactNode, color: string, title: string, desc: string, btn: React.ReactNode) => (
    <Box
      className="animate-scale-in"
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{ width: '100%', maxWidth: 440, mx: 'auto', p: { xs: 3, md: 5 }, textAlign: 'center' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Avatar variant="square"
          sx={{ width: 56, height: 56, bgcolor: 'transparent', borderRadius: '24px', border: '2px solid', color, borderColor: alpha(color, 0.2) }}>
          {icon}
        </Avatar>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>{title}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 5, lineHeight: 1.6, maxWidth: 340, mx: 'auto' }}>{desc}</Typography>
      {btn}
    </Box>
  )

  const ctaBtn = (label: string, onClick: () => void) => (
    <Button fullWidth variant="contained" size="large" onClick={onClick} endIcon={<ArrowForward />}
      sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' } }}>
      {label}
    </Button>
  )

  if (state === 'loading') return wrapBox(<Groups sx={{ fontSize: 32 }} />, theme.palette.primary.main, 'Loading invitation...', 'Please wait while we retrieve your invitation details.', <CircularProgress />)
  if (state === 'error') return wrapBox(<ErrorOutline sx={{ fontSize: 32 }} />, theme.palette.error.main, 'Something went wrong', errorMessage, ctaBtn('Go to Login', () => navigate('/auth/login')))
  if (state === 'expired') return wrapBox(<TimerOutlined sx={{ fontSize: 32 }} />, theme.palette.warning.main, 'Invitation Expired', 'This invitation has expired. Please contact the organization administrator.', ctaBtn('Go to Login', () => navigate('/auth/login')))
  if (state === 'already_used') return wrapBox(<ErrorOutline sx={{ fontSize: 32 }} />, theme.palette.text.disabled, 'Invitation No Longer Valid', errorMessage, ctaBtn('Go to Dashboard', () => navigate('/dashboard')))
  if (state === 'accepted') return wrapBox(<CheckCircle sx={{ fontSize: 32 }} />, theme.palette.success.main, `Welcome to ${invitation?.organization.name}!`, `You have successfully joined as a ${invitation?.role}.`, ctaBtn('Go to Dashboard', () => navigate('/dashboard')))
  if (state === 'declined') return wrapBox(<Close sx={{ fontSize: 32 }} />, theme.palette.text.disabled, 'Invitation Declined', `You have declined the invitation to join ${invitation?.organization.name}.`, ctaBtn('Go to Login', () => navigate('/auth/login')))

  // Ready state â€” main invitation card
  return (
    <Box
      className="animate-scale-in"
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{ width: '100%', maxWidth: 480, mx: 'auto', p: { xs: 3, md: 5 } }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Avatar variant="square"
            sx={{ width: 56, height: 56, bgcolor: 'transparent', color: 'primary.main', borderRadius: '24px', border: '2px solid', borderColor: alpha(theme.palette.primary.main, 0.2) }}>
            <Groups sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
          {t('organization.youreInvited', "You're Invited!")}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          {t('organization.invitedToJoin', 'You have been invited to join an organization.')}
        </Typography>
      </Box>

      <Stack spacing={2} sx={{ mb: 4 }}>
        {[
          { icon: <Groups sx={{ fontSize: 22 }} />, label: t('organization.organization', 'Organization'), value: invitation?.organization.name, color: theme.palette.primary.main },
          { icon: <BadgeOutlined sx={{ fontSize: 22 }} />, label: t('organization.assignedRole', 'Assigned Role'), value: invitation?.role, color: theme.palette.success.main },
          { icon: <Box sx={{ fontSize: 18, fontWeight: 900 }}>@</Box>, label: t('organization.invitedEmail', 'Invited Email'), value: invitation?.email, color: theme.palette.info.main },
        ].map(({ icon, label, value, color }) => (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 3, bgcolor: alpha(color, 0.04), border: '1px solid', borderColor: alpha(color, 0.1) }}>
            <Avatar sx={{ width: 44, height: 44, bgcolor: alpha(color, 0.1), color, borderRadius: '12px' }}>{icon}</Avatar>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>{label}</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{value}</Typography>
            </Box>
          </Box>
        ))}
      </Stack>

      <Divider sx={{ mb: 3, opacity: 0.5 }} />

      <Stack spacing={1.5}>
        <Button fullWidth variant="contained" size="large" onClick={handleAccept} disabled={state === 'accepting'}
          startIcon={state === 'accepting' ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
          sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' } }}>
          {state === 'accepting' ? t('organization.joining', 'Joining...') : t('organization.acceptJoin', 'Accept & Join Organization')}
        </Button>
        <Button fullWidth variant="text" size="large" onClick={handleDecline} disabled={state === 'declining'}
          sx={{ py: 1.2, borderRadius: 3, fontWeight: 600, color: 'text.secondary', textTransform: 'none', '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.04) } }}>
          {state === 'declining' ? t('organization.declining', 'Declining...') : t('organization.declineInvitation', 'Decline Invitation')}
        </Button>
      </Stack>

      <Typography variant="caption" sx={{ display: 'block', mt: 3, color: 'text.disabled', textAlign: 'center', lineHeight: 1.5 }}>
        {t('organization.agreeNote', "By accepting, you agree to the organization's policies. If you didn't expect this, you can safely decline.")}
      </Typography>
    </Box>
  )
}
