import { Box, Snackbar, alpha } from '@mui/material'
import { Alert as MAlert, themeConfig, useTenant } from '@cap/platform-core'
import { LiquidGlassCard } from '@cap/theme'
import { AuthPageLayout } from '../../../components/shared/auth'
import { useSignUpFlow } from '../hooks/useSignUpFlow'
import { RegistrationStep } from '../components/RegistrationStep'
import { VerifyEmailStep } from '../components/VerifyEmailStep'
import { SuccessStep } from '../components/SuccessStep'
import { LockedStep } from '../components/LockedStep'

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
    passwordStrength,
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
        {/* Background Gradient Decoration */}
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            opacity: 1,
            pointerEvents: 'none',
            background: (theme) =>
              `radial-gradient(circle at 10% 20%, ${alpha(theme.palette.primary.main, 0.4)} 0%, transparent 40%), radial-gradient(circle at 90% 80%, ${alpha(theme.palette.secondary.main || theme.palette.primary.light, 0.4)} 0%, transparent 40%), radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.dark, 0.2)} 0%, transparent 60%)`,
          }}
        />

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

        <Box sx={{ width: '100%' }}>
          {mode === 'locked' ? (
            <LiquidGlassCard blur="24px" opacity={0.82} padding="0px" borderRadius="24px">
              <LockedStep
                t={t}
                timeLeft={timeLeft}
                countdownDisplay={countdownDisplay}
                onBackToRegister={handleBackToRegister}
              />
            </LiquidGlassCard>
          ) : mode === 'verify' ? (
            <LiquidGlassCard blur="24px" opacity={0.82} padding="0px" borderRadius="24px">
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
            </LiquidGlassCard>
          ) : mode === 'success' ? (
            <LiquidGlassCard blur="24px" opacity={0.82} padding="0px" borderRadius="24px">
              <SuccessStep t={t} />
            </LiquidGlassCard>
          ) : (
            <LiquidGlassCard blur="24px" opacity={0.82} padding="0px" borderRadius="24px">
              <RegistrationStep
                t={t}
                control={control}
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
                passwordStrength={passwordStrength}
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
            </LiquidGlassCard>
          )}
        </Box>
      </AuthPageLayout>
    </>
  )
}
