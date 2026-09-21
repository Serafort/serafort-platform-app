import type {
  ModulePipelineJob,
  PipelineStage,
  StageState,
  PipelineStageProgress,
  ModuleContractValidationResult,
  CAPModule,
} from '@cap/shared-types'
import { ModuleRegistry } from '../assembly/ModuleRegistry'
import { readZipArchive, ZipFormatError, type ZipEntry } from '../utils/zip-reader'

/**
 * Inspection pipeline for candidate module packages.
 *
 * Everything here runs against the real bytes of the selected `.zip` in the
 * browser: the archive is parsed, its entry names are checked for path
 * traversal, and its manifest is validated against the CAPModule contract.
 *
 * The pipeline deliberately stops there. Installing a module means writing
 * into `packages/modules/` and rebuilding the workspace, which a browser
 * cannot do and for which no backend endpoint exists, so the pipeline reports
 * what it found instead of pretending to deploy.
 */

/** Refuse archives whose contents would expand beyond this, as a zip-bomb guard. */
const MAX_TOTAL_UNCOMPRESSED_BYTES = 200 * 1024 * 1024
/** Compression ratios above this, on a non-trivial payload, indicate a zip bomb. */
const MAX_COMPRESSION_RATIO = 100
const RATIO_CHECK_MIN_BYTES = 10 * 1024 * 1024

const MANIFEST_FILENAME = 'module.manifest.json'
const PACKAGE_FILENAME = 'package.json'

const ENTRY_POINT_CANDIDATES = [
  'src/index.ts',
  'src/index.tsx',
  'src/index.js',
  'src/index.mjs',
  'index.ts',
  'index.tsx',
  'index.js',
  'index.mjs',
  'dist/index.js',
  'dist/index.mjs',
]

// In-memory store for inspection jobs, scoped to the page session.
const activeJobs = new Map<string, ModulePipelineJob>()

function createInitialStages(): PipelineStageProgress[] {
  return [
    { stage: 'READING', label: 'Read Archive', status: 'pending' },
    { stage: 'INSPECTING', label: 'Inspect Entries & Path Safety', status: 'pending' },
    { stage: 'VALIDATING', label: 'Validate CAPModule Contract', status: 'pending' },
  ]
}

/**
 * True when an archive entry name is safe to extract, i.e. it stays inside the
 * extraction root. Checked against the names recorded in the archive itself,
 * which is where a Zip Slip payload would hide.
 */
export const isEntryPathSafe = (name: string): boolean => {
  if (!name || name.includes('\0')) return false
  // Backslashes are not legal ZIP separators; they are used to slip past naive checks.
  if (name.includes('\\')) return false
  if (name.startsWith('/')) return false
  if (/^[a-zA-Z]:/.test(name)) return false
  return !name.split('/').includes('..')
}

/**
 * Strips a single shared top-level folder, which is what most archives look
 * like when a module directory is zipped from its parent.
 */
const detectRootPrefix = (entries: ZipEntry[]): string => {
  const topLevels = new Set<string>()
  for (const entry of entries) {
    const head = entry.name.split('/')[0]
    if (!head) return ''
    topLevels.add(head)
    if (topLevels.size > 1) return ''
  }
  const [only] = [...topLevels]
  if (!only) return ''
  // Only treat it as a wrapper when nothing sits at the root beside it.
  const isWrapper = entries.every((entry) => entry.name.startsWith(`${only}/`))
  return isWrapper ? `${only}/` : ''
}

export class ModulePipelineService {
  public createJob(filename: string, fileSizeBytes: number): ModulePipelineJob {
    const jobId = `job_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`
    const now = new Date().toISOString()

    const job: ModulePipelineJob = {
      jobId,
      filename,
      fileSizeBytes,
      currentStage: 'READING',
      stages: createInitialStages(),
      logs: [`[SYSTEM] Inspecting ${filename} (${fileSizeBytes.toLocaleString()} bytes)`],
      createdAt: now,
      updatedAt: now,
    }

    activeJobs.set(jobId, job)
    return job
  }

  public getJob(jobId: string): ModulePipelineJob | undefined {
    return activeJobs.get(jobId)
  }

  private updateJobStage(
    jobId: string,
    stage: PipelineStage,
    status: StageState,
    message?: string,
  ): ModulePipelineJob {
    const job = activeJobs.get(jobId)
    if (!job) throw new Error(`Job ${jobId} not found`)

    job.currentStage = stage
    job.updatedAt = new Date().toISOString()

    const stageIdx = job.stages.findIndex((s) => s.stage === stage)
    if (stageIdx !== -1) {
      job.stages[stageIdx].status = status
      if (message) job.stages[stageIdx].message = message
      if (status === 'in_progress') job.stages[stageIdx].startedAt = job.updatedAt
      if (status === 'success' || status === 'error') job.stages[stageIdx].completedAt = job.updatedAt
    }

    if (message) job.logs.push(`[${new Date().toLocaleTimeString()}] [${stage}] ${message}`)

    return job
  }

