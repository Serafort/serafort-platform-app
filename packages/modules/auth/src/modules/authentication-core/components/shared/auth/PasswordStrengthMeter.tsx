import React from 'react'
import { Box, Chip, LinearProgress, Stack, Typography, alpha, useTheme } from '@mui/material'
import CheckCircle from '@mui/icons-material/CheckCircle'
import CheckRounded from '@mui/icons-material/CheckRounded'
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked'
import { useTranslation } from 'react-i18next'
import {
  evaluatePasswordStrength,
  PASSWORD_CRITERIA_LABELS,
  PASSWORD_CRITERIA_LONG_LABELS,
} from '../../../utils/passwordStrength'

export interface PasswordStrengthMeterProps {
  password: string
  /**
   * `list` spells each requirement out in full and suits a registration form
   * where the rules are being met for the first time; `chips` is the compact
   * row for reset/change screens where the user already knows the policy;
   * `none` shows the bar alone.
   */
  criteria?: 'list' | 'chips' | 'none'
  /** Wraps the meter in a tinted panel, as the sign-up form does. */
  framed?: boolean
  /** Hides the whole block until the user has typed something. */
  hideWhenEmpty?: boolean
  id?: string
}

/**
 * Live password strength bar plus requirement feedback.
 *
 * Drives its verdict from `evaluatePasswordStrength`, the same five criteria
 * the Zod schema enforces, so the meter can never say "Strong" about a
 * password the form will then reject. Both the sign-up form and the reset /
 * change screens render this rather than keeping separate copies that drift.
 */
const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  criteria = 'chips',
  framed = false,
  hideWhenEmpty = true,
  id,
}) => {
  const { t } = useTranslation('auth')
  const theme = useTheme()

  if (hideWhenEmpty && !password) return null

  const strength = evaluatePasswordStrength(password)
  const toneColor = theme.palette[strength.tone].main

  const body = (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 0.75,
        }}
      >
        <Typography variant='caption' sx={{ fontWeight: 700, color: 'text.secondary' }}>
          {t('signUp.passwordStrength', 'Password Strength')}
        </Typography>
        <Typography variant='caption' sx={{ fontWeight: 700, color: `${strength.tone}.main` }}>
          {t(strength.labelKey, strength.labelFallback)}
        </Typography>
      </Box>

      <LinearProgress
        variant='determinate'
        value={strength.score}
        aria-label={t('signUp.passwordStrength', 'Password Strength')}
        sx={{
          height: 6,
          borderRadius: 999,
          bgcolor: alpha(theme.palette.text.primary, 0.08),
          '& .MuiLinearProgress-bar': {
            borderRadius: 999,
            bgcolor: toneColor,
            transition: 'transform 0.3s ease, background-color 0.3s ease',
          },
        }}
      />

      {criteria === 'chips' && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.25 }}>
          {PASSWORD_CRITERIA_LABELS.map(({ key, labelKey, labelFallback }) => {
            const met = strength.criteria[key]
            return (
              <Chip
                key={key}
                size='small'
                icon={met ? <CheckRounded /> : undefined}
                label={t(labelKey, labelFallback)}
                sx={{
                  height: 26,
                  fontWeight: 600,
                  fontSize: '0.6875rem',
                  borderRadius: 1.5,
                  color: met ? 'success.main' : 'text.secondary',
                  bgcolor: met
                    ? alpha(theme.palette.success.main, 0.1)
                    : alpha(theme.palette.text.primary, 0.05),
                  border: '1px solid',
                  borderColor: met ? alpha(theme.palette.success.main, 0.25) : 'divider',
                  '& .MuiChip-icon': { color: 'success.main', fontSize: 14, ml: 0.75 },
                }}
              />
            )
          })}
        </Box>
      )}

      {criteria === 'list' && (
        <Stack spacing={0.6} sx={{ mt: 1.5 }}>
          {PASSWORD_CRITERIA_LONG_LABELS.map(({ key, labelKey, labelFallback }) => {
            const met = strength.criteria[key]
            return (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                {met ? (
                  <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                ) : (
                  <RadioButtonUnchecked sx={{ fontSize: 14, color: 'text.disabled' }} />
                )}
                <Typography
                  variant='caption'
                  sx={{
                    color: met ? 'text.primary' : 'text.secondary',
                    fontWeight: met ? 600 : 400,
                    fontSize: '0.75rem',
                  }}
                >
                  {t(labelKey, labelFallback)}
                </Typography>
              </Box>
            )
          })}
        </Stack>
      )}
    </>
  )

  if (!framed) {
    return (
      <Box id={id} sx={{ mt: 1.5 }} aria-live='polite'>
        {body}
      </Box>
    )
  }

  return (
    <Box
      id={id}
      aria-live='polite'
      sx={{
        mt: 1.5,
        p: 1.5,
        borderRadius: 'var(--sf-radius-lg, 12px)',
        bgcolor: alpha(theme.palette.background.default, 0.5),
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {body}
    </Box>
  )
}

export default PasswordStrengthMeter
