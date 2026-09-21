// ---------------------------------------------------------------------------
// Path projection for the mfa-orchestrator sub-module.
//
// This file intentionally contains NO URL literals. The MFA, passkey and platform-authenticator paths
// live in the Tier 0 registry (`AppPaths` in @cap/shared-types) so that editing
// a path there changes it everywhere -- router, links, navigation and tests.
//
// To add or change a route, edit `AppPaths.mfa` in
// packages/shared-types/src/routes.ts, not this file.
// ---------------------------------------------------------------------------
import { AppPaths } from '@cap/shared-types'

const Path = AppPaths.mfa

export default Path
