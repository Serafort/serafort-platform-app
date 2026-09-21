/**
 * GDPR self-service and compliance-reporting types.
 *
 * Mirrors `ComplianceController`. Where the backend is a placeholder, the type
 * says so rather than describing a richer shape that would let a screen render
 * invented detail as fact.
 */

/**
 * The consent purposes the backend accepts.
 *
 * `UserConsent.purpose` is a fixed union and `updateConsentValidator` enforces
 * it, so a purpose outside this list is rejected. The screen therefore offers
 * exactly these rather than free text.
 *
 * Note there is no "terms" or "privacy" purpose: acceptance of the terms and
 * the privacy policy is not modelled as a consent record in this backend, so a
 * checkbox for it here would write nothing.
 */
export const CONSENT_PURPOSES = [
  'marketing',
  'analytics',
  'data_sharing',
  'newsletter',
] as const

export type ConsentPurpose = (typeof CONSENT_PURPOSES)[number]

/**
 * A stored consent decision.
 *
 * The backend records `ipAddress` and `userAgent` at the moment of the decision
 * — that is the evidence half of Article 7(1), so the screen shows when and
 * from where a choice was made rather than only its current value.
 *
 * There is deliberately no version field: the backend has no consent- or
 * policy-version column anywhere, so re-consent on a policy change cannot be
 * detected. See the module notes in `ConsentManagement`.
 */
export interface UserConsent {
  id: number
  userId: number
  purpose: ConsentPurpose
  isGranted: boolean
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  updatedAt: string
}

export interface ConsentStatus {
  userId: number
  totalConsents: number
  allGranted: boolean
  consents: Array<{ purpose: ConsentPurpose; isGranted: boolean }>
}

export interface UpdateConsentPayload {
  purpose: ConsentPurpose
  isGranted: boolean
}

/**
 * An erasure request.
 *
 * The confirmation factor is the caller's current password, verified
 * server-side before `ErasureUserDataJob` is dispatched. `hardDelete`
 * distinguishes anonymisation from full removal.
 */
export interface ErasureRequestPayload {
  password: string
  hardDelete?: boolean
}

export interface ErasureRequestResponse {
  message: string
  userId: number
}

/**
 * One Article 30 record of processing activity.
 *
 * The backend returns a static, curated register — appropriate for a document
 * that describes intent rather than observed traffic, but it is hardcoded in
 * the controller rather than configurable, so it will not change without a
 * deploy.
 */
export interface ProcessingActivity {
  name: string
  purpose: string
  legalBasis: string
}

export interface ProcessingActivitiesResponse {
  activities: ProcessingActivity[]
}

/**
 * Retention figures.
 *
 * The backend currently returns fixed placeholder counts rather than querying
 * anything. The screen labels them as such — a retention report presented as
 * live data would be read as evidence in an audit.
 */
export interface RetentionReport {
  totalUsers: number
  activeUsers: number
  staleUsers: number
  scheduledPurges: number
  retentionPolicy: string
  lastCleanup: string
}

/** The phrase a user must type to confirm an irreversible erasure. */
export const ERASURE_CONFIRMATION_PHRASE = 'DELETE MY DATA'

/**
 * Whether the erasure request is ready to submit.
 *
 * Both factors are required and are deliberately different in kind: the typed
 * phrase proves intent (it cannot be produced by a stray click or an autofilled
 * form), and the password proves identity. Either alone is a weaker control
 * than the pair, so this returns false unless both are present.
 */
export function canSubmitErasure(input: {
  confirmationPhrase: string
  password: string
  acknowledged: boolean
}): boolean {
  return (
    input.acknowledged &&
    input.confirmationPhrase.trim() === ERASURE_CONFIRMATION_PHRASE &&
    input.password.length > 0
  )
}
