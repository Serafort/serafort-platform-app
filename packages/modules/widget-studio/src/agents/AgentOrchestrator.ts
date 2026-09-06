/**
 * Agent Orchestrator — Frontend coordinator for the Widget Studio pipeline.
 *
 * Delegates all pipeline execution to the backend via TanStack Query mutations.
 * The SSE stream tracker in `widgetAgentClient.ts` handles real-time UI updates.
 *
 * This module provides imperative helpers that can be called from non-hook contexts
 * (e.g. event handlers that already have access to the mutation functions).
 */
import type { WidgetDefinition } from "@cap/shared-types";
import { useAppStore } from "@cap/platform-store";
import { apiClient } from "@cap/platform-core";
import { disconnectStream } from "../services/widgetAgentClient";
import {
  adoptServerAuditEntries,
  buildClientAuditEntry,
} from "./auditTrail";
import {
  cancelBackendAgentPipeline,
  startPipelineRun,
  type PipelineRunOptions,
} from "./pipeline";

export type OrchestratorOptions = PipelineRunOptions;

export interface OrchestratorResult {
  success: boolean;
  runId?: number;
  dsl?: WidgetDefinition;
  error?: string;
}

/**
 * Run the full widget generation pipeline via the backend.
 *
 * This is an imperative wrapper for contexts where React hooks are not available.
 * In React components, prefer using `useGenerateWidget()` directly.
 */
export async function runAgentPipeline(
  options: OrchestratorOptions,
): Promise<OrchestratorResult> {
  return startPipelineRun(options);
}

/**
 * Publish a validated widget DSL to the dashboard via the backend API.
 *
 * Imperative wrapper for non-hook contexts. Prefer `usePublishWidget()` in components.
 */
export async function publishDraft(
  draftId: string,
  pageId = "dashboard",
): Promise<boolean> {
  const store = useAppStore.getState();
  const draft = store.widgetDrafts.find((d) => d.id === draftId);

  if (!draft?.dsl) {
    console.error("[AgentOrchestrator] No DSL found for draft:", draftId);
    return false;
  }

  store.updateWidgetAgent(draftId, "publish", {
    status: "running",
    startedAt: new Date().toISOString(),
  });

  try {
    const response = await apiClient.post<{ success: boolean; error?: string }>(
      "/api/v1/widgets/publish",
      {
        draftId,
        dsl: draft.dsl,
        pageId,
      },
    );

    if (response.data?.success) {
      store.setWidgetLifecycle(draftId, "published");
      store.updateWidgetAgent(draftId, "publish", {
        status: "done",
        completedAt: new Date().toISOString(),
      });

      // Add to local layout store for instant feedback
      const currentLayout = store.layouts?.[pageId];
      if (currentLayout) {
        const newSlotId = `${pageId}-ai-slot-${Date.now()}`;
        store.addSlot(
          pageId,
          newSlotId,
          {
            widgetId: draft.dsl.component,
            config: draft.dsl.props,
          } as any,
          {
            span: draft.dsl.layout.width as 4 | 8 | 12,
            height: draft.dsl.layout.height as 200 | 280 | 340 | 400,
          },
        );
      }

      const attested = adoptServerAuditEntries(
        (response.data as { audit?: unknown })?.audit,
        { widgetId: draft.dsl.id },
      );
      const entries = attested.length
        ? attested
        : [buildClientAuditEntry({ dsl: draft.dsl, action: "published" })];
      for (const entry of entries) {
        store.appendAuditEntry(draftId, entry);
      }

      return true;
    }

    store.updateWidgetAgent(draftId, "publish", {
      status: "error",
      error: response.data?.error || "Publish failed",
    });
    return false;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    store.updateWidgetAgent(draftId, "publish", {
      status: "error",
      error: errorMsg,
    });
    return false;
  }
}

/**
 * Cancel an active pipeline run.
 */
export async function cancelPipelineRun(runId: number): Promise<boolean> {
  disconnectStream(runId);
  const { success } = await cancelBackendAgentPipeline(runId);
  return success;
}
