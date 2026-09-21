import type { CAPModule } from "./module";

/**
 * Stages of the module package inspection pipeline.
 *
 * The pipeline runs entirely in the browser against the bytes of a locally
 * selected `.zip`. It reads, inspects and validates the archive; it does not
 * install anything, because there is no module-install backend to install to.
 */
export type PipelineStage =
  | "IDLE"
  | "READING"
  | "INSPECTING"
  | "VALIDATING"
  | "COMPLETE"
  | "FAILED";

export type StageState = "pending" | "in_progress" | "success" | "error";

export interface PipelineStageProgress {
  stage: PipelineStage;
  label: string;
  status: StageState;
  message?: string;
  startedAt?: string;
  completedAt?: string;
}

/** A single file entry discovered inside an inspected archive. */
export interface ArchiveEntryInfo {
  /** Path as recorded in the archive, relative to the module root. */
  path: string;
  compressedSize: number;
  uncompressedSize: number;
}

export interface ModulePipelineJob {
  jobId: string;
  filename: string;
  fileSizeBytes: number;
  currentStage: PipelineStage;
  stages: PipelineStageProgress[];
  logs: string[];
  moduleId?: string;
  moduleName?: string;
  version?: string;
  /** Populated once the VALIDATING stage has run. */
  validation?: ModuleContractValidationResult;
  /** Real counts read out of the archive, not estimates. */
  entryCount?: number;
  uncompressedBytes?: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleUploadResponse {
  jobId: string;
  message: string;
}

/**
 * Live facts about one module known to the shell, derived from the module
 * registry rather than from a static list.
 */
export interface ModuleStatusInfo {
  id: string;
  name: string;
  version: string;
  description?: string;
  status: "active" | "disabled" | "error";
  /** Routes the module declares via `routes` / `authRouteConfig`. */
  routeCount: number;
  /** Navigation entries the module contributes to the shell menu. */
  navCount: number;
  /** Command-palette entries the module contributes. */
  searchCount: number;
  /** Locales the module ships a dictionary for, e.g. `['en','fr','ar']`. */
  locales: string[];
  /**
   * True when the shell cannot boot without the module, which is why its
   * enable/disable switch is locked.
   */
  isCore: boolean;
  /** Present only for modules registered at runtime; built-ins have no install date. */
  installedAt?: string;
}

export interface ModuleContractValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  manifest?: Partial<CAPModule>;
}
