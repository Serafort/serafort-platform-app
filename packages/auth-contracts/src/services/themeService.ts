import { apiClient, type FetchResponse } from "@cap/platform-store";
import type { TenantThemeConfig } from "@cap/theme";
import { ENDPOINTS } from "@cap/api-contracts";

export interface ThemeGenerateRequest {
  prompt: string;
  isDark?: boolean;
  useLlm?: boolean;
  providerType?: string;
  model?: string;
}

export interface WCAGScorecard {
  ratio: number;
  normalTextAA: boolean;
  normalTextAAA: boolean;
  largeTextAA: boolean;
  largeTextAAA: boolean;
  uiComponentsAA: boolean;
  score: "AAA" | "AA" | "FAIL";
}

export interface ThemeGenerateResponse {
  success: boolean;
  themeConfig: TenantThemeConfig;
  analysis: {
    prompt: string;
    presetMatch: string;
    detectedMood: string;
    isDark: boolean;
    primaryHex: string;
    secondaryHex: string;
    backgroundHex: string;
    surfaceHex: string;
    textHex: string;
    textMutedHex: string;
    borderHex: string;
    borderRadius: string;
    effectType: string;
    explanation: string;
  };
  wcagScorecard: {
    textOnBackground: WCAGScorecard;
    textOnSurface: WCAGScorecard;
    primaryOnBackground: WCAGScorecard;
  };
}

export interface TenantThemeResponse {
  isCustom: boolean;
  id?: number;
  organizationId?: number;
  presetId?: string | null;
  isDark?: boolean;
  themeConfig: TenantThemeConfig;
  updatedAt?: string;
}

export class ThemeService {
  /**
   * Generate a complete UI Theme from natural language prompt via the backend AI engine
   */
  async generateTheme(
    request: ThemeGenerateRequest,
  ): Promise<FetchResponse<ThemeGenerateResponse>> {
    return apiClient.post<ThemeGenerateResponse>(
      ENDPOINTS.themes.generate,
      request,
    );
  }

  /**
   * Get active theme configuration for the given organization
   */
  async getTenantTheme(
    orgId?: string | number,
  ): Promise<FetchResponse<TenantThemeResponse>> {
    const headers = orgId ? { "x-organization-id": String(orgId) } : undefined;
    return apiClient.get<TenantThemeResponse>(ENDPOINTS.themes.tenant, {
      headers,
    });
  }

  /**
   * Save / update organization theme in the backend database
   */
  async saveTenantTheme(
    orgId: string | number,
    data: {
      themeConfig: TenantThemeConfig;
      presetId?: string;
      isDark?: boolean;
    },
  ): Promise<FetchResponse<{ success: boolean; tenantTheme: unknown }>> {
    const headers = { "x-organization-id": String(orgId) };
    return apiClient.put<{ success: boolean; tenantTheme: unknown }>(
      ENDPOINTS.themes.saveTenant,
      data,
      { headers },
    );
  }

  /**
   * Retrieve list of preset themes
   */
  async getPresets(): Promise<
    FetchResponse<{ presets: Record<string, unknown> }>
  > {
    return apiClient.get<{ presets: Record<string, unknown> }>(
      ENDPOINTS.themes.presets,
    );
  }
}

export const themeService = new ThemeService();
