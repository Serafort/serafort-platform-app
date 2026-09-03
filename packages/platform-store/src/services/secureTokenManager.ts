export interface TokenData {
  accessToken: string
  /** Refresh token is strictly handled via HttpOnly cookies and never stored in memory or client storage */
  refreshToken?: never
  expiresAt: number
}

class SecureTokenManager {
  private accessToken: string | null = null
  private expiresAt: number | null = null
  // Always initialized as we don't load from storage
  // Debug: unique instance ID to detect multiple instances
  private readonly instanceId = crypto.randomUUID().substring(0, 8)

  constructor() {
    if (import.meta.env.DEV) {
      console.log(`[SecureTokenManager] Instance created: ${this.instanceId}`)
    }
  }

  /**
   * Initialize tokens - No-op now as we don't load from storage
   */
  async init(): Promise<void> {
    return
  }

  /**
   * Ensure tokens are initialized - No-op
   */
  async ensureInitialized(): Promise<void> {
    return
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  getExpiresAt(): number | null {
    return this.expiresAt
  }

  getTokens(): TokenData | null {
    // Require access token to consider valid
    if (!this.accessToken) {
      return null
    }

    return {
      accessToken: this.accessToken,
      expiresAt: this.expiresAt || 0,
    }
  }

  async setTokens(tokens: TokenData | string): Promise<void> {
    if (typeof tokens === 'string') {
      this.accessToken = tokens
      this.expiresAt = Date.now() + 3600000
      return
    }
    this.accessToken = tokens.accessToken
    this.expiresAt = tokens.expiresAt
  }

  async setAccessToken(token: string): Promise<void> {
    this.accessToken = token
  }

  async setExpiresAt(expiresAt: number): Promise<void> {
    this.expiresAt = expiresAt
  }

  async clearTokens(): Promise<void> {
    this.accessToken = null
    this.expiresAt = null
  }

  isTokenExpired(): boolean {
    if (!this.expiresAt) return true
    if (!this.accessToken) return true

    const now = Date.now()
    const bufferTime = 5 * 60 * 1000 // 5 minutes buffer

    return now >= this.expiresAt - bufferTime
  }

  hasTokens(): boolean {
    return this.accessToken !== null
  }

  isInitialized(): boolean {
    return true
  }
}

export const secureTokenManager = new SecureTokenManager()

export default secureTokenManager