  /**
   * Validates a candidate module's manifest and layout against the CAPModule
   * contract, using files actually present in the archive.
   *
   * @param manifestSources Parsed contents of `module.manifest.json` and/or
   * `package.json`, keyed by filename; absent files are simply missing.
   * @param filePaths Every file path in the archive, relative to the module root.
   */
  public validateModuleContract(
    manifestSources: Partial<Record<string, string>>,
    filePaths: string[],
  ): ModuleContractValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const manifest: Partial<CAPModule> = {}

    const manifestRaw = manifestSources[MANIFEST_FILENAME]
    const packageRaw = manifestSources[PACKAGE_FILENAME]

    if (manifestRaw) {
      try {
        const parsed = JSON.parse(manifestRaw)
        Object.assign(manifest, parsed)
      } catch (err: any) {
        errors.push(`Failed to parse ${MANIFEST_FILENAME}: ${err.message}`)
      }
    } else if (packageRaw) {
      try {
        const pkg = JSON.parse(packageRaw)
        manifest.id = pkg.name?.replace(/^@[^/]+\/(module-)?/, '')
        manifest.version = pkg.version
        manifest.name = pkg.displayName
        manifest.description = pkg.description
        warnings.push(
          `No ${MANIFEST_FILENAME} found; the contract was inferred from ${PACKAGE_FILENAME}.`,
        )
      } catch (err: any) {
        errors.push(`Failed to parse ${PACKAGE_FILENAME}: ${err.message}`)
      }
    } else {
      errors.push(`Archive contains neither ${MANIFEST_FILENAME} nor ${PACKAGE_FILENAME}.`)
    }

    if (!manifest.id) {
      errors.push('Module id is required (manifest `id`, or package `name`).')
    } else if (!/^[a-z0-9-]+$/.test(manifest.id)) {
      errors.push(
        `Invalid module id "${manifest.id}". Use lowercase letters, digits and hyphens only.`,
      )
    } else if (ModuleRegistry.getInstance().getModules().some((m) => m.id === manifest.id)) {
      errors.push(`A module with id "${manifest.id}" is already registered in this shell.`)
    }

    if (!manifest.version) {
      errors.push('Module version is required.')
    } else if (!/^\d+\.\d+\.\d+/.test(manifest.version)) {
      warnings.push(`Version "${manifest.version}" is not semantic versioning (major.minor.patch).`)
    }

    const entryPoint = ENTRY_POINT_CANDIDATES.find((candidate) => filePaths.includes(candidate))
    if (!entryPoint) {
      errors.push(
        `Missing entry point. Expected one of: ${ENTRY_POINT_CANDIDATES.slice(0, 4).join(', ')}.`,
      )
    }

    if (!manifest.description) {
      warnings.push('No description provided; the module will list without one.')
    }
    if (!filePaths.some((p) => /dictionaries?\/.+\.json$/i.test(p) || /(^|\/)i18n\//i.test(p))) {
      warnings.push('No i18n dictionaries found; the module may ship untranslated strings.')
    }
    if (!filePaths.some((p) => /\.(test|spec)\.[tj]sx?$/.test(p))) {
      warnings.push('No test files found in the package.')
    }

    return { valid: errors.length === 0, errors, warnings, manifest }
  }

