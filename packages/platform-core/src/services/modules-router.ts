import { modulePipelineService } from './module-pipeline.service'
import { moduleInventoryService } from './module-inventory.service'
import { moduleEnablementService } from './module-enablement.service'
import type { ModulePipelineJob, ModuleUploadResponse, ModuleStatusInfo } from '@cap/shared-types'

/** Archives larger than this are rejected before any parsing work starts. */
const MAX_ARCHIVE_BYTES = 50 * 1024 * 1024

/**
 * Facade the Module Management screen talks to. It reads the live module
 * registry and the persisted enablement state; there is no module backend
 * behind it, and nothing here pretends otherwise.
 */
export class ModulesRouterService {
  /**
   * Reads a candidate `.zip` and starts its inspection. Resolves as soon as
   * the job exists so the caller can render progress while it runs.
   */
  public async uploadModuleZip(file: File): Promise<ModuleUploadResponse> {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      throw new Error('Invalid file format. Please select a .zip module archive.')
    }
    if (file.size === 0) {
      throw new Error('That file is empty.')
    }
    if (file.size > MAX_ARCHIVE_BYTES) {
      throw new Error(`Archive exceeds the ${MAX_ARCHIVE_BYTES / 1024 / 1024} MB limit.`)
    }

    const job = modulePipelineService.createJob(file.name, file.size)
    const arrayBuffer = await file.arrayBuffer()

    modulePipelineService.inspectArchive(job.jobId, arrayBuffer).catch((err) => {
      console.error(`Inspection job ${job.jobId} failed unexpectedly:`, err)
    })

    return { jobId: job.jobId, message: 'Archive received. Inspection started.' }
  }

  /** Polls the current state of an inspection job. */
  public async getJobStatus(jobId: string): Promise<ModulePipelineJob> {
    const job = modulePipelineService.getJob(jobId)
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found.`)
    }
    return job
  }

  /** Every module registered in this shell, enabled or not. */
  public async listInstalledModules(): Promise<ModuleStatusInfo[]> {
    return moduleInventoryService.listModules()
  }

  /** Routes actually mounted in the router for the currently enabled modules. */
  public countRegisteredRoutes(): number {
    return moduleInventoryService.countRegisteredRoutes()
  }

  /**
   * Switches a module on or off. The change is persisted and takes effect in
   * the shell immediately — routes, menu entries and command-palette entries
   * follow it.
   */
  public async toggleModuleStatus(
    id: string,
    enabled: boolean,
  ): Promise<{ success: boolean; message: string; status: 'active' | 'disabled' }> {
    moduleEnablementService.setEnabled(id, enabled)
    const applied = moduleEnablementService.isEnabled(id)

    return {
      success: true,
      message: `Module "${id}" is now ${applied ? 'active' : 'disabled'}.`,
      status: applied ? 'active' : 'disabled',
    }
  }

  /** Subscribe to enablement changes (including from another browser tab). */
  public subscribe(listener: () => void): () => void {
    return moduleEnablementService.subscribe(listener)
  }
}

export const modulesRouterService = new ModulesRouterService()
