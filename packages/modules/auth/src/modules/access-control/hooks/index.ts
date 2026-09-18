export * from './useAccessControlQuery'
// Re-exported from authentication-core, which now owns it: the domain
// verification screen in authorization-engine needs the same resolution,
// and duplicating the session selector would let the two drift.
export * from '../../authentication-core/hooks/useActiveOrganizationId'
