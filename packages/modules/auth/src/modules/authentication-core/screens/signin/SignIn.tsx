import { Snackbar } from '@mui/material'
import { Alert as MAlert, themeConfig, useTenant } from '@cap/platform-core'
import { AuthPageLayout, AuthCard } from '../../components/shared/auth'
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
    getValues,
    isSubmitting,
    isValidating,
    isLocked,
    status,
    showPassword,
    mode,
    pendingMfaUser,
    mfaCode,
    setMfaCode,
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

        {/*
          One surface wraps all three steps. The card used to be repeated per
          branch, which let the three states drift apart on elevation and
          radius; keeping it outside the switch also means the step transition
          animates inside a stable frame instead of remounting the card.
        */}
        <AuthCard padding='none'>
          {isLockedMode ? (
            <LockedStep
              timeLeft={timeLeft}
              countdownDisplay={countdownDisplay}
              onBackToLogin={handleBackToLogin}
              defaultEmail={getValues('email')}
            />
          ) : isMfaMode ? (
            <MfaStep
              t={t}
              pendingMfaUser={pendingMfaUser}
              mfaCode={mfaCode}
              onMfaCodeChange={setMfaCode}
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
              isSubmitting={isSubmitting}
              isValidating={isValidating}
              isLocked={isLocked}
              onShowPassword={handleShowPassword}
              onPasskeyLogin={handlePasskeyLogin}
              onSocialLogin={handleSocialLogin}
            />
          )}
        </AuthCard>
      </AuthPageLayout>
    </>
  )
}
