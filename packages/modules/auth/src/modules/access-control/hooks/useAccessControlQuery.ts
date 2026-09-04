import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import accessControlService from '../services/access-control.service'
import type {
  AccessLogFilters,
  AccessLogPage,
  AccessPoint,
  AccessPointWithToken,
  CreateAccessPointPayload,
  NfcCardPage,
  NfcCardStatus,
  RegisterNfcCardPayload,
  UpdateAccessPointPayload,
} from '../types/accessControl.types'

export const ACCESS_CONTROL_KEYS = {
  all: ['admin', 'access-control'] as const,
  cards: (orgId: string | number, params?: Record<string, unknown>) =>
    [...ACCESS_CONTROL_KEYS.all, orgId, 'cards', params] as const,
  accessPoints: (orgId: string | number) =>
    [...ACCESS_CONTROL_KEYS.all, orgId, 'access-points'] as const,
  logs: (orgId: string | number, params?: Record<string, unknown>) =>
    [...ACCESS_CONTROL_KEYS.all, orgId, 'logs', params] as const,
}

export function useNfcCardsQuery(
  orgId: string | number | null,
  params?: { page?: number; limit?: number; search?: string; status?: NfcCardStatus },
) {
  return useQuery({
    queryKey: ACCESS_CONTROL_KEYS.cards(orgId ?? 'none', params),
    queryFn: async () => {
      const response = await accessControlService.listCards(orgId as string | number, params)
      return response.data as NfcCardPage
    },
    enabled: Boolean(orgId),
    staleTime: 30_000,
  })
}

export function useRegisterNfcCardMutation(orgId: string | number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: RegisterNfcCardPayload) => {
      const response = await accessControlService.registerCard(orgId as string | number, payload)
      return response.data
    },
    // Not retried: the backend answers 409 on a duplicate UID, and a silent
    // retry would turn one clear conflict into a confusing second failure.
    retry: false,
    onSuccess: () => invalidateCards(queryClient, orgId),
  })
}

/**
 * Revoke or restore a badge.
 *
 * Revocation is the incident path — a lost card must stop opening doors — so
 * the card list is invalidated immediately rather than waiting for the poll.
 */
export function useUpdateCardStatusMutation(orgId: string | number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vars: { cardId: string | number; status: NfcCardStatus }) => {
      const response = await accessControlService.updateCardStatus(
        orgId as string | number,
        vars.cardId,
        vars.status,
      )
      return response.data
    },
    retry: false,
    onSuccess: () => invalidateCards(queryClient, orgId),
  })
}

export function useDeleteCardMutation(orgId: string | number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (cardId: string | number) => {
      const response = await accessControlService.deleteCard(orgId as string | number, cardId)
      return response.data
    },
    retry: false,
    onSuccess: () => invalidateCards(queryClient, orgId),
  })
}

export function useAccessPointsQuery(orgId: string | number | null) {
  return useQuery({
    queryKey: ACCESS_CONTROL_KEYS.accessPoints(orgId ?? 'none'),
    queryFn: async () => {
      const response = await accessControlService.listAccessPoints(orgId as string | number)
      return response.data as AccessPoint[]
    },
    enabled: Boolean(orgId),
    // Readers have no heartbeat — `lastSeenAt` only advances when somebody
    // scans — so a slow refresh is enough to keep the presence column honest.
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}

export function useCreateAccessPointMutation(orgId: string | number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateAccessPointPayload) => {
      const response = await accessControlService.createAccessPoint(
        orgId as string | number,
        payload,
      )
      return response.data as AccessPointWithToken
    },
    retry: false,
    onSuccess: () => invalidatePoints(queryClient, orgId),
  })
}

export function useUpdateAccessPointMutation(orgId: string | number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vars: { pointId: string | number; payload: UpdateAccessPointPayload }) => {
      const response = await accessControlService.updateAccessPoint(
        orgId as string | number,
        vars.pointId,
        vars.payload,
      )
      return response.data as AccessPoint
    },
    retry: false,
    onSuccess: () => invalidatePoints(queryClient, orgId),
  })
}

export function useDeleteAccessPointMutation(orgId: string | number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (pointId: string | number) => {
      const response = await accessControlService.deleteAccessPoint(
        orgId as string | number,
        pointId,
      )
      return response.data
    },
    retry: false,
    onSuccess: () => invalidatePoints(queryClient, orgId),
  })
}

/**
 * Issue a new reader token.
 *
 * Never retried, and this matters more than usual: each attempt rotates the
 * token again, so an automatic second try would invalidate the value the first
 * one returned — leaving an operator holding a token that is already dead and a
 * reader that will not authenticate.
 */
export function useRegenerateReaderTokenMutation(orgId: string | number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (pointId: string | number) => {
      const response = await accessControlService.regenerateAccessPointToken(
        orgId as string | number,
        pointId,
      )
      return response.data as AccessPointWithToken
    },
    retry: false,
    onSuccess: () => invalidatePoints(queryClient, orgId),
  })
}

export function useAccessLogsQuery(
  orgId: string | number | null,
  filters?: AccessLogFilters,
  options?: { live?: boolean },
) {
  return useQuery({
    queryKey: ACCESS_CONTROL_KEYS.logs(orgId ?? 'none', filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await accessControlService.listLogs(orgId as string | number, filters)
      return response.data as AccessLogPage
    },
    enabled: Boolean(orgId),
    staleTime: 5_000,
    // Entry logs are watched live during an incident. Polling is opt-in so the
    // screen does not keep hitting the endpoint when nobody is looking at it.
    refetchInterval: options?.live ? 10_000 : false,
  })
}

function invalidateCards(
  queryClient: ReturnType<typeof useQueryClient>,
  orgId: string | number | null,
) {
  queryClient.invalidateQueries({ queryKey: [...ACCESS_CONTROL_KEYS.all, orgId ?? 'none', 'cards'] })
}

function invalidatePoints(
  queryClient: ReturnType<typeof useQueryClient>,
  orgId: string | number | null,
) {
  queryClient.invalidateQueries({
    queryKey: ACCESS_CONTROL_KEYS.accessPoints(orgId ?? 'none'),
  })
}
