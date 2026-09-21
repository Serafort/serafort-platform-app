// ---------------------------------------------------------------------------
// Path projection for the passwordless-service sub-module.
//
// This file intentionally contains NO URL literals. The passwordless paths
// live in the Tier 0 registry (`AppPaths` in @cap/shared-types) so that editing
// a path there changes it everywhere -- router, links, navigation and tests.
//
// To add or change a route, edit `AppPaths.passwordless` in
// packages/shared-types/src/routes.ts, not this file.
// ---------------------------------------------------------------------------
import { AppPaths } from '@cap/shared-types'

const Path = AppPaths.passwordless

export default Path
