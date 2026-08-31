import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { startAuthentication } from '@simplewebauthn/browser'
import { IStatus, Roles, useAppStore, API_CONFIG, ENDPOINTS } from '@cap/platform-core'
import { useSignin, useSsoDiscovery } from '../../../hooks/useAuthQuery'
import { usePasskeyLogin, usePasskeyGetLoginOptions, useMfaLoginVerify, usePasskeyAutofill } from '../../../../mfa-orchestrator/hooks'
import { useInterval } from '../../../hooks/useInterval'
import { LoginRequest } from '../../../types/api.types'
import { LoginSchema } from '../../../utils/schema'
import { useActionLock } from '../../../hooks/useActionLock'
import authService from '../../../services/auth.service'
import { resolveRedirectPathForUser } from '../../../utils/resolveRedirect'

// Local-dev convenience only: prefill is opt-in via env vars and is compiled out
// of production builds (`import.meta.env.DEV` is statically false there). No
// credentials are hardcoded in source.
const DEFAULT_FORM_VALUES: LoginRequest = {
  email: import.meta.env.DEV ? (import.meta.env.VITE_DEV_LOGIN_EMAIL ?? '') : '',
  password: import.meta.env.DEV ? (import.meta.env.VITE_DEV_LOGIN_PASSWORD ?? '') : '',
  rememberMe: false,
}

export interface PendingMfaUser {
  userId?: number
  email?: string
}

