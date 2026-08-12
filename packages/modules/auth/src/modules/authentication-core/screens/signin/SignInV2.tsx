import { Box, Snackbar, Backdrop, CircularProgress, alpha } from '@mui/material'
import { Alert as MAlert, themeConfig } from '@cap/platform-core'
import { AuthPageLayout } from '../../components/shared/auth'
import { useSignInFlow } from './hooks/useSignInFlow'
import { CredentialsStep } from './components/CredentialsStep'
import { MfaStep } from './components/MfaStep'
import { LockedStep } from './components/LockedStep'

export default function SignInV2() {
  const {
    t,
    control,
    handleSubmit,
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
        {t('auth.login.title_page')} - {themeConfig.templateName}
      </title>
      <meta
        name='keywords'
        content={t('auth.login.keywords', { appName: themeConfig.templateName })}
      />

      <AuthPageLayout>
        {/* Background Gradient Decoration */}
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            opacity: 0.4,
            pointerEvents: 'none',
            background: (theme) =>
              `radial-gradient(circle at 15% 50%, ${alpha(theme.palette.primary.main, 0.08)}, transparent 25%), radial-gradient(circle at 85% 30%, ${alpha(theme.palette.primary.main, 0.08)}, transparent 25%)`,
          }}
        />

        <Backdrop
          open={
            loginMutation.isPending || mfaVerifyMutation.isPending || passkeyLoginMutation.isPending
          }
          sx={{ color: 'primary.contrastText', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <CircularProgress color='inherit' />
        </Backdrop>

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

        <Box sx={{ width: '100%', maxWidth: '480px', mx: 'auto' }}>
          {isLockedMode ? (
            <LockedStep
              timeLeft={timeLeft}
              countdownDisplay={countdownDisplay}
              onBackToLogin={handleBackToLogin}
            />
          ) : isMfaMode ? (
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
          ) : (
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
              onShowPassword={handleShowPassword}
              onPasskeyLogin={handlePasskeyLogin}
              onSocialLogin={handleSocialLogin}
            />
          )}
        </Box>
      </AuthPageLayout>
    </>
  )
}
