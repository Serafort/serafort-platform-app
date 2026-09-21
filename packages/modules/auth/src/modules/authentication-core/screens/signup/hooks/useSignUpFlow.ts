import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { IStatus, Roles, useAppStore, API_CONFIG, ENDPOINTS } from '@cap/platform-core'
import { secureTokenManager } from '@cap/platform-store'
import { useRegister, useResendVerification } from '../../../hooks/useAuthQuery'
import { useInterval } from '../../../hooks/useInterval'
import { RegisterRequest } from '../../../types/api.types'
import { SignUpFormSchema, type SignUpFormSchemaType } from '../../../utils/schema'
import { useActionLock } from '../../../hooks/useActionLock'
import authService from '../../../services/auth.service'
import { resolveRedirectPathForUser } from '../../../utils/resolveRedirect'
import { Path } from '@cap/module-auth/routes/path'

export type SignUpMode = 'register' | 'verify' | 'success' | 'locked'

const DEFAULT_SIGNUP_VALUES: SignUpFormSchemaType = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
}

export function useSignUpFlow() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const { isLocked, executeWithLock } = useActionLock(100)

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting, isValidating },
  } = useForm<SignUpFormSchemaType>({
    defaultValues: DEFAULT_SIGNUP_VALUES,
    resolver: zodResolver(SignUpFormSchema),
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
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [mode, setMode] = useState<SignUpMode>('register')
  const [pendingEmail, setPendingEmail] = useState<string>('')
  const [otpCode, setOtpCode] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState<number>(60)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false)

  // The password the strength meter reads. Scoring itself lives in
  // `utils/passwordStrength`, shared with the reset and change-password
  // screens so the meter and the Zod schema can never disagree.
  const watchedPassword = useWatch({ control, name: 'password' }) || ''

  // Countdown timer for OTP resend and rate limit locks
  useInterval(
    () => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    },
    mode === 'verify' || mode === 'locked' ? 1000 : null,
  )

  const handleCloseStatus = useCallback(() => {
    setStatus((prev) => ({ ...prev, open: false }))
  }, [])

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const handleToggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev)
  }, [])

  const registerMutation = useRegister({
    onSuccess: (_response: any, variables: { data: RegisterRequest }) => {
      const email = variables.data.email
      setPendingEmail(email)

      setStatus({
        open: true,
        type: 'success',
        state: 'success',
        msg: t(
          'signUp.verificationSent',
          'A verification email has been sent. Please check your inbox.',
        ),
      })

      // Redirect user to check-email confirmation screen without auto-logging in
      navigate(`${Path.auth.checkEmail}?email=${encodeURIComponent(email)}`)
    },
    onError: (error: any) => {
      if (error.response?.status === 429 || error.response?.status === 423) {
        setMode('locked')
        const retryAfterSeconds = parseInt(error.response.headers?.['retry-after'], 10)
        setTimeLeft(retryAfterSeconds || 60)
        setStatus({
          open: true,
          type: 'error',
          state: 'error',
          msg: t('signUp.errorRateLimit', 'Too many attempts. Please wait before trying again.'),
        })
        return
      }

      if (error.response?.status === 409) {
        setStatus({
          open: true,
          type: 'error',
          state: 'error',
          msg: t('signUp.errorDuplicateEmail', 'An account with this email already exists.'),
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
          error.message ||
          t('signUp.errorGeneric', 'An error occurred during registration.'),
      })
    },
  })

  const resendMutation = useResendVerification({
    onSuccess: () => {
      setTimeLeft(60)
      setStatus({
        open: true,
        type: 'info',
        state: 'info',
        msg: t('signUp.codeResent', 'A new verification code has been sent to your email.'),
      })
    },
    onError: (error: any) => {
      setStatus({
        open: true,
        type: 'error',
        state: 'error',
        msg:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          t('signUp.resendError', 'Failed to resend code. Please try again.'),
      })
    },
  })

  const handleResendCode = useCallback(() => {
    if (!pendingEmail) {
      setStatus({
        open: true,
        type: 'error',
        state: 'error',
        msg: t('signUp.emailMissing', 'Email address is missing.'),
      })
      return
    }
    resendMutation.mutate({ email: pendingEmail })
  }, [pendingEmail, resendMutation, t])

  const handleVerifyOtp = useCallback(async () => {
    if (!pendingEmail || !otpCode || otpCode.length < 6) {
      setStatus({
        open: true,
        type: 'warning',
        state: 'warning',
        msg: t('signUp.enterValidCode', 'Please enter a valid 6-digit verification code.'),
      })
      return
    }

    try {
      setIsVerifyingOtp(true)
      const response = await authService.verifyEmailCode(pendingEmail, otpCode)
      if (response.status === 200 || response.status === 202) {
        const responseData = response.data
        const token = responseData?.token || responseData?.accessToken
        if (token) {
          secureTokenManager.setTokens({
            accessToken: token,
            expiresAt: Date.now() + 3600 * 1000,
          })
          const userData = (responseData?.user || responseData) as any
          useAppStore.getState().setUser(userData)
        }

        setMode('success')
        setStatus({
          open: true,
          type: 'success',
          state: 'success',
          msg: t('signUp.emailVerifiedSuccess', 'Email verified successfully!'),
        })

        safeTimeout(() => {
          const userData = useAppStore.getState().user as any
          const userRole = userData?.role as unknown as Roles | undefined
          if (userData && userRole) {
            navigate(resolveRedirectPathForUser(userRole))
          } else {
            navigate(Path.auth.signin)
          }
        }, 1800)
      } else {
        setStatus({
          open: true,
          type: 'error',
          state: 'error',
          msg: t('signUp.verificationFailed', 'Invalid or expired verification code.'),
        })
      }
    } catch (error: any) {
      setStatus({
        open: true,
        type: 'error',
        state: 'error',
        msg:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          t('signUp.verificationFailed', 'Invalid or expired verification code.'),
      })
    } finally {
      setIsVerifyingOtp(false)
    }
  }, [navigate, otpCode, pendingEmail, safeTimeout, t])

  const handleBackToRegister = useCallback(() => {
    setMode('register')
    setOtpCode('')
  }, [])

  const handleSocialRegister = useCallback((provider: string) => {
    window.location.assign(`${API_CONFIG.baseURL}${ENDPOINTS.auth.social.redirect(provider)}`)
  }, [])

  const onSubmit = useCallback(
    (formData: SignUpFormSchemaType) => {
      executeWithLock(async () => {
        const data: RegisterRequest = {
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstname: formData.firstname.trim(),
          lastname: formData.lastname.trim(),
          isTermsSign: !!formData.acceptTerms,
        }
        registerMutation.mutate({ data })
      })
    },
    [executeWithLock, registerMutation],
  )

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null))

  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpDigitChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    if (!digit && value !== '') return

    const newCode = otpCode.split('')
    newCode[index] = digit
    const finalCode = newCode.join('')
    setOtpCode(finalCode)

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
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
    showConfirmPassword,
    mode,
    pendingEmail,
    otpCode,
    setOtpCode,
    timeLeft,
    countdownDisplay,
    password: watchedPassword,
    isRegisterPending: registerMutation.isPending,
    isResendPending: resendMutation.isPending,
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
  }
}
