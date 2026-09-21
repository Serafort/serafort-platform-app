// Loose read-model of the signed-in user as the profile screen consumes it.
//
// The profile endpoint and the auth store describe the same person with
// slightly different spellings (`firstname`/`firstName`, `phone`/`phoneNumber`,
// `avatar`/`avatarUrl`, profile fields nested or flattened). This interface
// names every alias the screen reads so no `any` is needed to reach them.

export interface ProfileFieldBag {
  jobTitle?: string | null
  department?: string | null
  company?: string | null
  location?: string | null
  website?: string | null
  bio?: string | null
  biography?: string | null
  timezone?: string | null
  locale?: string | null
  language?: string | null
  dateFormat?: string | null
  emailOnNewDeviceLogin?: boolean | null
  emailOnComment?: boolean | null
  emailOnCommentReply?: boolean | null
  emailOnAchievement?: boolean | null
  emailOnWatchlist?: boolean | null
  emailOnMention?: boolean | null
}

export interface ProfileUserView extends ProfileFieldBag {
  firstname?: string | null
  lastname?: string | null
  displayName?: string | null
  name?: string | null
  phoneNumber?: string | null
  avatar?: string | null
  avatarUrl?: string | null
  plane?: string | null
  role?: unknown
  roleName?: unknown
  roleObject?: unknown
  emailVerified?: boolean
  isEmailVerified?: boolean
  lastLoginAt?: string | null
  profile?: ProfileFieldBag | null
}

/** Server-side validation errors keyed by field: `{ email: ['is taken'] }`. */
export type FieldErrorMap = Record<string, string | string[]>

/** Pull a `{ field: message }` map out of an API error, if it carries one. */
export function extractFieldErrors(error: unknown): FieldErrorMap | null {
  const e = error as {
    data?: { errors?: unknown }
    response?: { data?: { errors?: unknown } }
  } | null
  const raw = e?.data?.errors || e?.response?.data?.errors
  return raw && typeof raw === 'object' ? (raw as FieldErrorMap) : null
}
