/**
 * useWidgetStudioQuery — TanStack React Query hooks for Widget Studio.
 *
 * - `useGenerateWidget()` — Mutation: POST /api/v1/widgets/generate → returns { runId, sseUrl }
 * - `usePublishWidget()` — Mutation: POST /api/v1/widgets/publish → persists to dashboard layout
 * - `useWidgetRun(runId)` — Query: GET /api/v1/widgets/runs/:id → run details
 *
 * SSE live-tracking is handled separately in `widgetAgentClient.ts` (pushes to Zustand).
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  apiClient,
  type FetchResponse,
  type HttpError,
} from "@cap/platform-core";
import type { WidgetDefinition } from "@cap/shared-types";
import { useAppStore } from "@cap/platform-store";
import {
  attachPipelineRun,
  failPipelineRun,
  requestPipelineRun,
  type PipelineRunOptions,
  type PipelineRunResponse,
} from "../agents/pipeline";
import {
  adoptServerAuditEntries,
  buildClientAuditEntry,
} from "../agents/auditTrail";

// ─── Types ──────────────────────────────────────────────────────────────────

/**
 * The mutation takes the same options the pipeline does, so a refinement's
 * extra fields (baseDsl, parentDraftId, refinement) do not need a second
 * shape to travel in.
 */
export type GenerateWidgetRequest = PipelineRunOptions;

/** The wire shape is defined once, in ../agents/pipeline. */
export type GenerateWidgetResponse = PipelineRunResponse;

export interface PublishWidgetRequest {
  runId?: number;
  draftId: string;
  dsl: WidgetDefinition;
  pageId?: string;
  tenantId?: string | number;
}

export interface PublishWidgetResponse {
  success: boolean;
  widgetId?: string;
  slotId?: string;
  error?: string;
  /** Audit entries the backend recorded for this publish, when it sends them. */
  audit?: unknown;
}

export interface WidgetRunResponse {
  id: number;
  userId: number;
  status: string;
  startedAt: string;
  completedAt?: string;
  metadata: Record<string, unknown>;
  tasks: Array<{
    id: number;
    agentId: string;
    status: string;
    output?: unknown;
    error?: string;
  }>;
}

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const WIDGET_STUDIO_KEYS = {
  all: ["widget-studio"] as const,
  runs: () => ["widget-studio", "runs"] as const,
  run: (runId: number) => ["widget-studio", "runs", runId] as const,
  artifacts: () => ["widget-studio", "artifacts"] as const,
  audit: (runId: number) => ["widget-studio", "runs", runId, "audit"] as const,
  dashboardLayouts: () => ["dashboard", "layouts"] as const,
};

// ─── useGenerateWidget ──────────────────────────────────────────────────────

/**
 * Triggers the multi-agent widget generation pipeline on the backend.
 * After a successful POST, automatically connects the SSE stream to Zustand.
 */
export function useGenerateWidget(
  options?: UseMutationOptions<
    FetchResponse<GenerateWidgetResponse>,
    HttpError,
    GenerateWidgetRequest,
    unknown
  >,
) {
  const {
    onSuccess: customOnSuccess,
    onError: customOnError,
    onSettled: customOnSettled,
    ...restOptions
  } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: async (payload: GenerateWidgetRequest) => {
      const store = useAppStore.getState();

      // Set UI state
      store.setWidgetStudioRunning(true);
      store.setWidgetLifecycle(payload.draftId, "draft");

      return requestPipelineRun(payload);
    },
    onSuccess: (...args) => {
      const [response, variables] = args;
      // Connects the SSE stream, or records the failure - the same way every
      // other caller does.
      attachPipelineRun(response.data, variables);
      customOnSuccess?.(...args);
    },
    onError: (...args) => {
      const [error, variables] = args;
      failPipelineRun(variables.draftId, error.message || "Network error");
      customOnError?.(...args);
    },
    onSettled: (...args) => {
      customOnSettled?.(...args);
    },
  });
}

// ─── usePublishWidget ───────────────────────────────────────────────────────

/**
 * Publishes a validated widget DSL to the tenant's dashboard layout via backend API.
 * Invalidates dashboard layout caches on success.
 */
