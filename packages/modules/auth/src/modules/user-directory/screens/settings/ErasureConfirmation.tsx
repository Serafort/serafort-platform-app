import React, { useState } from 'react'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  useTheme,
  alpha,
  Stack,
} from '@mui/material'
import DeleteForever from '@mui/icons-material/DeleteForever'
import WarningAmber from '@mui/icons-material/WarningAmber'
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline'
import ArrowBack from '@mui/icons-material/ArrowBack'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'
import { useRequestErasureMutation } from '../../hooks/useComplianceQuery'
import {
  ERASURE_CONFIRMATION_PHRASE,
  canSubmitErasure,
} from '../../types/compliance.types'
import Path from '../path'

/**
 * Multi-step erasure confirmation.
 *
 * The steps are not ceremony. Each one blocks a different way of destroying an
 * account by accident:
 *
 * 1. **Consequences** — what actually goes, stated before anything is typed.
 * 2. **Typed phrase** — proves intent. A stray click or an autofilled form
 *    cannot produce it, and it cannot be reached by tabbing through and
 *    pressing enter.
 * 3. **Password** — proves identity, and is verified server-side before the
 *    job is dispatched. It is never pre-filled or remembered: it is the
 *    confirmation factor, not a form field.
 *
 * Both factors are required together (`canSubmitErasure`), because they answer
 * different questions and either alone is the weaker control.
 *
 * Hard delete is off by default. Anonymisation satisfies the erasure right
 * while keeping the referential integrity that audit and access logs depend on;
 * full removal is the sharper instrument and should be the deliberate choice.
 */
