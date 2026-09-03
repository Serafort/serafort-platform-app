import type IUser from './IUser'
import type IOrganization from './IOrganization'
import type IRole from "@auth/modules/authorization-engine/types/IRole"

export default interface IOrganizationMember {
  id: number
  organizationId: number
  userId: number
  roleId: number
  isOwner?: boolean
  createdAt?: string
  updatedAt?: string
  user?: IUser
  role?: IRole
  organization?: IOrganization
}