export function usePublishWidget(
  options?: UseMutationOptions<
    FetchResponse<PublishWidgetResponse>,
    HttpError,
    PublishWidgetRequest,
    unknown
  >,
) {
  const queryClient = useQueryClient();
  const {
    onSuccess: customOnSuccess,
    onError: customOnError,
    onSettled: customOnSettled,
    ...restOptions
  } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (payload: PublishWidgetRequest) =>
      apiClient.post<PublishWidgetResponse>("/api/v1/widgets/publish", {
        draftId: payload.draftId,
        dsl: payload.dsl,
        pageId: payload.pageId ?? "dashboard",
        tenantId: payload.tenantId,
        runId: payload.runId,
      }),
    onSuccess: (...args) => {
      const [response, variables] = args;
      const store = useAppStore.getState();
      if (response.data?.success) {
        store.setWidgetLifecycle(variables.draftId, "published");
        store.updateWidgetAgent(variables.draftId, "publish", {
          status: "done",
          completedAt: new Date().toISOString(),
        });

        // Publishing from the panel used to leave no trace at all: this hook
        // is the path the Publish button takes, and it recorded a lifecycle
        // change without recording who made it.
        const attested = adoptServerAuditEntries(response.data.audit, {
          runId: variables.runId,
          widgetId: variables.dsl.id,
        });
        const entries = attested.length
          ? attested
          : [
              buildClientAuditEntry({
                dsl: variables.dsl,
                action: "published",
                runId: variables.runId,
              }),
            ];
        for (const entry of entries) {
          store.appendAuditEntry(variables.draftId, entry);
        }

        // Also add to local Zustand layout store for instant feedback
        const dsl = variables.dsl;
        const pageId = variables.pageId ?? "dashboard";
        const currentLayout = store.layouts?.[pageId];
        if (currentLayout && dsl) {
          const newSlotId = `${pageId}-ai-slot-${Date.now()}`;
          store.addSlot(
            pageId,
            newSlotId,
            {
              widgetId: dsl.component,
              config: dsl.props,
            } as any,
            {
              span: dsl.layout.width as 4 | 8 | 12,
              height: dsl.layout.height as 200 | 280 | 340 | 400,
            },
          );
        }
      }

      // Invalidate dashboard caches
      queryClient.invalidateQueries({
        queryKey: WIDGET_STUDIO_KEYS.dashboardLayouts(),
      });

      customOnSuccess?.(...args);
    },
    onError: (...args) => {
      const [error, variables] = args;
      const store = useAppStore.getState();
      store.updateWidgetAgent(variables.draftId, "publish", {
        status: "error",
        error: error.message || "Publish failed",
      });
      customOnError?.(...args);
    },
    onSettled: (...args) => {
      customOnSettled?.(...args);
    },
  });
}

// ─── useWidgetRun ───────────────────────────────────────────────────────────

/**
 * Fetch details for a specific agent pipeline run.
 */
export function useWidgetRun(
  runId: number | undefined,
  options?: Omit<
    UseQueryOptions<FetchResponse<WidgetRunResponse>, HttpError>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: WIDGET_STUDIO_KEYS.run(runId!),
    queryFn: () =>
      apiClient.get<WidgetRunResponse>(`/api/v1/widgets/runs/${runId}`),
    enabled: runId !== undefined && runId > 0,
    staleTime: 1000 * 30, // 30 seconds
    ...options,
  });
}

// ─── useWidgetAuditTrail ────────────────────────────────────────────────────

export interface WidgetAuditResponse {
  success: boolean;
  runId: number;
  audit: unknown;
}

/**
 * The server's own record of a run.
 *
 * This is the half of the audit story the client cannot write for itself: the
 * user id the request authenticated as, the model the run was dispatched
 * with, timestamps the database recorded. Entries are adopted as
 * `source: "server"`, which is what lets the panel call a trail attested
 * instead of labelling it as a local note.
 */
export function useWidgetAuditTrail(
  runId: number | undefined,
  options?: Omit<
    UseQueryOptions<FetchResponse<WidgetAuditResponse>, HttpError>,
    "queryKey" | "queryFn"
  >,
) {
  const query = useQuery({
    queryKey: WIDGET_STUDIO_KEYS.audit(runId ?? 0),
    queryFn: () =>
      apiClient.get<WidgetAuditResponse>(`/api/v1/widgets/runs/${runId}/audit`),
    enabled: runId !== undefined && runId > 0,
    staleTime: 1000 * 60,
    // A missing trail is not worth three attempts: the run either recorded
    // one or it did not.
    retry: false,
    ...options,
  });

  return {
    ...query,
    entries: adoptServerAuditEntries(query.data?.data?.audit, { runId }),
  };
}
