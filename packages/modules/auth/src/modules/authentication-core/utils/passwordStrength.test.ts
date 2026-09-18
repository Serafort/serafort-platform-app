import { describe, it, expect } from 'vitest'
import {
  evaluatePasswordCriteria,
  evaluatePasswordStrength,
  PASSWORD_CRITERIA_LABELS,
  PASSWORD_CRITERIA_LONG_LABELS,
} from './passwordStrength'
import { SignUpFormSchema } from './schema'

describe('evaluatePasswordCriteria', () => {
  it('reports every criterion as unmet for an empty password', () => {
    expect(evaluatePasswordCriteria('')).toEqual({
      minLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecial: false,
    })
  })

  it('detects each criterion independently', () => {
    expect(evaluatePasswordCriteria('abcdefgh').minLength).toBe(true)
    expect(evaluatePasswordCriteria('A').hasUppercase).toBe(true)
    expect(evaluatePasswordCriteria('a').hasLowercase).toBe(true)
    expect(evaluatePasswordCriteria('1').hasNumber).toBe(true)
    expect(evaluatePasswordCriteria('!').hasSpecial).toBe(true)
  })

  it('treats a seven character password as too short', () => {
    expect(evaluatePasswordCriteria('Abc123!').minLength).toBe(false)
  })
})

describe('evaluatePasswordStrength', () => {
  it('scores one fifth per satisfied criterion', () => {
    expect(evaluatePasswordStrength('').score).toBe(0)
    expect(evaluatePasswordStrength('a').score).toBe(20)
    expect(evaluatePasswordStrength('aB').score).toBe(40)
    expect(evaluatePasswordStrength('aB1').score).toBe(60)
    expect(evaluatePasswordStrength('aB1!').score).toBe(80)
    expect(evaluatePasswordStrength('aB1!aB1!').score).toBe(100)
  })

  it('maps the score onto escalating tones', () => {
    expect(evaluatePasswordStrength('').tone).toBe('error')
    expect(evaluatePasswordStrength('a').tone).toBe('error')
    expect(evaluatePasswordStrength('aB').tone).toBe('warning')
    expect(evaluatePasswordStrength('aB1').tone).toBe('info')
    expect(evaluatePasswordStrength('aB1!').tone).toBe('success')
    expect(evaluatePasswordStrength('aB1!aB1!').tone).toBe('success')
  })

  it('distinguishes strong from very strong', () => {
    expect(evaluatePasswordStrength('aB1!').labelFallback).toBe('Strong')
    expect(evaluatePasswordStrength('aB1!aB1!').labelFallback).toBe('Very Strong')
  })

  /**
   * The meter is only useful if it agrees with the validator. A password the
   * meter calls "Very Strong" must pass the schema, and one that falls short of
   * 100 must not — otherwise the user sees a full bar and then a rejection.
   */
  it('agrees with the sign-up schema about which passwords are acceptable', () => {
    const accepted = 'Str0ng!Pass'
    const rejected = 'weakpassword'

    expect(evaluatePasswordStrength(accepted).score).toBe(100)
    expect(
      SignUpFormSchema.safeParse({
        firstname: 'Ada',
        lastname: 'Lovelace',
        email: 'ada@example.com',
        password: accepted,
        confirmPassword: accepted,
        acceptTerms: true,
      }).success,
    ).toBe(true)

    expect(evaluatePasswordStrength(rejected).score).toBeLessThan(100)
    expect(
      SignUpFormSchema.safeParse({
        firstname: 'Ada',
        lastname: 'Lovelace',
        email: 'ada@example.com',
        password: rejected,
        confirmPassword: rejected,
        acceptTerms: true,
      }).success,
    ).toBe(false)
  })
})

describe('criteria label tables', () => {
  it('cover all five criteria in both presentations', () => {
    const keys = ['minLength', 'hasUppercase', 'hasLowercase', 'hasNumber', 'hasSpecial']
    expect(PASSWORD_CRITERIA_LABELS.map((c) => c.key)).toEqual(keys)
    expect(PASSWORD_CRITERIA_LONG_LABELS.map((c) => c.key)).toEqual(keys)
  })
})
