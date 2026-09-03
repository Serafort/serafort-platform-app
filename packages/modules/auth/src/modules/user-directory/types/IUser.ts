import IProfile from './IProfile'
import IRole from '@auth/modules/authorization-engine/types/IRole'
import ISessionLog from '@auth/modules/session-manager/types/ISessionLog'

export default interface IUser {
  id: number
  roleId: number
  firstName: string
  lastName: string
  sexe?: string
  phone?: string
  email: string
  avatarUrl?: string
  avatar?: string
  avatarLarge?: string
  emailVerified?: string | null
  emailVerifiedAt?: string | null
  billToInfo?: string | null
  isEnabledProfile?: boolean
  isEnabledMiniPlayer?: boolean
  isEnabledAutoplayNext?: boolean
  isEnabledMentions?: boolean
  isActif?: boolean
  isTermsSign?: boolean
  createByUserId?: number
  mfaSecret?: string | null
  mfaEnabled?: boolean
  mfaRecoveryCodes?: string | null
  totpSecret?: string | null
  mfaEnrolledAt?: string | null
  lastLoginAt?: string | null
  status?: string
  scimExternalId?: string | null
  isAdmin?: boolean
  isParticipant?: boolean
  isEmailVerified?: boolean
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  role?: IRole
  profile?: IProfile
  sessions?: Array<ISessionLog>
}
