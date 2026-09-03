import { StateCreator } from "zustand";
import type { AppStore } from "../../types";
import {
  fetchClient,
  ENDPOINTS,
  setTenantId,
  setImpersonationContext,
} from "../../services/api/api.client";
import {
  IAuth,
  ILogin,
  hasAdminRole,
  normalizeRole,
  TenantMembership,
  ImpersonationSession,
} from "@cap/shared-types";
import {
  secureTokenManager,
  TokenData as AuthTokens,
} from "../../services/secureTokenManager";

export type { AuthTokens };

export interface AuthSlice {
  user: IAuth | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  tokens: AuthTokens | null;

  // Multi-Tenant & Impersonation Plane State
  activeTenantId: string | number | null;
  memberships: TenantMembership[];
  impersonationSession: ImpersonationSession | null;

  signIn: (credentials: ILogin) => Promise<any>;
  signOut: (callback?: (status: number) => void) => Promise<void>;
  refreshAuth: () => Promise<void>;
  refreshToken: () => Promise<string>;
  updateUser: (userData: Partial<IAuth>) => void;
  setUser: (user: IAuth | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;

  // Multi-Tenant Actions
  switchTenant: (orgId: string | number) => void;
  setMemberships: (memberships: TenantMembership[]) => void;
  startImpersonation: (session: ImpersonationSession) => void;
  stopImpersonation: () => void;
}

// Singleton promise to prevent duplicate refreshAuth calls
let refreshAuthPromise: Promise<void> | null = null;

const normalizeUserData = (userData: any) => {
  if (!userData || typeof userData !== "object") return userData;

  const normalized = { ...userData };

  if (normalized.role && typeof normalized.role === "object") {
    normalized.roleObject = normalized.roleObject || normalized.role;
    normalized.roleName =
      normalized.roleName ||
      normalized.role.slug ||
      normalized.role.name ||
      normalized.role.value;
  }

  const resolvedRole =
    normalizeRole(normalized.role) ||
    normalizeRole(normalized.roleId) ||
    normalizeRole(normalized.role_id) ||
    normalizeRole(normalized.roleObject) ||
    normalizeRole(normalized.roleName) ||
    normalizeRole(normalized.role_name);

  if (resolvedRole) {
    normalized.role = resolvedRole;
    normalized.roleName = resolvedRole;
  }

  if (normalized.avatar && !normalized.avatarUrl) {
    normalized.avatarUrl = normalized.avatar;
  }

  if (normalized.avatarUrl && !normalized.avatar) {
    normalized.avatar = normalized.avatarUrl;
  }

  if (!Array.isArray(normalized.permissions)) {
    normalized.permissions = [];
  }

  if (!Array.isArray(normalized.memberships)) {
    normalized.memberships = [];
  }

  return normalized;
};

export const createAuthSlice: StateCreator<
  AppStore,
  [["zustand/immer", never], ["zustand/persist", unknown]],
  [],
  AuthSlice
> = (set, get) => ({
  // Initial State
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,
  error: null,
  tokens: null,
  activeTenantId: null,
  memberships: [],
  impersonationSession: null,

  // Sign In
  signIn: async (credentials: ILogin) => {
    set((state: AuthSlice) => {
      state.isLoading = true;
      state.error = null;
    });

    try {
      const response = await fetchClient.post<any>(
        ENDPOINTS.auth.login,
        credentials,
      );

      if (response.status === 200 && response.data) {
        let userData = normalizeUserData(response.data.user || response.data);
        const token = response.data.accessToken || response.data.token;

        if (token && userData && !userData.token) {
          userData.token = token;
        }

        if (userData) {
          userData.rememberMe = credentials.rememberMe;
        }

        const initialTenantId =
          userData?.activeTenantId ||
          userData?.organizationId ||
          userData?.orgId ||
          userData?.memberships?.[0]?.orgId ||
          null;

        set((state: AuthSlice) => {
          state.user = userData;
          state.isAuthenticated = true;
          state.isAdmin =
            hasAdminRole(userData?.role) ||
            hasAdminRole(userData?.roleObject) ||
            hasAdminRole(userData?.roleName);
          state.tokens = token
            ? { accessToken: token, expiresAt: Date.now() + 3600 * 1000 }
            : null;
          state.activeTenantId = initialTenantId;
          state.memberships = userData?.memberships || [];
          state.impersonationSession = userData?.impersonationSession || null;
          state.isLoading = false;
          state.error = null;
        });

        setTenantId(initialTenantId ? String(initialTenantId) : null);
        setImpersonationContext(userData?.impersonationSession || null);

        if (token) {
          secureTokenManager.setTokens({
            accessToken: token,
            expiresAt: Date.now() + 3600 * 1000,
          });
        }

        return response;
      }
    } catch (error: any) {
      console.error("[signIn] Error:", error.response?.status, error.message);
      set((state: AuthSlice) => {
        state.error = error.response?.data?.message || "Sign in failed";
        state.isAuthenticated = false;
        state.isLoading = false;
      });
      throw error;
    }
  },

  // Sign Out
  signOut: async (callback?: (status: number) => void) => {
    try {
      const response = await fetchClient.post(ENDPOINTS.auth.logout);

      set((state: AuthSlice) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.tokens = null;
        state.error = null;
        state.activeTenantId = null;
        state.memberships = [];
        state.impersonationSession = null;
      });

      setTenantId(null);
      setImpersonationContext(null);
      secureTokenManager.clearTokens();

      if (callback) callback(response.status);
    } catch (error) {
      console.error("Sign out error:", error);
      set((state: AuthSlice) => {
        state.user = null;
        state.isAuthenticated = false;
        state.tokens = null;
        state.activeTenantId = null;
        state.memberships = [];
        state.impersonationSession = null;
      });

      setTenantId(null);
      setImpersonationContext(null);
      secureTokenManager.clearTokens();
    } finally {
      set((state: AuthSlice) => {
        state.isLoading = false;
      });
    }
  },

  // Refresh Auth
  refreshAuth: async () => {
    if (refreshAuthPromise) {
      return refreshAuthPromise;
    }

    refreshAuthPromise = (async () => {
      await secureTokenManager.ensureInitialized();

      set((state: AuthSlice) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await fetchClient.get<any>(ENDPOINTS.auth.session);

        if (response.status === 200 && response.data) {
          if (response.data.access_token || response.data.token) {
            const newTokens: AuthTokens = {
              accessToken: response.data.access_token || response.data.token,
              expiresAt: Date.now() + (response.data.expires_in || 3600) * 1000,
            };
            secureTokenManager.setTokens(newTokens);
          }

          let userData = normalizeUserData(response.data.user || response.data);
          const currentActive =
            get().activeTenantId ||
            userData?.organizationId ||
            userData?.orgId ||
            null;

          set((state: AuthSlice) => {
            state.user = userData;
            state.isAuthenticated = true;
            state.isAdmin =
              hasAdminRole(userData?.role) ||
              hasAdminRole(userData?.roleObject) ||
              hasAdminRole(userData?.roleName);
            state.activeTenantId = currentActive;
            state.memberships = userData?.memberships || [];
            state.impersonationSession = userData?.impersonationSession || null;
            state.isLoading = false;
            state.error = null;
          });

          setTenantId(currentActive ? String(currentActive) : null);
          setImpersonationContext(userData?.impersonationSession || null);
        }
      } catch (error: any) {
        console.error(
          "[refreshAuth] Error:",
          error.response?.status,
          error.message,
        );

        set((state: AuthSlice) => {
          state.user = null;
          state.isAuthenticated = false;
          state.isLoading = false;
          state.error = error.response?.data?.message || "Session expired";
          state.activeTenantId = null;
          state.memberships = [];
          state.impersonationSession = null;
        });

        setTenantId(null);
        setImpersonationContext(null);
        secureTokenManager.clearTokens();
      } finally {
        refreshAuthPromise = null;
      }
    })();

    return refreshAuthPromise;
  },

  // Refresh Token
  refreshToken: async () => {
    try {
      interface RefreshResponse {
        access_token: string;
        token?: string;
        expires_in: number;
      }

      const response =
        await fetchClient.post<RefreshResponse>("/api/auth/refresh");

      const accessToken = response.data.access_token || response.data.token;
      const expiresIn = response.data.expires_in || 3600;

      if (!accessToken) {
        throw new Error("No access token in response");
      }

      const expiresAt = Date.now() + expiresIn * 1000;

      const newTokens: AuthTokens = {
        accessToken,
        expiresAt,
      };

      secureTokenManager.setTokens(newTokens);

      set((state: AuthSlice) => {
        state.tokens = newTokens;
      });

      return accessToken;
    } catch (error: any) {
      console.error("[refreshToken] Error:", error);

      set((state: AuthSlice) => {
        state.user = null;
        state.isAuthenticated = false;
        state.tokens = null;
        state.error = "Token refresh failed";
      });

      secureTokenManager.clearTokens();
      throw error;
    }
  },

  // Update User
  updateUser: (userData: Partial<IAuth>) => {
    set((state: AuthSlice) => {
      if (state.user) {
        state.user = { ...state.user, ...userData };
      }
    });
  },

  // Set User
  setUser: (user: IAuth | null) => {
    const normalizedUser = normalizeUserData(user);
    const currentActive =
      normalizedUser?.activeTenantId ||
      normalizedUser?.organizationId ||
      normalizedUser?.orgId ||
      null;

    set((state: AuthSlice) => {
      state.user = normalizedUser;
      state.isAuthenticated = normalizedUser !== null;
      state.isAdmin =
        normalizedUser !== null &&
        (hasAdminRole(normalizedUser.role) ||
          hasAdminRole(normalizedUser.roleObject) ||
          hasAdminRole(normalizedUser.roleName));
      state.activeTenantId = currentActive;
      state.memberships = normalizedUser?.memberships || [];
      state.impersonationSession = normalizedUser?.impersonationSession || null;
      state.error = null;

      if (normalizedUser && (normalizedUser as any).token) {
        const tokens: AuthTokens = {
          accessToken: (normalizedUser as any).token || "",
          expiresAt: Date.now() + 3600 * 1000,
        };
        state.tokens = tokens;
        secureTokenManager.setTokens(tokens);
      } else if (!normalizedUser) {
        state.tokens = null;
        secureTokenManager.clearTokens();
      }
    });

    setTenantId(currentActive ? String(currentActive) : null);
    setImpersonationContext(normalizedUser?.impersonationSession || null);
  },

  // Clear Error
  clearError: () => {
    set((state: AuthSlice) => {
      state.error = null;
    });
  },

  // Set Tokens
  setTokens: (tokens: AuthTokens | null) => {
    set((state: AuthSlice) => {
      state.tokens = tokens;
    });

    if (tokens) {
      secureTokenManager.setTokens(tokens);
    } else {
      secureTokenManager.clearTokens();
    }
  },

  // Set Loading
  setLoading: (loading: boolean) => {
    set((state: AuthSlice) => {
      state.isLoading = loading;
    });
  },

  // Switch Active Tenant
  switchTenant: (orgId: string | number) => {
    set((state: AuthSlice) => {
      state.activeTenantId = orgId;
      if (state.user) {
        state.user.activeTenantId = orgId;
      }
    });
    setTenantId(String(orgId));
  },

  // Set Memberships
  setMemberships: (memberships: TenantMembership[]) => {
    set((state: AuthSlice) => {
      state.memberships = memberships;
      if (state.user) {
        state.user.memberships = memberships;
      }
    });
  },

  // Start Platform Support Impersonation
  startImpersonation: (session: ImpersonationSession) => {
    set((state: AuthSlice) => {
      state.impersonationSession = session;
      state.activeTenantId = session.targetOrgId;
      if (state.user) {
        state.user.impersonationSession = session;
        state.user.activeTenantId = session.targetOrgId;
      }
    });
    setTenantId(String(session.targetOrgId));
    setImpersonationContext(session);
  },

  // Stop Impersonation
  stopImpersonation: () => {
    set((state: AuthSlice) => {
      state.impersonationSession = null;
      const originalOrgId =
        state.user?.organizationId || state.user?.orgId || null;
      state.activeTenantId = originalOrgId;
      if (state.user) {
        state.user.impersonationSession = null;
        state.user.activeTenantId = originalOrgId;
      }
    });
    const originalOrgId = get().activeTenantId;
    setTenantId(originalOrgId ? String(originalOrgId) : null);
    setImpersonationContext(null);
  },
});