export function useSignInFlow() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { isLocked, executeWithLock } = useActionLock(100)

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting, isValidating },
  } = useForm<LoginRequest>({
    defaultValues: DEFAULT_FORM_VALUES,
    resolver: zodResolver(LoginSchema),
    mode: 'onTouched',
  })

  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())

  const safeTimeout = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current.delete(id)
      fn()
    }, delay)
    timeoutsRef.current.add(id)
    return id
  }, [])

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => clearTimeout(id))
      timeoutsRef.current.clear()
    }
  }, [])

  const [status, setStatus] = useState<IStatus>({
    open: false,
    type: '',
    state: '',
    msg: '',
  })

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [mode, setMode] = useState<'login' | 'mfa' | 'locked'>('login')
  const [pendingMfaUser, setPendingMfaUser] = useState<PendingMfaUser | null>(null)
  const [mfaCode, setMfaCode] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState<number>(60)

  // SSO Discovery Logic
  const emailValue = useWatch({ control, name: 'email' })
  const [debouncedEmail, setDebouncedEmail] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedEmail(emailValue || '')
    }, 500)
    return () => clearTimeout(handler)
  }, [emailValue])

  const { data: ssoResponse, isLoading: isDiscovering } = useSsoDiscovery(debouncedEmail)
  const ssoData = ssoResponse?.data
  const isSsoProvider = ssoData?.provider === 'saml' || ssoData?.provider === 'oidc'
  const showPasswordField = !ssoData?.provider || ssoData.provider === 'password'

  useInterval(
    () => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    },
    mode === 'mfa' || mode === 'locked' ? 1000 : null,
  )

  const handleCloseStatus = useCallback(() => {
    setStatus((prev) => ({ ...prev, open: false }))
  }, [])

  const handleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const loginMutation = useSignin({
    onSuccess: (response: any) => {
      if (response?.data?.mfa_required) {
        setPendingMfaUser({ userId: response.data.userId, email: getValues('email') })
        setMode('mfa')
        setMfaCode('')
        setTimeLeft(60)
        setStatus({
          open: true,
          type: 'info',
          state: 'info',
          msg: t('auth.login.mfa_required', 'Multi-factor authentication required'),
        })
        return
      }

      setStatus({
        open: true,
        type: 'success',
        state: 'success',
        msg: t('auth.login.login_successful', 'Login successful!'),
      })

      const userData = response?.data?.user || response?.data
      const userRole = userData?.role as unknown as Roles | undefined
      const redirectPath = resolveRedirectPathForUser(userRole)

      navigate(redirectPath, { replace: true })
    },
    onError: async (error: any) => {
      if (error.response?.status === 423) {
        setMode('locked')
        const retryAfterSeconds = parseInt(error.response.headers?.['retry-after'], 10)
        if (retryAfterSeconds) {
          setTimeLeft(retryAfterSeconds)
        }
        return
      }

      const attemptsRemaining = error.response?.data?.attemptsRemaining
      if (error.response?.status === 401 && attemptsRemaining !== undefined) {
        try {
          await authService.trackFailedLogin({ email: getValues('email') })
        } catch {
          // Silent catch for tracking failure
        }

        setStatus({
          open: true,
          type: 'warning',
          state: 'warning',
          msg: `${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining before lockout.`,
        })
        return
      }

      setStatus({
        open: true,
        type: 'error',
        state: 'error',
        msg:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          t('auth.login.login_failed', 'Login failed. Please check your credentials.'),
      })
    },
  })

  const mfaVerifyMutation = useMfaLoginVerify({
    onSuccess: () => {
      setStatus({
        open: true,
        type: 'success',
        state: 'success',
        msg: t('auth.mfa.verification_successful', 'Verification successful!'),
      })
      setMode('login')
      setMfaCode('')
      setPendingMfaUser(null)
      const userData = useAppStore.getState().user as any
      const userRole = userData?.role || userData?.user?.role

      const redirectPath = resolveRedirectPathForUser(userRole)
      navigate(redirectPath, { replace: true })
    },
    onError: (error: any) => {
      setStatus({
        open: true,
        type: 'error',
        state: 'error',
        msg:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          t('auth.mfa.invalid_code', 'Invalid verification code. Please try again.'),
      })
    },
  })

  const passkeyLoginMutation = usePasskeyLogin({
    onSuccess: () => {
      setStatus({
        open: true,
        type: 'success',
        state: 'success',
        msg: t('auth.login.passkey_login_successful', 'Passkey sign in successful!'),
      })
      const userData = useAppStore.getState().user as any
      const userRole = (userData?.role || userData?.user?.role) as Roles

      const redirectPath = resolveRedirectPathForUser(userRole)
      navigate(redirectPath, { replace: true })
    },
    onError: (error: any) => {
      setStatus({
        open: true,
        type: 'error',
        state: 'error',
        msg: error.response?.data?.message || t('auth.login.passkey_login_failed', 'Passkey authentication failed'),
      })
    },
  })

  const passkeyGetOptionsMutation = usePasskeyGetLoginOptions()

  const handlePasskeyAutofillSuccess = useCallback(() => {
    setStatus({
      open: true,
      type: 'success',
      state: 'success',
      msg: t('auth.login.passkey_login_successful', 'Passkey sign in successful!'),
    })
    const userData = useAppStore.getState().user as any
    const userRole = (userData?.role || userData?.user?.role) as Roles

    const redirectPath = resolveRedirectPathForUser(userRole)
    navigate(redirectPath, { replace: true })
  }, [navigate, t])

  const { isAvailable: isPasskeyAutofillAvailable } = usePasskeyAutofill(
    handlePasskeyAutofillSuccess,
  )

  const handlePasskeyLogin = useCallback(async () => {
    try {
      const email = getValues('email')
      const optionsResponse = await passkeyGetOptionsMutation.mutateAsync(email)
      const options = optionsResponse.data

      const authenticationResponse = await startAuthentication(options)
      passkeyLoginMutation.mutate(authenticationResponse)
    } catch (error: any) {
      if (error.name !== 'NotAllowedError') {
        setStatus({
          open: true,
          type: 'error',
          state: 'error',
          msg: error.message || t('auth.login.login_failed', 'Login failed. Please check your credentials.'),
        })
      }
    }
  }, [getValues, passkeyLoginMutation, passkeyGetOptionsMutation, t])

  const handleMfaSubmit = useCallback(() => {
    if (!pendingMfaUser?.userId) {
      setStatus({
        open: true,
        type: 'error',
        state: 'error',
        msg: t('auth.mfa.user_missing', 'User session missing for MFA verification.'),
      })
      setMode('login')
      return
    }
    mfaVerifyMutation.mutate({ userId: pendingMfaUser.userId, code: mfaCode })
  }, [mfaCode, mfaVerifyMutation, pendingMfaUser, t])

  const handleResendCode = useCallback(() => {
    setTimeLeft(60)
    setStatus({
      open: true,
      type: 'info',
      state: 'info',
      msg: t('auth.mfa.code_resent', 'A new code has been sent to your email.'),
    })
  }, [t])

  const handleBackToLogin = useCallback(() => {
    setMode('login')
    setMfaCode('')
    setPendingMfaUser(null)
  }, [])

  const handleSocialLogin = useCallback((provider: string) => {
    window.location.assign(`${API_CONFIG.baseURL}${ENDPOINTS.auth.social.redirect(provider)}`)
  }, [])

  const onSubmit = useCallback(
    async (data: LoginRequest) => {
      await executeWithLock(async () => {
        if (ssoData && (ssoData.provider === 'saml' || ssoData.provider === 'oidc')) {
          if (ssoData.provider === 'saml' && ssoData.organizationId) {
            const organizationId = ssoData.organizationId
            safeTimeout(() => {
              window.location.assign(
                `${API_CONFIG.baseURL}${ENDPOINTS.auth.sso.samlRedirect(organizationId)}`,
              )
            }, 0)
          } else if (ssoData.provider === 'oidc' && ssoData.clientId) {
            const clientId = ssoData.clientId
            safeTimeout(() => {
              window.location.assign(
                `${API_CONFIG.baseURL}${ENDPOINTS.auth.sso.oidcRedirect(clientId)}`,
              )
            }, 0)
          }
          return
        }

        try {
          await loginMutation.mutateAsync({ data })
        } catch {
          // Handled by mutation onError handler
        }
      })
    },
    [executeWithLock, loginMutation, ssoData, safeTimeout],
  )

  const mfaInputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null))

  const handleMfaKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !mfaCode[index] && index > 0) {
      mfaInputRefs.current[index - 1]?.focus()
    }
  }

  const handleMfaDigitChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    if (!digit && value !== '') return

    const newCode = mfaCode.split('')
    newCode[index] = digit
    const finalCode = newCode.join('')
    setMfaCode(finalCode)

    if (digit && index < 5) {
      mfaInputRefs.current[index + 1]?.focus()
    }
  }

  const countdownDisplay = new Date(Math.max(timeLeft, 0) * 1000).toISOString().substring(14, 19)

  return {
    t,
    control,
    handleSubmit,
    errors,
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
    ssoData,
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
  }
}
