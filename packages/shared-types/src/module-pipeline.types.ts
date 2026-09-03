import type { CAPModule } from './module'

export type PipelineStage =
  | 'IDLE'
  | 'UPLOADING'
  | 'EXTRACTING'
  | 'VALIDATING_CONTRACT'
  | 'RUNNING_TESTS'
  | 'PROMOTING'
  | 'COMPLETE'
  | 'FAILED'

export type StageState = 'pending' | 'in_progress' | 'success' | 'error'

export interface PipelineStageProgress {
  stage: PipelineStage
  label: string
  status: StageState
  message?: string
  startedAt?: string
  completedAt?: string
}

export interface ModulePipelineJob {
  jobId: string
  filename: string
  fileSizeBytes: number
  currentStage: PipelineStage
  stages: PipelineStageProgress[]
  logs: string[]
  moduleId?: string
  moduleName?: string
  version?: string
  error?: string
  createdAt: string
  updatedAt: string
}

export interface ModuleUploadResponse {
  jobId: string
  message: string
}

export interface ModuleStatusInfo {
  id: string
  name: string
  version: string
  description?: string
  status: 'active' | 'disabled' | 'error'
  routeCount: number
  navCount: number
  installedAt: string
  isCore?: boolean
}

export interface ModuleContractValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  manifest?: Partial<CAPModule>
}