  /**
   * Runs the full inspection against the archive bytes.
   *
   * Resolves with the job in either `COMPLETE` or `FAILED`; it does not throw
   * for invalid packages, since an invalid package is a result, not a crash.
   */
  public async inspectArchive(jobId: string, zipContent: ArrayBuffer): Promise<ModulePipelineJob> {
    const job = activeJobs.get(jobId)
    if (!job) throw new Error(`Job ${jobId} not found`)

    try {
      // STAGE 1 — read the bytes and parse the archive structure.
      this.updateJobStage(jobId, 'READING', 'in_progress', 'Parsing ZIP central directory...')

      const archive = readZipArchive(zipContent)
      const files = archive.entries.filter((entry) => !entry.isDirectory)

      if (files.length === 0) {
        throw new ZipFormatError('The archive contains no files.')
      }

      this.updateJobStage(
        jobId,
        'READING',
        'success',
        `Read ${files.length} file${files.length === 1 ? '' : 's'} from the archive.`,
      )

      // STAGE 2 — path safety and expansion limits, against real entry names.
      this.updateJobStage(
        jobId,
        'INSPECTING',
        'in_progress',
        'Checking entry paths for traversal and expansion limits...',
      )

      const unsafe = archive.entries.filter((entry) => !isEntryPathSafe(entry.name))
      if (unsafe.length > 0) {
        throw new Error(
          `Zip Slip check failed. Unsafe entry path${unsafe.length === 1 ? '' : 's'}: ` +
            unsafe
              .slice(0, 5)
              .map((entry) => `"${entry.name}"`)
              .join(', '),
        )
      }

      const uncompressedBytes = files.reduce((sum, entry) => sum + entry.uncompressedSize, 0)
      const compressedBytes = files.reduce((sum, entry) => sum + entry.compressedSize, 0)

      if (uncompressedBytes > MAX_TOTAL_UNCOMPRESSED_BYTES) {
        throw new Error(
          `Archive expands to ${(uncompressedBytes / 1024 / 1024).toFixed(1)} MB, above the ` +
            `${MAX_TOTAL_UNCOMPRESSED_BYTES / 1024 / 1024} MB inspection limit.`,
        )
      }
      if (
        uncompressedBytes > RATIO_CHECK_MIN_BYTES &&
        compressedBytes > 0 &&
        uncompressedBytes / compressedBytes > MAX_COMPRESSION_RATIO
      ) {
        throw new Error(
          `Suspicious compression ratio (${Math.round(uncompressedBytes / compressedBytes)}:1). ` +
            'The archive was rejected as a possible zip bomb.',
        )
      }

      job.entryCount = files.length
      job.uncompressedBytes = uncompressedBytes

      const rootPrefix = detectRootPrefix(files)
      if (rootPrefix) {
        job.logs.push(`[SYSTEM] Module root detected at "${rootPrefix}"`)
      }

      this.updateJobStage(
        jobId,
        'INSPECTING',
        'success',
        `All entry paths safe. Expands to ${(uncompressedBytes / 1024).toFixed(1)} KB.`,
      )

      // STAGE 3 — read the manifest and validate the contract.
      this.updateJobStage(
        jobId,
        'VALIDATING',
        'in_progress',
        'Reading manifest and validating the CAPModule contract...',
      )

      const relativePaths = files.map((entry) => entry.name.slice(rootPrefix.length))
      const manifestSources: Partial<Record<string, string>> = {}

      for (const filename of [MANIFEST_FILENAME, PACKAGE_FILENAME]) {
        const entry = files.find((file) => file.name === `${rootPrefix}${filename}`)
        if (!entry) continue
        try {
          manifestSources[filename] = await archive.readText(entry)
          job.logs.push(`[SYSTEM] Read ${filename} (${entry.uncompressedSize} bytes)`)
        } catch (err: any) {
          job.logs.push(`[WARN] Could not read ${filename}: ${err.message}`)
        }
      }

      const validation = this.validateModuleContract(manifestSources, relativePaths)
      job.validation = validation
      job.moduleId = validation.manifest?.id
      job.moduleName = validation.manifest?.name || validation.manifest?.id
      job.version = validation.manifest?.version

      validation.warnings.forEach((warning) => job.logs.push(`[WARN] ${warning}`))

      if (!validation.valid) {
        validation.errors.forEach((error) => job.logs.push(`[ERROR] ${error}`))
        this.updateJobStage(
          jobId,
          'VALIDATING',
          'error',
          `Contract validation failed with ${validation.errors.length} error${
            validation.errors.length === 1 ? '' : 's'
          }.`,
        )
        job.currentStage = 'FAILED'
        job.error = validation.errors[0]
        return job
      }

      this.updateJobStage(
        jobId,
        'VALIDATING',
        'success',
        `Contract valid for "${job.moduleId}" v${job.version}.`,
      )

      job.currentStage = 'COMPLETE'
      job.updatedAt = new Date().toISOString()
      job.logs.push(
        '[SYSTEM] Inspection complete. This package was validated, not installed: ' +
          'installing a module writes into packages/modules/ and rebuilds the workspace, ' +
          'which the browser cannot do.',
      )

      return job
    } catch (err: any) {
      const message = err?.message || 'Archive inspection failed.'
      const activeStage = job.stages.find((s) => s.status === 'in_progress')
      if (activeStage) {
        this.updateJobStage(jobId, activeStage.stage, 'error', message)
      }
      job.currentStage = 'FAILED'
      job.error = message
      job.updatedAt = new Date().toISOString()
      job.logs.push(`[ERROR] ${message}`)
      return job
    }
  }
}

export const modulePipelineService = new ModulePipelineService()
