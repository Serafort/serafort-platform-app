// ---------------------------------------------------------------------------
// Path projection for the developer-console sub-module.
//
// This file intentionally contains NO URL literals. The developer-console paths
// live in the Tier 0 registry (`AppPaths` in @cap/shared-types) so that editing
// a path there changes it everywhere -- router, links, navigation and tests.
//
// To add or change a route, edit `AppPaths.developerConsole` in
// packages/shared-types/src/routes.ts, not this file.
// ---------------------------------------------------------------------------
import { AppPaths } from '@cap/shared-types'

const Path = AppPaths.developerConsole

export default Path