export const ErasureConfirmation: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const theme = useTheme()
  const effects = getTenantThemeEffects(theme)
  const surfaceEffect = buildLayoutSurfaceEffect(effects, theme)

  const [step, setStep] = useState(0)
  const [acknowledged, setAcknowledged] = useState(false)
  const [confirmationPhrase, setConfirmationPhrase] = useState('')
  const [password, setPassword] = useState('')
  const [hardDelete, setHardDelete] = useState(false)

  const erasure = useRequestErasureMutation()

  const phraseMatches = confirmationPhrase.trim() === ERASURE_CONFIRMATION_PHRASE
  const canSubmit = canSubmitErasure({ confirmationPhrase, password, acknowledged })

  if (erasure.data) {
    return (
      <Container maxWidth='sm' sx={{ py: 6 }}>
        <Alert severity='success' sx={{ borderRadius: 'var(--sf-radius-md, 8px)' }}>
          <AlertTitle sx={{ fontWeight: 700 }}>
            {t('user.erasure.submitted_title', 'Erasure request received')}
          </AlertTitle>
          {t(
            'user.erasure.submitted_body',
            'Your request is being processed in the background. You will be signed out shortly and will not be able to sign back in.'
          )}
        </Alert>
        <Button
          sx={{
            mt: 2.5,
            minHeight: 44,
            borderRadius: 'var(--sf-radius-md, 8px)',
            textTransform: 'none',
            fontWeight: 600,
          }}
          onClick={() => navigate(Path.settings.privacy)}
        >
          {t('user.erasure.back', 'Back to privacy')}
        </Button>
      </Container>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Container maxWidth='sm' sx={{ py: { xs: 3, md: 5 } }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(Path.settings.privacy)}
          sx={{
            mb: 2.5,
            textTransform: 'none',
            fontWeight: 600,
            color: 'text.secondary',
            minHeight: 44,
            px: 2,
            borderRadius: 'var(--sf-radius-md, 8px)',
            bgcolor: alpha(theme.palette.action.active, 0.04),
            '&:hover': {
              bgcolor: alpha(theme.palette.action.active, 0.08),
              color: 'text.primary',
            },
          }}
        >
          {t('user.erasure.backToPrivacy', 'Back to Privacy')}
        </Button>

        <Stack direction='row' alignItems='center' spacing={2.5} sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 'var(--sf-radius-lg, 16px)',
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <DeleteForever sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant='h4' fontWeight={800} letterSpacing='-0.025em'>
              {t('user.erasure.title', 'Erase your data')}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
              {t(
                'user.erasure.subtitle',
                'This cannot be undone. Read what will happen, then confirm twice — once in writing and once with your password.'
              )}
            </Typography>
          </Box>
        </Stack>

        <Card
          variant='outlined'
          sx={{
            borderRadius: 'var(--sf-radius-lg, 16px)',
            borderColor: alpha(theme.palette.divider, 0.1),
            ...surfaceEffect,
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Stepper activeStep={step} orientation='vertical'>
            <Step>
              <StepLabel>{t('user.erasure.step_consequences', 'What will happen')}</StepLabel>
              <StepContent>
                <List dense>
                  {[
                    t(
                      'user.erasure.consequence_signin',
                      'You will be signed out and will not be able to sign back in.',
                    ),
                    t(
                      'user.erasure.consequence_profile',
                      'Your profile, preferences and linked accounts are removed.',
                    ),
                    t(
                      'user.erasure.consequence_sessions',
                      'Every active session and credential — passkeys, authenticators, tokens — is revoked.',
                    ),
                    t(
                      'user.erasure.consequence_retained',
                      'Records the law requires us to keep, such as security audit entries, are retained in anonymised form.',
                    ),
                  ].map((line) => (
                    <ListItem key={line} disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <RemoveCircleOutline fontSize='small' color='error' />
                      </ListItemIcon>
                      <ListItemText primary={line} />
                    </ListItem>
                  ))}
                </List>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={acknowledged}
                      onChange={(event) => setAcknowledged(event.target.checked)}
                    />
                  }
                  label={t(
                    'user.erasure.acknowledge',
                    'I understand this is permanent and cannot be reversed.',
                  )}
                />

                <Box sx={{ mt: 2.5, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Button
                    variant='contained'
                    color='error'
                    disabled={!acknowledged}
                    onClick={() => setStep(1)}
                    sx={{
                      minHeight: 44,
                      borderRadius: 'var(--sf-radius-md, 8px)',
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {t('user.erasure.continue', 'Continue')}
                  </Button>
                  <Button
                    onClick={() => navigate(Path.settings.privacy)}
                    sx={{
                      minHeight: 44,
                      borderRadius: 'var(--sf-radius-md, 8px)',
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {t('user.erasure.cancel', 'Cancel')}
                  </Button>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>{t('user.erasure.step_phrase', 'Confirm in writing')}</StepLabel>
              <StepContent>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
                  {t(
                    'user.erasure.phrase_help',
                    'Type {{phrase}} exactly, to confirm this is deliberate.',
                    { phrase: ERASURE_CONFIRMATION_PHRASE }
                  )}
                </Typography>
                <TextField
                  fullWidth
                  autoComplete='off'
                  value={confirmationPhrase}
                  onChange={(event) => setConfirmationPhrase(event.target.value)}
                  error={confirmationPhrase.length > 0 && !phraseMatches}
                  label={ERASURE_CONFIRMATION_PHRASE}
                  slotProps={{
                    input: {
                      sx: { minHeight: 48, borderRadius: 'var(--sf-radius-md, 8px)' },
                    },
                  }}
                />
                <Box sx={{ mt: 2.5, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Button
                    variant='contained'
                    color='error'
                    disabled={!phraseMatches}
                    onClick={() => setStep(2)}
                    sx={{
                      minHeight: 44,
                      borderRadius: 'var(--sf-radius-md, 8px)',
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {t('user.erasure.continue', 'Continue')}
                  </Button>
                  <Button
                    onClick={() => setStep(0)}
                    sx={{
                      minHeight: 44,
                      borderRadius: 'var(--sf-radius-md, 8px)',
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {t('user.erasure.back_step', 'Back')}
                  </Button>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>{t('user.erasure.step_password', 'Confirm it is you')}</StepLabel>
              <StepContent>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
                  {t(
                    'user.erasure.password_help',
                    'Your password is checked before anything is deleted.'
                  )}
                </Typography>
                <TextField
                  fullWidth
                  type='password'
                  // Never offered from the password manager: this is a
                  // confirmation factor, and autofilling it would remove the
                  // only step that proves a person is present.
                  autoComplete='off'
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  label={t('user.erasure.password', 'Current password')}
                  slotProps={{
                    input: {
                      sx: { minHeight: 48, borderRadius: 'var(--sf-radius-md, 8px)' },
                    },
                  }}
                />

                <FormControlLabel
                  sx={{ mt: 1.5 }}
                  control={
                    <Checkbox
                      checked={hardDelete}
                      onChange={(event) => setHardDelete(event.target.checked)}
                    />
                  }
                  label={t(
                    'user.erasure.hard_delete',
                    'Remove my records entirely rather than anonymising them'
                  )}
                />
                <Typography variant='caption' color='text.secondary' display='block'>
                  {t(
                    'user.erasure.hard_delete_help',
                    'Anonymising already satisfies your erasure right and keeps security audit trails intact. Choose full removal only if you need it.'
                  )}
                </Typography>

                {erasure.error && (
                  <Alert
                    severity='error'
                    sx={{ mt: 2, borderRadius: 'var(--sf-radius-md, 8px)' }}
                  >
                    {t(
                      'user.erasure.failed',
                      'The request could not be submitted. If the password was wrong, try again — repeated attempts are rate limited.'
                    )}
                  </Alert>
                )}

                <Alert
                  severity='warning'
                  icon={<WarningAmber />}
                  sx={{ mt: 2, borderRadius: 'var(--sf-radius-md, 8px)' }}
                >
                  {t('user.erasure.final_warning', 'This is the last step. There is no undo.')}
                </Alert>

                <Box sx={{ mt: 2.5, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Button
                    variant='contained'
                    color='error'
                    startIcon={<DeleteForever />}
                    disabled={!canSubmit || erasure.isPending}
                    onClick={() => erasure.mutate({ password, hardDelete })}
                    sx={{
                      minHeight: 48,
                      borderRadius: 'var(--sf-radius-md, 8px)',
                      textTransform: 'none',
                      fontWeight: 700,
                    }}
                  >
                    {t('user.erasure.submit', 'Erase my data')}
                  </Button>
                  <Button
                    onClick={() => setStep(1)}
                    sx={{
                      minHeight: 44,
                      borderRadius: 'var(--sf-radius-md, 8px)',
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {t('user.erasure.back_step', 'Back')}
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>

          <Divider sx={{ my: 2.5 }} />
          <Typography variant='caption' color='text.secondary'>
            {t(
              'user.erasure.footer',
              'Prefer to keep the account but stop using it? Deactivating suspends access without destroying your data.'
            )}
          </Typography>
        </CardContent>
      </Card>
    </Container>
    </motion.div>
  )
}

export default ErasureConfirmation
