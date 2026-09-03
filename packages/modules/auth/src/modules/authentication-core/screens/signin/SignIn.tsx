import { Box, Snackbar, alpha } from '@mui/material'
import { Alert as MAlert, themeConfig, useTenant } from '@cap/platform-core'
import { LiquidGlassCard } from '@cap/theme'
import { AuthPageLayout } from '../../components/shared/auth'
import { useSignInFlow } from './hooks/useSignInFlow'
import { CredentialsStep } from './components/CredentialsStep'
import { MfaStep } from './components/MfaStep'
import { LockedStep } from './components/LockedStep'

export default function SignInV2() {
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
    mode,
    pendingMfaUser,
    mfaCode,
    timeLeft,
    countdownDisplay,
    isDiscovering,
    isSsoProvider,
    showPasswordField,
    loginMutation,
    mfaVerifyMutation,
    passkeyLoginMutation,
    isPasskeyAutofillAvailable,
    mfaInputRefs,
    handleCloseStatus,
    handleShowPassword,
    handlePasskeyLogin,
    handleMfaSubmit,
    handleResendCode,
    handleBackToLogin,
    handleSocialLogin,
    handleMfaDigitChange,
    handleMfaKeyDown,
    onSubmit,
  } = useSignInFlow()

  const isMfaMode = mode === 'mfa'
  const isLockedMode = mode === 'locked'

  return (
    <>
      <title>
        {t('auth.login.title_page', 'Sign In')} - {appName}
      </title>
      <meta
        name='keywords'
        content={t('auth.login.keywords', { appName, defaultValue: `login, sign in, ${appName}` })}
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
              `radial-gradient(circle at 10% 20%, ${alpha(theme.palette.primary.main, 0.35)} 0%, transparent 40%), radial-gradient(circle at 90% 80%, ${alpha(theme.palette.secondary.main || theme.palette.primary.light, 0.35)} 0%, transparent 40%), radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.dark, 0.15)} 0%, transparent 60%)`,
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
          {isLockedMode ? (
            <LiquidGlassCard blur='24px' opacity={0.85} padding='0px' borderRadius='24px'>
              <LockedStep
                timeLeft={timeLeft}
                countdownDisplay={countdownDisplay}
                onBackToLogin={handleBackToLogin}
              />
            </LiquidGlassCard>
          ) : isMfaMode ? (
            <LiquidGlassCard blur='24px' opacity={0.85} padding='0px' borderRadius='24px'>
              <MfaStep
                t={t}
                pendingMfaUser={pendingMfaUser}
                mfaCode={mfaCode}
                mfaInputRefs={mfaInputRefs}
                handleMfaDigitChange={handleMfaDigitChange}
                handleMfaKeyDown={handleMfaKeyDown}
                countdownDisplay={countdownDisplay}
                isMfaPending={mfaVerifyMutation.isPending}
                timeLeft={timeLeft}
                onMfaSubmit={handleMfaSubmit}
                onResendCode={handleResendCode}
                onBackToLogin={handleBackToLogin}
              />
            </LiquidGlassCard>
          ) : (
            <LiquidGlassCard blur='24px' opacity={0.85} padding='0px' borderRadius='24px'>
              <CredentialsStep
                t={t}
                control={control}
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
                showPasswordField={showPasswordField}
                showPassword={showPassword}
                isPasskeyAutofillAvailable={isPasskeyAutofillAvailable}
                isSsoProvider={isSsoProvider}
                isDiscovering={isDiscovering}
                isLoginPending={loginMutation.isPending}
                isPasskeyPending={passkeyLoginMutation.isPending}
                isSubmitting={isSubmitting}
                isValidating={isValidating}
                isLocked={isLocked}
                onShowPassword={handleShowPassword}
                onPasskeyLogin={handlePasskeyLogin}
                onSocialLogin={handleSocialLogin}
              />
            </LiquidGlassCard>
          )}
        </Box>
      </AuthPageLayout>
    </>
  )
}
