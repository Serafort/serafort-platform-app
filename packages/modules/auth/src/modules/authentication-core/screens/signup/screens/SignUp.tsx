import { Box, Snackbar } from '@mui/material'
import { Alert as MAlert, themeConfig, useTenant } from '@cap/platform-core'
import { AuthPageLayout, AuthCard, AuthStepProgress } from '../../../components/shared/auth'
import { useSignUpFlow } from '../hooks/useSignUpFlow'
import { RegistrationStep } from '../components/RegistrationStep'
import { VerifyEmailStep } from '../components/VerifyEmailStep'
import { SuccessStep } from '../components/SuccessStep'
import { LockedStep } from '../components/LockedStep'

const STEP_ORDER = ['register', 'verify', 'success'] as const

export default function SignUp() {
  const { tenant } = useTenant()
  const appName = tenant?.name || themeConfig.templateName

  const {
    t,
    control,
    handleSubmit,
    isSubmitting,
    isValidating,
    isLocked,
    status,
    showPassword,
    showConfirmPassword,
    mode,
    pendingEmail,
    otpCode,
    timeLeft,
    countdownDisplay,
    password,
    isRegisterPending,
    isResendPending,
    isVerifyingOtp,
    otpInputRefs,
    handleCloseStatus,
    handleTogglePassword,
    handleToggleConfirmPassword,
    handleResendCode,
    handleVerifyOtp,
    handleBackToRegister,
    handleSocialRegister,
    handleOtpDigitChange,
    handleOtpKeyDown,
    onSubmit,
  } = useSignUpFlow()

  const activeIndex = Math.max(0, STEP_ORDER.indexOf(mode as (typeof STEP_ORDER)[number]))
  // The lock-out state is a dead end rather than a step in the wizard, so the
  // progress rail is hidden instead of showing a misleading position.
  const showProgress = mode !== 'locked'

  const steps = [
    { id: 'register', label: t('signUp.stepAccount', 'Account') },
    { id: 'verify', label: t('signUp.stepVerify', 'Verify') },
    { id: 'success', label: t('signUp.stepDone', 'Done') },
  ]

  return (
    <>
      <title>
        {t('auth.signup.title_page', 'Create Account')} - {appName}
      </title>
      <meta
        name='keywords'
        content={t('auth.signup.keywords', 'signup, register, create account, saas', { appName })}
      />

      <AuthPageLayout maxWidth={480}>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={status.open}
          autoHideDuration={6000}
          onClose={handleCloseStatus}
        >
          <MAlert onClose={handleCloseStatus} severity={status.type} sx={{ width: '100%' }}>
            {status.msg}
          </MAlert>
        </Snackbar>

        <AuthCard padding='none'>
          {showProgress && (
            <Box sx={{ px: { xs: 3, sm: 4 }, pt: { xs: 3, sm: 4 } }}>
              <AuthStepProgress
                steps={steps}
                activeIndex={activeIndex}
                label={t('signUp.progressLabel', 'Sign-up progress')}
                caption={t('signUp.progressCaption', {
                  current: activeIndex + 1,
                  total: steps.length,
                  defaultValue: 'Step {{current}} of {{total}}',
                })}
              />
            </Box>
          )}

          {mode === 'locked' ? (
            <LockedStep
              t={t}
              timeLeft={timeLeft}
              countdownDisplay={countdownDisplay}
              onBackToRegister={handleBackToRegister}
              defaultEmail={pendingEmail}
            />
          ) : mode === 'verify' ? (
            <VerifyEmailStep
              t={t}
              pendingEmail={pendingEmail}
              otpCode={otpCode}
              otpInputRefs={otpInputRefs}
              handleOtpDigitChange={handleOtpDigitChange}
              handleOtpKeyDown={handleOtpKeyDown}
              countdownDisplay={countdownDisplay}
              isVerifyingOtp={isVerifyingOtp}
              isResendPending={isResendPending}
              timeLeft={timeLeft}
              onVerifyOtp={handleVerifyOtp}
              onResendCode={handleResendCode}
              onBackToRegister={handleBackToRegister}
            />
          ) : mode === 'success' ? (
            <SuccessStep t={t} />
          ) : (
            <RegistrationStep
              t={t}
              control={control}
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              password={password}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              isRegisterPending={isRegisterPending}
              isSubmitting={isSubmitting}
              isValidating={isValidating}
              isLocked={isLocked}
              onTogglePassword={handleTogglePassword}
              onToggleConfirmPassword={handleToggleConfirmPassword}
              onSocialRegister={handleSocialRegister}
            />
          )}
        </AuthCard>
      </AuthPageLayout>
    </>
  )
}
