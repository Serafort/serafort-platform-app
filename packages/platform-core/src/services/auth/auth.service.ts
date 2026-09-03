import { apiClient, API_CONTRACTS, secureTokenManager } from '@cap/platform-store'
import { UserDto } from '@cap/shared-types'

export const authService = {
  /**
   * Initiates the IDaaS login flow by redirecting to the backend.
   */
  loginWithIdaas: () => {
    // Redirect to backend endpoint which redirects to IDaaS
    window.location.href = `${apiClient.baseURL}${API_CONTRACTS.auth.login.resolve()}`
  },

  /**
   * helper to handle the callback from IDaaS (usually handled by a Callback component)
   * returning the tokens from URL query params.
   */
  handleCallback: async (urlParams: URLSearchParams): Promise<UserDto> => {
    const accessToken = urlParams.get('accessToken') || urlParams.get('token')
    // const refreshToken = urlParams.get('refresh_token') // Only if backend sends it in query (not Recommended with Cookies)
    const expiresIn = urlParams.get('expires_in')

    if (!accessToken) {
      throw new Error('No access token received')
    }

    // Access token stored in memory; refresh token is handled automatically via HttpOnly cookie
    secureTokenManager.setTokens({
      accessToken,
      expiresAt: Date.now() + (Number(expiresIn) || 3600) * 1000,
    })

    // Verify session / Get User
    const response = await apiClient.execute(API_CONTRACTS.user.me, [])
    return response.data.data!
  },

  logout: async () => {
    try {
      await apiClient.execute(API_CONTRACTS.auth.logout, [])
    } catch (e) {
      console.error('Logout failed', e)
    } finally {
      secureTokenManager.clearTokens()
      window.location.href = '/login'
    }
  },
}
