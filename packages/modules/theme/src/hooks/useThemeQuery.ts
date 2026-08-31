import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type { FetchResponse, HttpError } from "@cap/platform-core";
import type { TenantThemeConfig } from "@cap/theme";
import { applyThemeVariablesSync } from "@cap/theme";
import {
  themeService,
  type TenantThemeResponse,
  type SaveTenantThemeRequest,
  type GenerateAiThemeRequest,
  type AiThemeResponse,
  type ThemePresetsResponse,
} from "../services/theme.service";

export const THEME_QUERY_KEYS = {
  all: ["theme"] as const,
  tenant: (organizationId: string | number = "current") =>
    ["theme", "tenant", String(organizationId)] as const,
  presets: () => ["theme", "presets"] as const,
};

/**
 * Fetch the active tenant theme configuration
 */
export function useTenantTheme(
  organizationId?: string | number,
  options?: Omit<
    UseQueryOptions<FetchResponse<TenantThemeResponse>, HttpError>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: THEME_QUERY_KEYS.tenant(organizationId || "current"),
    queryFn: () => themeService.getTenantTheme(organizationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

/**
 * Update and publish the tenant theme configuration with optimistic updates.
 */
export function useUpdateTenantTheme(
  organizationId?: string | number,
  options?: UseMutationOptions<
    FetchResponse<TenantThemeResponse>,
    HttpError,
    SaveTenantThemeRequest,
    { previousTheme?: FetchResponse<TenantThemeResponse> }
  >,
) {
  const queryClient = useQueryClient();
  const queryKey = THEME_QUERY_KEYS.tenant(organizationId || "current");
  const {
    onSuccess: customOnSuccess,
    onError: customOnError,
    onSettled: customOnSettled,
    ...restOptions
  } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (payload: SaveTenantThemeRequest) =>
      themeService.saveTenantTheme(payload, organizationId),
    onMutate: async (newThemePayload) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousTheme =
        queryClient.getQueryData<FetchResponse<TenantThemeResponse>>(queryKey);

      // Optimistically update the cache
      if (previousTheme) {
        queryClient.setQueryData<FetchResponse<TenantThemeResponse>>(queryKey, {
          ...previousTheme,
          data: {
            ...previousTheme.data,
            themeConfig: newThemePayload.themeConfig,
            presetId:
              newThemePayload.presetId !== undefined
                ? newThemePayload.presetId
                : previousTheme.data.presetId,
            isDark:
              newThemePayload.isDark !== undefined
                ? newThemePayload.isDark
                : previousTheme.data.isDark,
            isCustom: true,
          },
        });
      }

      // Sync variables immediately for smooth UI transition
      applyThemeVariablesSync(newThemePayload.themeConfig);

      return { previousTheme };
    },
    onError: (...args) => {
      const [err, , context] = args;
      // Revert to snapshot on error
      if (context?.previousTheme) {
        queryClient.setQueryData(queryKey, context.previousTheme);
        applyThemeVariablesSync(context.previousTheme.data.themeConfig);
      }
      customOnError?.(...args);
    },
    onSettled: (...args) => {
      // Always refetch after error or success to ensure synchronization
      queryClient.invalidateQueries({ queryKey });
      customOnSettled?.(...args);
    },
    onSuccess: (...args) => {
      customOnSuccess?.(...args);
    },
  });
}

/**
 * Generate an AI Theme from a text prompt.
 */
export function useGenerateAiTheme(
  organizationId?: string | number,
  options?: UseMutationOptions<
    FetchResponse<AiThemeResponse>,
    HttpError,
    GenerateAiThemeRequest
  >,
) {
  return useMutation({
    mutationFn: (payload: GenerateAiThemeRequest) =>
      themeService.generateAiTheme(payload, organizationId),
    ...options,
  });
}

/**
 * Fetch available built-in system presets.
 */
export function useThemePresets(
  options?: Omit<
    UseQueryOptions<FetchResponse<ThemePresetsResponse>, HttpError>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: THEME_QUERY_KEYS.presets(),
    queryFn: () => themeService.getPresets(),
    staleTime: 1000 * 60 * 60, // 1 hour
    ...options,
  });
}
