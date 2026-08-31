import { apiClient, type FetchResponse } from "@cap/platform-core";
import type { TenantThemeConfig, ThemePresetId } from "@cap/theme";

export interface TenantThemeResponse {
  isCustom?: boolean;
  id?: number | string;
  organizationId?: number | string;
  presetId?: ThemePresetId | string | null;
  isDark?: boolean;
  themeConfig: TenantThemeConfig;
  updatedAt?: string;
  success?: boolean;
  error?: string;
}

export interface SaveTenantThemeRequest {
  themeConfig: TenantThemeConfig;
  presetId?: ThemePresetId | string | null;
  isDark?: boolean;
}

export interface GenerateAiThemeRequest {
  prompt: string;
  isDark?: boolean;
  useLlm?: boolean;
  providerType?:
    | "gemini"
    | "openai"
    | "anthropic"
    | "mistral"
    | "groq"
    | "cohere"
    | "openrouter"
    | string;
  model?: string;
  apiKey?: string;
}

export interface WcagContrastResult {
  pair: string;
  foreground: string;
  background: string;
  ratio: number;
  normalTextPassAA: boolean;
  normalTextPassAAA: boolean;
  largeTextPassAA: boolean;
  adjusted?: boolean;
}

export interface AiThemeResponse {
  success: boolean;
  themeConfig: TenantThemeConfig;
  presetId?: string;
  isDark: boolean;
  tokens?: Record<string, any>;
  cssVariables?: Record<string, string>;
  contrastResults?: WcagContrastResult[];
  explanation?: string;
  error?: string;
}

export interface ThemePresetDto {
  id: ThemePresetId | string;
  name: string;
  description?: string;
  mode?: "light" | "dark";
  tokens?: Record<string, any>;
}

export interface ThemePresetsResponse {
  success: boolean;
  presets: ThemePresetDto[];
}

export class ThemeService {
  private static getHeaders(
    organizationId?: string | number,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (organizationId && organizationId !== "default") {
      headers["x-organization-id"] = String(organizationId);
    }
    return headers;
  }

  /**
   * GET /api/v1/themes/tenant
   * Fetch active theme configuration for the current tenant or specified organization.
   */
  static async getTenantTheme(
    organizationId?: string | number,
  ): Promise<FetchResponse<TenantThemeResponse>> {
    const headers = this.getHeaders(organizationId);
    const query =
      organizationId && organizationId !== "default"
        ? `?orgId=${organizationId}`
        : "";
    return apiClient.get<TenantThemeResponse>(`/api/v1/themes/tenant${query}`, {
      headers,
    });
  }

  /**
   * PUT /api/v1/themes/tenant
   * Persist / publish tenant theme configuration to the database.
   */
  static async saveTenantTheme(
    payload: SaveTenantThemeRequest,
    organizationId?: string | number,
  ): Promise<FetchResponse<TenantThemeResponse>> {
    const headers = this.getHeaders(organizationId);
    const query =
      organizationId && organizationId !== "default"
        ? `?orgId=${organizationId}`
        : "";
    return apiClient.put<TenantThemeResponse>(
      `/api/v1/themes/tenant${query}`,
      payload,
      {
        headers,
      },
    );
  }

  /**
   * POST /api/v1/themes/generate
   * Generate a complete UI Theme from natural language prompt with WCAG contrast verification.
   */
  static async generateAiTheme(
    payload: GenerateAiThemeRequest,
    organizationId?: string | number,
  ): Promise<FetchResponse<AiThemeResponse>> {
    const headers = this.getHeaders(organizationId);
    return apiClient.post<AiThemeResponse>("/api/v1/themes/generate", payload, {
      headers,
    });
  }

  /**
   * GET /api/v1/themes/presets
   * Retrieve list of built-in system theme presets.
   */
  static async getPresets(): Promise<FetchResponse<ThemePresetsResponse>> {
    return apiClient.get<ThemePresetsResponse>("/api/v1/themes/presets");
  }

  /**
   * POST /api/admin/organizations/:id/logo
   * Upload / configure custom organization logo asset.
   */
  static async uploadOrganizationLogo(
    organizationId: string | number,
    file: File | Blob,
  ): Promise<FetchResponse<{ success: boolean; logoUrl: string }>> {
    const formData = new FormData();
    formData.append("logo", file);
    return apiClient.post<{ success: boolean; logoUrl: string }>(
      `/api/admin/organizations/${organizationId}/logo`,
      formData,
      {
        headers: {
          "x-organization-id": String(organizationId),
        },
      },
    );
  }
}

export const themeService = ThemeService;
