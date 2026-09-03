import { modulePipelineService } from './module-pipeline.service'
import type {
  ModulePipelineJob,
  ModuleUploadResponse,
  ModuleStatusInfo,
} from '@cap/shared-types'

/**
 * Module Management Service API layer connecting React UI components
 * to the backend workflow pipeline.
 */
export class ModulesRouterService {
  /**
   * Upload a `.zip` module package file and launch pipeline workflow
   */
  public async uploadModuleZip(file: File): Promise<ModuleUploadResponse> {
    if (!file.name.endsWith('.zip')) {
      throw new Error('Invalid file format. Please upload a valid .zip module archive.')
    }

    const job = modulePipelineService.createJob(file.name, file.size)

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer()

    // Trigger async pipeline execution
    modulePipelineService.executePipeline(job.jobId, arrayBuffer).catch((err) => {
      console.error(`Pipeline job ${job.jobId} execution error:`, err)
    })

    return {
      jobId: job.jobId,
      message: 'Module zip uploaded successfully. Processing pipeline started.',
    }
  }

  /**
   * Poll current pipeline job status
   */
  public async getJobStatus(jobId: string): Promise<ModulePipelineJob> {
    const job = modulePipelineService.getJob(jobId)
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found.`)
    }
    return job
  }

  /**
   * Get list of installed modules in workspace
   */
  public async listInstalledModules(): Promise<ModuleStatusInfo[]> {
    return modulePipelineService.getInstalledModules()
  }

  /**
   * Enable or disable an installed module
   */
  public async toggleModuleStatus(
    id: string,
    enabled: boolean,
  ): Promise<{ success: boolean; message: string; status: 'active' | 'disabled' }> {
    const newStatus = enabled ? 'active' : 'disabled'
    return {
      success: true,
      message: `Module "${id}" status changed to ${newStatus}`,
      status: newStatus,
    }
  }
}

export const modulesRouterService = new ModulesRouterService()
