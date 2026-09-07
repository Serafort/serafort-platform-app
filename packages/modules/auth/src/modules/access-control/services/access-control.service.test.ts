import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@cap/platform-core'
import accessControlService from './access-control.service'

vi.mock('@cap/platform-core', async () => {
  const actual = await vi.importActual('@cap/platform-core')
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  }
})

const createMockResponse = (data: any) => ({
  data,
  status: 200,
  statusText: 'OK',
  ok: true,
  headers: new Headers(),
  config: {} as any,
})

const ORG = 42

describe('accessControlService — cards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('scopes the card list to the organization', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(createMockResponse({ data: [], meta: {} }))

    await accessControlService.listCards(ORG)

    expect(apiClient.get).toHaveBeenCalledWith('/api/admin/organizations/42/nfc/cards')
  })

  it('passes search and status through the query string', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(createMockResponse({ data: [], meta: {} }))

    await accessControlService.listCards(ORG, { page: 2, limit: 20, search: '04A2', status: 'active' })

    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/admin/organizations/42/nfc/cards?page=2&limit=20&search=04A2&status=active',
    )
  })

  it('normalises the UID the way the backend does before registering', async () => {
    // The backend trims and upper-cases before its duplicate check. Sending the
    // raw string would let `04:a2:2f` be submitted as a "new" card and come
    // back as an unexplained 409 against a row the operator cannot see.
    vi.mocked(apiClient.post).mockResolvedValueOnce(createMockResponse({}))

    await accessControlService.registerCard(ORG, { uid: '  04:a2:2f  ', userId: 7 })

    expect(apiClient.post).toHaveBeenCalledWith('/api/admin/organizations/42/nfc/cards', {
      uid: '04:A2:2F',
      userId: 7,
    })
  })

  it('revokes through a status change, not a delete', async () => {
    // The card must keep the registration its access_logs rows point back to.
    vi.mocked(apiClient.patch).mockResolvedValueOnce(createMockResponse({}))

    await accessControlService.updateCardStatus(ORG, 9, 'revoked')

    expect(apiClient.patch).toHaveBeenCalledWith(
      '/api/admin/organizations/42/nfc/cards/9/status',
      { status: 'revoked' },
    )
    expect(apiClient.delete).not.toHaveBeenCalled()
  })
})

describe('accessControlService — access points', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds the regenerate-token path', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(createMockResponse({ api_token: 'tk_x' }))

    await accessControlService.regenerateAccessPointToken(ORG, 3)

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/admin/organizations/42/nfc/access-points/3/regenerate-token',
    )
  })

  it('updates a reader in place', async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce(createMockResponse({}))

    await accessControlService.updateAccessPoint(ORG, 3, { status: 'inactive' })

    expect(apiClient.patch).toHaveBeenCalledWith(
      '/api/admin/organizations/42/nfc/access-points/3',
      { status: 'inactive' },
    )
  })
})

describe('accessControlService — logs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('snake-cases the reader filter the backend reads', async () => {
    // The controller reads `access_point_id`. Sending `accessPointId` would be
    // silently ignored and the filter would appear to do nothing.
    vi.mocked(apiClient.get).mockResolvedValueOnce(createMockResponse({ data: [], meta: {} }))

    await accessControlService.listLogs(ORG, { accessPointId: 5, status: 'denied' })

    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/admin/organizations/42/nfc/logs?status=denied&access_point_id=5',
    )
  })

  it('omits filters that were left unset', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(createMockResponse({ data: [], meta: {} }))

    await accessControlService.listLogs(ORG, { page: 1, status: undefined, direction: undefined })

    expect(apiClient.get).toHaveBeenCalledWith('/api/admin/organizations/42/nfc/logs?page=1')
  })
})
