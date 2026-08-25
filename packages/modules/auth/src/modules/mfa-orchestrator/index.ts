// Screens & path
export * from './screens'
export { default as MFAPath } from './screens/path'

// Step-Up Authentication — new V2 exports
export { StepUpAuthDialog } from './components/StepUpAuthDialog'
export type { StepUpAuthDialogProps } from './components/StepUpAuthDialog'
export { useStepUpAuth } from './hooks/useStepUpAuth'
export type { StepUpActionMetadata, StepUpAuthState } from './hooks/useStepUpAuth'
export { useStepUpBiometricVerify, useStepUpTotpVerify } from './hooks'

import { mfaOrchestratorDictionaries, registerDictionary } from './i18n/registry'

registerDictionary(mfaOrchestratorDictionaries as any)
