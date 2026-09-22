/**
 * Auto-generated / synchronized from Authentication backend.
 * Source: Authentication/app/contracts/dtos/progressive_profiling_dto.ts
 * DO NOT EDIT DIRECTLY - Use scripts/sync-contracts.mjs
 */

/**
 * Progressive Profiling DTOs.
 * Backs `app/services/profiling/progressive_profiling_service.ts`,
 * `app/controllers/admin/profiling_rules_controller.ts` and
 * `app/controllers/api/v1/profile_attributes_controller.ts`.
 */

export type ProfilingAttributeType = 'string' | 'number' | 'boolean' | 'date'

/** A tenant-defined free-form attribute — never a fixed enum. */
export interface ProfilingTargetAttributeDTO {
  key: string
  label: string
  type: ProfilingAttributeType
  required?: boolean
}

export interface ProfilingTriggerConfigDTO {
  /** Only meaningful when `triggerType === 'login_count'`. */
  minLoginCount?: number
  /** Only meaningful when `triggerType === 'route_access'`. Supports a
   * trailing `*` wildcard, e.g. `/billing/*`. */
  routePattern?: string
}

export interface ProfilingRuleDTO {
  id: string
  organizationId: string
  name: string
  description?: string | null
  triggerType: 'login_count' | 'route_access'
  triggerConfig: ProfilingTriggerConfigDTO
  targetAttributes: ProfilingTargetAttributeDTO[]
  isActive: boolean
  priority: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateProfilingRuleDTO {
  name: string
  description?: string
  triggerType: 'login_count' | 'route_access'
  triggerConfig: ProfilingTriggerConfigDTO
  targetAttributes: ProfilingTargetAttributeDTO[]
  isActive?: boolean
  priority?: number
}

export type UpdateProfilingRuleDTO = Partial<CreateProfilingRuleDTO>

/** A single attribute the caller must still supply — response shape of both
 * `GET /api/v1/profile/pending-fields` and the trailing `pendingFields` on
 * `POST /api/v1/profile/attributes`. */
export interface PendingProfileFieldDTO {
  key: string
  label: string
  type: ProfilingAttributeType
  required: boolean
  ruleId: string | null
  ruleName: string | null
}

export interface PendingProfileFieldsResponseDTO {
  pendingFields: PendingProfileFieldDTO[]
}

export interface SubmitProfileAttributesRequestDTO {
  attributes: Array<{
    key: string
    value: string | number | boolean
  }>
}

export interface SubmitProfileAttributesResponseDTO {
  accepted: string[]
  rejected: Array<{ key: string; reason: string }>
  pendingFields: PendingProfileFieldDTO[]
}
