/**
 * Password strength evaluation shared by every screen that asks the user to
 * choose a password (sign-up, reset, change).
 *
 * The criteria are deliberately the same five rules that `strongPassword` in
 * `utils/schema.ts` enforces. When the meter and the validator disagree, users
 * see a "Strong" bar and then a rejection on submit, which is the worst
 * possible feedback; keeping both derived from one list prevents that drift.
 */

export interface PasswordCriteria {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecial: boolean
}

export type PasswordStrengthTone = 'error' | 'warning' | 'info' | 'success'

export interface PasswordStrengthResult {
  /** 0-100, one fifth per satisfied criterion. */
  score: number
  criteria: PasswordCriteria
  /** How many of the five criteria are satisfied. */
  passedCount: number
  tone: PasswordStrengthTone
  /** i18n key + English fallback for the strength label. */
  labelKey: string
  labelFallback: string
}

export const PASSWORD_MIN_LENGTH = 8

export const evaluatePasswordCriteria = (password: string): PasswordCriteria => ({
  minLength: password.length >= PASSWORD_MIN_LENGTH,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecial: /[^A-Za-z0-9]/.test(password),
})

export const evaluatePasswordStrength = (password: string): PasswordStrengthResult => {
  const criteria = evaluatePasswordCriteria(password)
  const passedCount = Object.values(criteria).filter(Boolean).length
  const score = (passedCount / 5) * 100

  if (passedCount === 5) {
    return {
      score,
      criteria,
      passedCount,
      tone: 'success',
      labelKey: 'signUp.strengthVeryStrong',
      labelFallback: 'Very Strong',
    }
  }
  if (passedCount >= 4) {
    return {
      score,
      criteria,
      passedCount,
      tone: 'success',
      labelKey: 'signUp.strengthStrong',
      labelFallback: 'Strong',
    }
  }
  if (passedCount >= 3) {
    return {
      score,
      criteria,
      passedCount,
      tone: 'info',
      labelKey: 'signUp.strengthMedium',
      labelFallback: 'Medium',
    }
  }
  if (passedCount >= 2) {
    return {
      score,
      criteria,
      passedCount,
      tone: 'warning',
      labelKey: 'signUp.strengthWeak',
      labelFallback: 'Weak',
    }
  }
  return {
    score,
    criteria,
    passedCount,
    tone: 'error',
    labelKey: 'signUp.strengthTooWeak',
    labelFallback: 'Too Weak',
  }
}

/** Ordered criteria list with the i18n key + fallback for each requirement chip. */
export const PASSWORD_CRITERIA_LABELS: Array<{
  key: keyof PasswordCriteria
  labelKey: string
  labelFallback: string
}> = [
  { key: 'minLength', labelKey: 'signUp.criteriaMinLength', labelFallback: '8+ characters' },
  { key: 'hasUppercase', labelKey: 'signUp.criteriaUppercase', labelFallback: 'Uppercase' },
  { key: 'hasLowercase', labelKey: 'signUp.criteriaLowercase', labelFallback: 'Lowercase' },
  { key: 'hasNumber', labelKey: 'signUp.criteriaNumber', labelFallback: 'Number' },
  { key: 'hasSpecial', labelKey: 'signUp.criteriaSpecial', labelFallback: 'Symbol' },
]

/**
 * Spelled-out requirement labels for the registration form, where the user is
 * meeting the policy for the first time and benefits from the full rule.
 */
export const PASSWORD_CRITERIA_LONG_LABELS: Array<{
  key: keyof PasswordCriteria
  labelKey: string
  labelFallback: string
}> = [
  { key: 'minLength', labelKey: 'signUp.reqLength', labelFallback: 'At least 8 characters' },
  {
    key: 'hasUppercase',
    labelKey: 'signUp.reqUppercase',
    labelFallback: 'At least one uppercase letter (A-Z)',
  },
  {
    key: 'hasLowercase',
    labelKey: 'signUp.reqLowercase',
    labelFallback: 'At least one lowercase letter (a-z)',
  },
  { key: 'hasNumber', labelKey: 'signUp.reqNumber', labelFallback: 'At least one number (0-9)' },
  {
    key: 'hasSpecial',
    labelKey: 'signUp.reqSpecial',
    labelFallback: 'At least one special character (!@#$)',
  },
]
