/**
 * The one place a widget generation run is started.
 *
 * Three modules used to POST `/api/v1/widgets/generate` independently -
 * `runAgentPipeline` in the orchestrator, `executeBackendAgentPipeline` in the
 * agent client, and `useGenerateWidget`'s mutationFn - each building its own
 * body and handling failure its own way. They had already drifted: two
 * hard-coded `userId: 1` under a comment saying the server resolves it from
 * the auth token, and their `providerType` fallbacks disagreed (a literal
 * "gemini" in one, the store's selection in another), so which provider ran
 * depended on which code path you came through.
 *
 * Everything now goes through `buildGeneratePayload` and `attachPipelineRun`.
 * The three public entry points remain, as thin wrappers.
 */
import { useAppStore } from "@cap/platform-store";
import { apiClient, type FetchResponse } from "@cap/platform-core";
import type { WidgetDefinition } from "@cap/shared-types";
import {
  connectPipelineStream,
  disconnectStream,
} from "../services/widgetAgentClient";

export interface PipelineRunOptions {
  /** Draft ID in the Zustand store to update */
  draftId: string;
  /** Sanitized user prompt */
  prompt: string;
  /** Override the AI provider type (defaults to the store's selection) */
  providerType?: string;
  /** Override the AI model (defaults to the store's selection) */
  model?: string;
  /** Whether to auto-publish after successful validation */
  autoPublish?: boolean;
  /** Target dashboard page */
  pageId?: string;
  /**
   * The definition being revised, for a refinement run. A backend that does
   * not understand these fields simply regenerates from the prompt, which
   * already reads as an edit - see buildRefinementPrompt.
   */
  baseDsl?: WidgetDefinition;
  /** The draft this run refines. */
  parentDraftId?: string;
  /** The instruction that triggered the refinement, e.g. "last 12 months". */
  refinement?: string;
}

export interface PipelineRunResponse {
  success: boolean;
  runId: number;
  status: string;
  sseUrl: string;
  error?: string;
}

export interface PipelineRunResult {
  success: boolean;
  runId?: number;
  dsl?: WidgetDefinition;
  error?: string;
}

/** The request body, built once so every caller sends the same thing. */
export function buildGeneratePayload(
  options: PipelineRunOptions,
): Record<string, unknown> {
  const store = useAppStore.getState();
  // The server resolves the caller from the auth token; sending a fabricated
  // `userId: 1` alongside it - which two of the three callers did - can only
  // mislead an audit trail. Send the real id when the session has one, and
  // otherwise let the token speak for itself.
  const auth = store.user;
  const userId = auth?.user?.id ?? auth?.id;

  return {
    draftId: options.draftId,
    prompt: options.prompt,
    ...(userId !== undefined && userId !== null ? { userId } : {}),
    providerType: options.providerType || store.selectedProvider,
    model: options.model || store.selectedModel,
    autoPublish: options.autoPublish ?? false,
    pageId: options.pageId ?? "dashboard",
    runAsync: true,
    ...(options.baseDsl ? { baseDsl: options.baseDsl } : {}),
    ...(options.parentDraftId
      ? { parentDraftId: options.parentDraftId }
      : {}),
    ...(options.refinement ? { refinement: options.refinement } : {}),
  };
}

/** POST the run. Callers own their own error handling. */
export function requestPipelineRun(
  options: PipelineRunOptions,
): Promise<FetchResponse<PipelineRunResponse>> {
  return apiClient.post<PipelineRunResponse>(
    "/api/v1/widgets/generate",
    buildGeneratePayload(options),
  );
}

/** Mark the run as failed before it ever started, in one shape. */
export function failPipelineRun(draftId: string, error: string): void {
  const store = useAppStore.getState();
  store.updateWidgetAgent(draftId, "requirement", {
    status: "error",
    error,
  });
  store.setWidgetStudioRunning(false);
}

/**
 * Turn a `/generate` response into a live run: connect the SSE stream on
 * success, mark the pipeline failed on anything else.
 */
export function attachPipelineRun(
  data: PipelineRunResponse | undefined,
  options: PipelineRunOptions & {
    onComplete?: (dsl?: WidgetDefinition) => void;
    onError?: (error: string) => void;
  },
): PipelineRunResult {
  if (!data?.success || !data.runId) {
    const error =
      data?.error || "Failed to initialize agent pipeline run on server";
    failPipelineRun(options.draftId, error);
    options.onError?.(error);
    return { success: false, error };
  }

  // The draft remembers its run, which is how the panel later asks the
  // server for that run's audit trail.
  useAppStore.getState().setDraftRunId(options.draftId, data.runId);

  connectPipelineStream({
    runId: data.runId,
    draftId: options.draftId,
    prompt: options.prompt,
    autoPublish: options.autoPublish,
    onComplete: options.onComplete,
    onError: options.onError,
  });

  return { success: true, runId: data.runId };
}

/**
 * Start a run and return as soon as the stream is connected.
 * Imperative entry point for contexts without React hooks.
 */
export async function startPipelineRun(
  options: PipelineRunOptions & {
    onComplete?: (dsl?: WidgetDefinition) => void;
    onError?: (error: string) => void;
  },
): Promise<PipelineRunResult> {
  const store = useAppStore.getState();
  store.setWidgetStudioRunning(true);
  store.setWidgetLifecycle(options.draftId, "draft");

  try {
    const response = await requestPipelineRun(options);
    return attachPipelineRun(response.data, options);
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    failPipelineRun(options.draftId, error);
    options.onError?.(error);
    return { success: false, error };
  }
}

/**
 * Start a run and wait for it to finish.
 * Resolves when the pipeline completes, fails or is cancelled.
 */
export async function executeBackendAgentPipeline(
  options: PipelineRunOptions & { userId?: string | number },
): Promise<{ success: boolean; dsl?: WidgetDefinition; error?: string }> {
  return new Promise((resolve) => {
    startPipelineRun({
      ...options,
      onComplete: (dsl) => resolve({ success: true, dsl }),
      onError: (error) => resolve({ success: false, error }),
    }).then((result) => {
      // Never connected, so no stream callback is coming.
      if (!result.success) resolve({ success: false, error: result.error });
    });
  });
}

/**
 * Stop a run from the UI: drop the stream, tell the backend, and put the
 * panel back into a usable state.
 *
 * `cancelBackendAgentPipeline` existed but nothing called it, so a run that
 * stalled left `widgetStudioRunning` true with no way out but a reload. The
 * local teardown happens first and unconditionally - whether the backend
 * acknowledges the cancel is its own business, and a failed POST must not
 * leave the user stuck.
 */
export async function stopPipelineRun(
  runId: number,
  draftId?: string,
): Promise<boolean> {
  const store = useAppStore.getState();

  disconnectStream(runId);
  store.setWidgetStudioRunning(false);
  store.setActiveRunId(null);

  if (draftId) {
    const draft = store.widgetDrafts.find((d) => d.id === draftId);
    for (const agent of draft?.agents ?? []) {
      if (agent.status === "running") {
        store.updateWidgetAgent(draftId, agent.id, {
          status: "error",
          error: "Stopped",
          completedAt: new Date().toISOString(),
        });
      }
    }
  }

  const { success } = await cancelBackendAgentPipeline(runId);
  return success;
}

/** Cancel an active run on the backend. */
export async function cancelBackendAgentPipeline(
  runId: number,
): Promise<{ success: boolean }> {
  try {
    const response = await apiClient.post<{ success: boolean }>(
      `/api/v1/widgets/runs/${runId}/cancel`,
      {},
    );
    return response.data || { success: false };
  } catch {
    return { success: false };
  }
}
