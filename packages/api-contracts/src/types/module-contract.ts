import {
  CAPModule,
  ModuleRouteConfig,
  ModuleRouteLayout,
  ModulePipelineJob,
  PipelineStage,
  ModuleStatusInfo,
  ModuleContractValidationResult,
} from '@cap/shared-types'

/**
 * IModuleContract is an alias for CAPModule to standardize the Lego-style
 * module contract across the application.
 */
export type IModuleContract = CAPModule
export type {
  ModuleRouteConfig,
  ModuleRouteLayout,
  ModulePipelineJob,
  PipelineStage,
  ModuleStatusInfo,
  ModuleContractValidationResult,
}
