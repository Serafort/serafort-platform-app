export { default as AuthPageLayout } from './AuthPageLayout'
export { default as AuthScreenIcon } from './AuthScreenIcon'
export { default as AuthInputLabel } from './AuthInputLabel'
export { default as AuthActionButton } from './AuthActionButton'

// Redesign kit — the shared surface, header, feedback and input primitives that
// every auth screen is composed from.
export { default as AuthBackdrop, type AuthBackdropProps } from './AuthBackdrop'
export { default as AuthCard, type AuthCardProps } from './AuthCard'
export { default as AuthCardHeader, type AuthCardHeaderProps } from './AuthCardHeader'
export { default as AuthOutcomeScreen, type AuthOutcomeScreenProps } from './AuthOutcomeScreen'
export { default as AuthSecurityNote, type AuthSecurityNoteProps } from './AuthSecurityNote'
export { default as AuthBackLink, type AuthBackLinkProps } from './AuthBackLink'
export {
  default as AuthStatusBadge,
  type AuthStatusBadgeProps,
  type AuthStatus,
} from './AuthStatusBadge'
export { default as AuthResendButton, type AuthResendButtonProps } from './AuthResendButton'
export { default as AuthRedirectChip, type AuthRedirectChipProps } from './AuthRedirectChip'
export { default as AuthCodeInput, type AuthCodeInputProps } from './AuthCodeInput'
export { default as AuthTextField, type AuthTextFieldProps } from './AuthTextField'
export {
  default as PasswordStrengthMeter,
  type PasswordStrengthMeterProps,
} from './PasswordStrengthMeter'
export {
  default as AuthStepProgress,
  type AuthStepProgressProps,
  type AuthStepProgressStep,
} from './AuthStepProgress'
export { default as AuthCopyField, type AuthCopyFieldProps } from './AuthCopyField'
export { default as AuthQrPanel, type AuthQrPanelProps } from './AuthQrPanel'
export { default as SecurityMethodCard, type SecurityMethodCardProps } from './SecurityMethodCard'
export {
  default as DevicePlatformIcon,
  resolveDevicePlatform,
  type DevicePlatformIconProps,
  type DevicePlatform,
} from './DevicePlatformIcon'
export { default as AuthConfirmDrawer, type AuthConfirmDrawerProps } from './AuthConfirmDrawer'
export {
  default as AuthSocialButton,
  type AuthSocialButtonProps,
  type AuthSocialProvider,
} from './AuthSocialButton'
export { type AuthTone } from './authTone'
