# Module Coupling Report

- Scope: workspace source files under `app/src` and `packages/**/src`
- Generated: 2026-08-13T01:19:48.320Z
- Source files analyzed: 912
- Workspace packages analyzed: 13
- Sub-modules identified: 93
- Exclusions: `node_modules`, `dist`, `dev-dist`, `public`, `e2e`, `playwright`, tests/specs/stories, type declaration files

## How To Read This

- `Ce` (efferent coupling) is the number of other workspace packages a package depends on.
- `Ca` (afferent coupling) is the number of other workspace packages depending on it.
- `Instability` is `Ce / (Ca + Ce)`; closer to `1.00` means the package mainly depends outward, closer to `0.00` means it is a stable dependency used by others.
- Sub-module keys use the first meaningful source boundary: `modules/<name>`, `domain-kernel`, or the first folder under `src`.

## Package Overview

| Package | Files | Ce | Ca | Instability | Strongest outgoing | Strongest incoming |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| @cap/platform-core | 66 | 4 | 8 | 0.33 | @cap/shared-types (30), @cap/platform-store (21), @cap/theme (13) | @cap/module-auth (99), @cap/layout (22), @cap/app (12) |
| @cap/shared-types | 16 | 0 | 12 | 0.00 | None | @cap/layout (37), @cap/platform-core (30), @cap/theme (25) |
| @cap/platform-store | 35 | 3 | 8 | 0.27 | @cap/shared-types (12), @cap/api-contracts (4), @cap/theme (1) | @cap/layout (31), @cap/platform-core (21), @cap/theme (6) |
| @cap/theme | 198 | 3 | 8 | 0.27 | @cap/shared-types (25), @cap/platform-store (6), @cap/platform-core (4) | @cap/layout (69), @cap/module-auth (19), @cap/module-theme (14) |
| @cap/layout | 149 | 5 | 5 | 0.50 | @cap/theme (69), @cap/shared-types (37), @cap/platform-store (31) | @cap/module-auth (19), @cap/app (4), @cap/module-landing (3) |
| @cap/module-auth | 332 | 6 | 3 | 0.67 | @cap/platform-core (99), @cap/layout (19), @cap/theme (19) | @cap/layout (2), @cap/module-dashboard (1), @cap/module-theme (1) |
| @cap/module-dashboard | 12 | 6 | 0 | 1.00 | @cap/platform-core (6), @cap/shared-types (5), @cap/theme (3) | None |
| @cap/module-theme | 19 | 5 | 1 | 0.83 | @cap/theme (14), @cap/platform-core (2), @cap/shared-types (2) | @cap/app (1) |
| @cap/app | 28 | 5 | 0 | 1.00 | @cap/platform-core (12), @cap/layout (4), @cap/shared-types (2) | None |
| @cap/authorization | 14 | 3 | 2 | 0.60 | @cap/platform-store (3), @cap/shared-types (3), @cap/platform-core (2) | @cap/platform-core (3), @cap/module-auth (2) |
| @cap/module-landing | 34 | 5 | 0 | 1.00 | @cap/platform-core (12), @cap/layout (3), @cap/shared-types (3) | None |
| @cap/api-contracts | 5 | 1 | 2 | 0.33 | @cap/shared-types (2) | @cap/platform-store (4), @cap/auth-contracts (1) |
| @cap/auth-contracts | 4 | 3 | 0 | 1.00 | @cap/shared-types (6), @cap/api-contracts (1), @cap/platform-store (1) | None |

## Strongest Package-To-Package Edges

| From | To | File-level edges |
| --- | --- | ---: |
| @cap/module-auth | @cap/platform-core | 99 |
| @cap/layout | @cap/theme | 69 |
| @cap/layout | @cap/shared-types | 37 |
| @cap/layout | @cap/platform-store | 31 |
| @cap/platform-core | @cap/shared-types | 30 |
| @cap/theme | @cap/shared-types | 25 |
| @cap/layout | @cap/platform-core | 22 |
| @cap/platform-core | @cap/platform-store | 21 |
| @cap/module-auth | @cap/layout | 19 |
| @cap/module-auth | @cap/theme | 19 |
| @cap/module-theme | @cap/theme | 14 |
| @cap/platform-core | @cap/theme | 13 |
| @cap/app | @cap/platform-core | 12 |
| @cap/module-auth | @cap/shared-types | 12 |
| @cap/module-landing | @cap/platform-core | 12 |
| @cap/platform-store | @cap/shared-types | 12 |
| @cap/auth-contracts | @cap/shared-types | 6 |
| @cap/module-dashboard | @cap/platform-core | 6 |
| @cap/theme | @cap/platform-store | 6 |
| @cap/module-dashboard | @cap/shared-types | 5 |

## Top Sub-Modules By Coupling

| Package | Sub-module | Files | Outgoing sub-modules | Incoming sub-modules | Strongest outgoing | Strongest incoming |
| --- | --- | ---: | ---: | ---: | --- | --- |
| @cap/platform-core | (root) | 2 | 14 | 36 | @cap/platform-core:hooks (9), @cap/platform-core:contexts (5), @cap/platform-core:registry (3) | @cap/module-auth:modules/authentication-core (37), @cap/module-auth:modules/user-directory (17), @cap/module-auth:modules/platform-cluster (15) |
| @cap/shared-types | (root) | 15 | 0 | 47 | None | @cap/layout:menu (16), @cap/layout:components (13), @cap/platform-core:types (10) |
| @cap/theme | (root) | 1 | 11 | 27 | @cap/theme:assets (4), @cap/theme:context (3), @cap/theme:store (3) | @cap/layout:menu (39), @cap/layout:styles (15), @cap/module-auth:modules/user-directory (12) |
| @cap/platform-store | (root) | 2 | 2 | 21 | @cap/platform-store:store (12), @cap/platform-store:services (1) | @cap/layout:components (13), @cap/layout:menu (12), @cap/platform-store:store (10) |
| @cap/module-auth | routes | 4 | 11 | 11 | @cap/module-auth:modules/authentication-core (3), @cap/layout:(root) (2), @cap/module-auth:modules/authorization-engine (2) | @cap/module-auth:modules/authentication-core (18), @cap/module-auth:modules/user-directory (13), @cap/module-auth:modules/authorization-engine (11) |
| @cap/module-auth | modules/authentication-core | 88 | 12 | 9 | @cap/platform-core:(root) (37), @cap/module-auth:routes (18), @cap/module-auth:domain-kernel (4) | @cap/module-auth:modules/user-directory (23), @cap/module-auth:modules/platform-cluster (14), @cap/module-auth:modules/identity-broker (10) |
| @cap/layout | (root) | 2 | 9 | 11 | @cap/layout:menu (20), @cap/layout:components (14), @cap/layout:layouts (6) | @cap/module-auth:modules/user-directory (12), @cap/app:(root) (4), @cap/module-auth:modules/identity-broker (3) |
| @cap/module-auth | (root) | 1 | 15 | 5 | @cap/module-auth:modules/authentication-core (3), @cap/module-auth:routes (3), @cap/module-auth:domain-kernel (2) | @cap/module-auth:modules/identity-broker (10), @cap/module-auth:modules/session-manager (4), @cap/module-auth:modules/authentication-core (1) |
| @cap/module-auth | modules/authorization-engine | 37 | 10 | 6 | @cap/module-auth:routes (11), @cap/platform-core:(root) (6), @cap/module-auth:domain-kernel (4) | @cap/module-auth:modules/user-directory (5), @cap/module-auth:modules/identity-broker (4), @cap/module-auth:(root) (2) |
| @cap/layout | menu | 88 | 11 | 4 | @cap/theme:(root) (39), @cap/shared-types:(root) (16), @cap/platform-core:(root) (13) | @cap/layout:(root) (20), @cap/layout:components (12), @cap/layout:styles (10) |
| @cap/layout | components | 23 | 10 | 3 | @cap/platform-store:(root) (13), @cap/shared-types:(root) (13), @cap/layout:menu (12) | @cap/layout:(root) (14), @cap/layout:menu (4), @cap/layout:layouts (3) |
| @cap/module-auth | modules/user-directory | 52 | 8 | 5 | @cap/module-auth:modules/authentication-core (23), @cap/platform-core:(root) (17), @cap/module-auth:routes (13) | @cap/module-auth:modules/authorization-engine (4), @cap/module-auth:modules/authentication-core (2), @cap/module-auth:(root) (1) |
| @cap/module-auth | modules/session-manager | 20 | 6 | 5 | @cap/module-auth:(root) (4), @cap/module-auth:routes (3), @cap/platform-core:(root) (3) | @cap/module-auth:(root) (2), @cap/module-auth:modules/authentication-core (2), @cap/module-auth:modules/authorization-engine (1) |
| @cap/authorization | (root) | 1 | 5 | 5 | @cap/authorization:enforcement (4), @cap/authorization:hooks (3), @cap/authorization:engine (2) | @cap/module-auth:modules/authentication-core (1), @cap/module-auth:modules/authorization-engine (1), @cap/platform-core:assembly (1) |
| @cap/module-auth | modules/platform-cluster | 41 | 7 | 3 | @cap/platform-core:(root) (15), @cap/module-auth:modules/authentication-core (14), @cap/module-auth:routes (6) | @cap/module-auth:(root) (2), @cap/module-auth:modules/authorization-engine (1), @cap/module-auth:routes (1) |
| @cap/platform-core | hooks | 10 | 8 | 2 | @cap/platform-store:(root) (5), @cap/shared-types:(root) (3), @cap/platform-core:types (2) | @cap/platform-core:(root) (9), @cap/platform-core:contexts (1) |
| @cap/theme | types | 7 | 2 | 8 | @cap/theme:assets (11), @cap/shared-types:(root) (2) | @cap/theme:utils (13), @cap/theme:hooks (11), @cap/theme:styled (6) |
| @cap/module-auth | modules/identity-broker | 30 | 7 | 2 | @cap/module-auth:(root) (10), @cap/module-auth:modules/authentication-core (10), @cap/platform-core:(root) (9) | @cap/module-auth:(root) (1), @cap/module-auth:routes (1) |
| @cap/platform-core | types | 10 | 4 | 5 | @cap/shared-types:(root) (10), @cap/theme:(root) (3), @cap/platform-store:(root) (2) | @cap/platform-core:(root) (2), @cap/platform-core:contexts (2), @cap/platform-core:hooks (2) |
| @cap/theme | components | 67 | 7 | 2 | @cap/shared-types:(root) (7), @cap/platform-store:(root) (6), @cap/theme:store (6) | @cap/theme:services (2), @cap/theme:(root) (1) |
| @cap/theme | utils | 10 | 4 | 5 | @cap/theme:assets (14), @cap/theme:types (13), @cap/shared-types:(root) (2) | @cap/theme:styled (16), @cap/theme:hooks (5), @cap/theme:overrides (2) |
| @cap/layout | hooks | 5 | 4 | 4 | @cap/platform-store:(root) (3), @cap/platform-core:(root) (1), @cap/shared-types:(root) (1) | @cap/layout:components (11), @cap/layout:menu (4), @cap/layout:(root) (3) |
| @cap/layout | layouts | 6 | 7 | 1 | @cap/shared-types:(root) (6), @cap/layout:components (3), @cap/layout:utils (3) | @cap/layout:(root) (6) |
| @cap/layout | styles | 15 | 5 | 3 | @cap/theme:(root) (15), @cap/layout:menu (10), @cap/layout:utils (5) | @cap/layout:menu (9), @cap/layout:(root) (6), @cap/layout:components (6) |
| @cap/module-landing | screens | 10 | 6 | 2 | @cap/platform-core:(root) (9), @cap/layout:(root) (2), @cap/module-landing:components (1) | @cap/module-landing:routes (8), @cap/module-landing:(root) (7) |

## Strongest Sub-Module Edges

| From | To | File-level edges |
| --- | --- | ---: |
| @cap/auth-contracts:services | @cap/auth-contracts:types | 163 |
| @cap/layout:menu | @cap/theme:(root) | 39 |
| @cap/module-auth:modules/authentication-core | @cap/platform-core:(root) | 37 |
| @cap/module-auth:modules/user-directory | @cap/module-auth:modules/authentication-core | 23 |
| @cap/layout:(root) | @cap/layout:menu | 20 |
| @cap/module-auth:modules/authentication-core | @cap/module-auth:routes | 18 |
| @cap/module-auth:modules/user-directory | @cap/platform-core:(root) | 17 |
| @cap/layout:menu | @cap/shared-types:(root) | 16 |
| @cap/theme:styled | @cap/theme:utils | 16 |
| @cap/layout:styles | @cap/theme:(root) | 15 |
| @cap/module-auth:modules/platform-cluster | @cap/platform-core:(root) | 15 |
| @cap/layout:(root) | @cap/layout:components | 14 |
| @cap/module-auth:modules/platform-cluster | @cap/module-auth:modules/authentication-core | 14 |
| @cap/theme:utils | @cap/theme:assets | 14 |
| @cap/layout:components | @cap/platform-store:(root) | 13 |
| @cap/layout:components | @cap/shared-types:(root) | 13 |
| @cap/layout:menu | @cap/platform-core:(root) | 13 |
| @cap/module-auth:modules/user-directory | @cap/module-auth:routes | 13 |
| @cap/theme:utils | @cap/theme:types | 13 |
| @cap/layout:components | @cap/layout:menu | 12 |
| @cap/layout:components | @cap/layout:utils | 12 |
| @cap/layout:menu | @cap/platform-store:(root) | 12 |
| @cap/module-auth:modules/user-directory | @cap/layout:(root) | 12 |
| @cap/module-auth:modules/user-directory | @cap/theme:(root) | 12 |
| @cap/platform-store:(root) | @cap/platform-store:store | 12 |

## File Hotspots

| File | Package | Sub-module | Internal out | Internal in | Cross-package out | Cross-package in |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| packages/platform-core/src/index.ts | @cap/platform-core | (root) | 27 | 129 | 3 | 129 |
| packages/shared-types/src/index.ts | @cap/shared-types | (root) | 8 | 122 | 0 | 122 |
| packages/theme/src/index.ts | @cap/theme | (root) | 18 | 104 | 0 | 104 |
| packages/layout/src/index.ts | @cap/layout | (root) | 52 | 27 | 1 | 27 |
| packages/platform-store/src/index.ts | @cap/platform-store | (root) | 3 | 64 | 0 | 64 |
| packages/modules/auth/src/routes/path.ts | @cap/module-auth | routes | 0 | 62 | 0 | 2 |
| packages/theme/src/overrides/core-overrides/index.ts | @cap/theme | overrides | 37 | 3 | 1 | 0 |
| packages/theme/src/types/index.ts | @cap/theme | types | 16 | 23 | 0 | 0 |
| packages/modules/auth/src/index.ts | @cap/module-auth | (root) | 20 | 16 | 2 | 2 |
| packages/layout/src/menu/types.ts | @cap/layout | menu | 1 | 32 | 1 | 0 |
| packages/modules/auth/src/modules/authentication-core/routes/routes.tsx | @cap/module-auth | modules/authentication-core | 28 | 1 | 1 | 0 |
| packages/layout/src/menu/utils/menuClasses.ts | @cap/layout | menu | 1 | 24 | 1 | 0 |
| packages/theme/src/assets/themes/index.ts | @cap/theme | assets | 23 | 2 | 0 | 0 |
| packages/platform-store/src/types.ts | @cap/platform-store | (root) | 11 | 11 | 0 | 0 |
| packages/layout/src/menu/contexts/verticalNavContext.tsx | @cap/layout | menu | 1 | 20 | 0 | 0 |
| packages/modules/auth/src/modules/authentication-core/hooks/useAuthQuery.ts | @cap/module-auth | modules/authentication-core | 4 | 17 | 1 | 0 |
| packages/modules/auth/src/modules/authentication-core/hooks/useAdminQuery.ts | @cap/module-auth | modules/authentication-core | 1 | 19 | 1 | 0 |
| packages/theme/src/components/ui/index.ts | @cap/theme | components | 18 | 1 | 0 | 0 |
| packages/theme/src/utils/themeObjectStyles.ts | @cap/theme | utils | 4 | 15 | 0 | 0 |
| packages/layout/src/menu/components/horizontal-menu/SubMenu.tsx | @cap/layout | menu | 16 | 2 | 1 | 0 |
| packages/modules/auth/src/modules/authorization-engine/services/adminService.ts | @cap/module-auth | modules/authorization-engine | 3 | 15 | 2 | 0 |
| packages/layout/src/menu/components/vertical-menu/Menu.tsx | @cap/layout | menu | 7 | 10 | 1 | 0 |
| packages/layout/src/menu/components/vertical-menu/SubMenu.tsx | @cap/layout | menu | 15 | 2 | 1 | 0 |
| packages/layout/src/utils/layoutClasses.ts | @cap/layout | utils | 0 | 17 | 0 | 0 |
| packages/modules/auth/src/modules/authentication-core/components/shared/auth/index.ts | @cap/module-auth | modules/authentication-core | 4 | 13 | 0 | 0 |

## Package Deep Dives

### @cap/module-auth
- Files analyzed: 332
- Package efferent coupling (Ce): 6
- Package afferent coupling (Ca): 3
- Strongest package dependencies: @cap/platform-core (99), @cap/layout (19), @cap/theme (19), @cap/shared-types (12), @cap/authorization (2)
- Strongest package dependents: @cap/layout (2), @cap/module-dashboard (1), @cap/module-theme (1)
- Most referenced external imports: @mui/material (162), react (152), react-i18next (133), react-router-dom (95), framer-motion (44)
- `routes`: 4 files, outgoing to 11 sub-modules, incoming from 11; strongest outgoing @cap/module-auth:modules/authentication-core (3), @cap/layout:(root) (2).
- `modules/authentication-core`: 88 files, outgoing to 12 sub-modules, incoming from 9; strongest outgoing @cap/platform-core:(root) (37), @cap/module-auth:routes (18).
- `(root)`: 1 files, outgoing to 15 sub-modules, incoming from 5; strongest outgoing @cap/module-auth:modules/authentication-core (3), @cap/module-auth:routes (3).
- `modules/authorization-engine`: 37 files, outgoing to 10 sub-modules, incoming from 6; strongest outgoing @cap/module-auth:routes (11), @cap/platform-core:(root) (6).
- `modules/user-directory`: 52 files, outgoing to 8 sub-modules, incoming from 5; strongest outgoing @cap/module-auth:modules/authentication-core (23), @cap/platform-core:(root) (17).
- `modules/session-manager`: 20 files, outgoing to 6 sub-modules, incoming from 5; strongest outgoing @cap/module-auth:(root) (4), @cap/module-auth:routes (3).
- `modules/platform-cluster`: 41 files, outgoing to 7 sub-modules, incoming from 3; strongest outgoing @cap/platform-core:(root) (15), @cap/module-auth:modules/authentication-core (14).
- `modules/identity-broker`: 30 files, outgoing to 7 sub-modules, incoming from 2; strongest outgoing @cap/module-auth:(root) (10), @cap/module-auth:modules/authentication-core (10).

### @cap/theme
- Files analyzed: 198
- Package efferent coupling (Ce): 3
- Package afferent coupling (Ca): 8
- Strongest package dependencies: @cap/shared-types (25), @cap/platform-store (6), @cap/platform-core (4)
- Strongest package dependents: @cap/layout (69), @cap/module-auth (19), @cap/module-theme (14), @cap/platform-core (13), @cap/module-dashboard (3)
- Most referenced external imports: @mui/material/styles (110), react (81), @mui/material (42), @tanstack/react-table (11), @mui/material/Box (7)
- `(root)`: 1 files, outgoing to 11 sub-modules, incoming from 27; strongest outgoing @cap/theme:assets (4), @cap/theme:context (3).
- `types`: 7 files, outgoing to 2 sub-modules, incoming from 8; strongest outgoing @cap/theme:assets (11), @cap/shared-types:(root) (2).
- `components`: 67 files, outgoing to 7 sub-modules, incoming from 2; strongest outgoing @cap/shared-types:(root) (7), @cap/platform-store:(root) (6).
- `utils`: 10 files, outgoing to 4 sub-modules, incoming from 5; strongest outgoing @cap/theme:assets (14), @cap/theme:types (13).
- `assets`: 36 files, outgoing to 4 sub-modules, incoming from 4; strongest outgoing @cap/theme:context (3), @cap/shared-types:(root) (1).
- `context`: 4 files, outgoing to 4 sub-modules, incoming from 4; strongest outgoing @cap/theme:types (4), @cap/shared-types:(root) (2).
- `hooks`: 8 files, outgoing to 3 sub-modules, incoming from 3; strongest outgoing @cap/theme:types (11), @cap/theme:context (6).
- `overrides`: 41 files, outgoing to 2 sub-modules, incoming from 2; strongest outgoing @cap/shared-types:(root) (10), @cap/theme:utils (2).

### @cap/layout
- Files analyzed: 149
- Package efferent coupling (Ce): 5
- Package afferent coupling (Ca): 5
- Strongest package dependencies: @cap/theme (69), @cap/shared-types (37), @cap/platform-store (31), @cap/platform-core (22), @cap/module-auth (2)
- Strongest package dependents: @cap/module-auth (19), @cap/app (4), @cap/module-landing (3), @cap/module-dashboard (1), @cap/module-theme (1)
- Most referenced external imports: react (73), @emotion/styled (42), @mui/material/styles (35), classnames (25), react-i18next (20)
- `(root)`: 2 files, outgoing to 9 sub-modules, incoming from 11; strongest outgoing @cap/layout:menu (20), @cap/layout:components (14).
- `menu`: 88 files, outgoing to 11 sub-modules, incoming from 4; strongest outgoing @cap/theme:(root) (39), @cap/shared-types:(root) (16).
- `components`: 23 files, outgoing to 10 sub-modules, incoming from 3; strongest outgoing @cap/platform-store:(root) (13), @cap/shared-types:(root) (13).
- `hooks`: 5 files, outgoing to 4 sub-modules, incoming from 4; strongest outgoing @cap/platform-store:(root) (3), @cap/platform-core:(root) (1).
- `layouts`: 6 files, outgoing to 7 sub-modules, incoming from 1; strongest outgoing @cap/shared-types:(root) (6), @cap/layout:components (3).
- `styles`: 15 files, outgoing to 5 sub-modules, incoming from 3; strongest outgoing @cap/theme:(root) (15), @cap/layout:menu (10).
- `providers`: 1 files, outgoing to 4 sub-modules, incoming from 2; strongest outgoing @cap/theme:(root) (2), @cap/platform-core:(root) (1).
- `utils`: 3 files, outgoing to 1 sub-modules, incoming from 5; strongest outgoing @cap/theme:(root) (1).

### @cap/platform-core
- Files analyzed: 66
- Package efferent coupling (Ce): 4
- Package afferent coupling (Ca): 8
- Strongest package dependencies: @cap/shared-types (30), @cap/platform-store (21), @cap/theme (13), @cap/authorization (3)
- Strongest package dependents: @cap/module-auth (99), @cap/layout (22), @cap/app (12), @cap/module-landing (12), @cap/module-dashboard (6)
- Most referenced external imports: react (21), @tanstack/react-query (3), @mui/material (2), react-router-dom (2), @mui/icons-material/Home (1)
- `(root)`: 2 files, outgoing to 14 sub-modules, incoming from 36; strongest outgoing @cap/platform-core:hooks (9), @cap/platform-core:contexts (5).
- `hooks`: 10 files, outgoing to 8 sub-modules, incoming from 2; strongest outgoing @cap/platform-store:(root) (5), @cap/shared-types:(root) (3).
- `types`: 10 files, outgoing to 4 sub-modules, incoming from 5; strongest outgoing @cap/shared-types:(root) (10), @cap/theme:(root) (3).
- `contexts`: 3 files, outgoing to 6 sub-modules, incoming from 2; strongest outgoing @cap/platform-core:types (2), @cap/theme:(root) (2).
- `services`: 20 files, outgoing to 4 sub-modules, incoming from 3; strongest outgoing @cap/platform-store:(root) (9), @cap/shared-types:(root) (5).
- `utils`: 6 files, outgoing to 4 sub-modules, incoming from 3; strongest outgoing @cap/shared-types:(root) (2), @cap/platform-core:configs (1).
- `assembly`: 2 files, outgoing to 5 sub-modules, incoming from 1; strongest outgoing @cap/shared-types:(root) (2), @cap/authorization:(root) (1).
- `authorization`: 1 files, outgoing to 2 sub-modules, incoming from 1; strongest outgoing @cap/authorization:(root) (1), @cap/platform-store:(root) (1).

### @cap/platform-store
- Files analyzed: 35
- Package efferent coupling (Ce): 3
- Package afferent coupling (Ca): 8
- Strongest package dependencies: @cap/shared-types (12), @cap/api-contracts (4), @cap/theme (1)
- Strongest package dependents: @cap/layout (31), @cap/platform-core (21), @cap/theme (6), @cap/authorization (3), @cap/module-auth (2)
- Most referenced external imports: zustand (11), comlink (4), react (2), idb (1), zustand/middleware (1)
- `(root)`: 2 files, outgoing to 2 sub-modules, incoming from 21; strongest outgoing @cap/platform-store:store (12), @cap/platform-store:services (1).
- `store`: 13 files, outgoing to 4 sub-modules, incoming from 2; strongest outgoing @cap/platform-store:(root) (10), @cap/shared-types:(root) (10).
- `services`: 20 files, outgoing to 3 sub-modules, incoming from 2; strongest outgoing @cap/api-contracts:(root) (4), @cap/platform-store:store (2).

### @cap/module-landing
- Files analyzed: 34
- Package efferent coupling (Ce): 5
- Package afferent coupling (Ca): 0
- Strongest package dependencies: @cap/platform-core (12), @cap/layout (3), @cap/shared-types (3), @cap/platform-store (1), @cap/theme (1)
- Strongest package dependents: None
- Most referenced external imports: @mui/material (24), react (22), react-router-dom (12), @mui/material/Grid (11), @mui/icons-material/CheckCircle (5)
- `screens`: 10 files, outgoing to 6 sub-modules, incoming from 2; strongest outgoing @cap/platform-core:(root) (9), @cap/layout:(root) (2).
- `(root)`: 1 files, outgoing to 7 sub-modules, incoming from 0; strongest outgoing @cap/module-landing:screens (7), @cap/module-landing:i18n (2).
- `routes`: 3 files, outgoing to 3 sub-modules, incoming from 1; strongest outgoing @cap/module-landing:screens (8), @cap/layout:(root) (1).
- `widgets`: 6 files, outgoing to 2 sub-modules, incoming from 2; strongest outgoing @cap/module-landing:components (1), @cap/shared-types:(root) (1).
- `components`: 11 files, outgoing to 1 sub-modules, incoming from 2; strongest outgoing @cap/module-landing:context (1).
- `context`: 2 files, outgoing to 0 sub-modules, incoming from 2; strongest outgoing None.
- `i18n`: 1 files, outgoing to 1 sub-modules, incoming from 1; strongest outgoing @cap/platform-core:(root) (2).

### @cap/app
- Files analyzed: 28
- Package efferent coupling (Ce): 5
- Package afferent coupling (Ca): 0
- Strongest package dependencies: @cap/platform-core (12), @cap/layout (4), @cap/shared-types (2), @cap/module-theme (1), @cap/theme (1)
- Strongest package dependents: None
- Most referenced external imports: react (13), react-i18next (2), react-router-dom (2), recharts (2), @mui/icons-material/ArrowUpward (1)
- `(root)`: 4 files, outgoing to 6 sub-modules, incoming from 0; strongest outgoing @cap/platform-core:(root) (6), @cap/layout:(root) (4).
- `utils`: 12 files, outgoing to 2 sub-modules, incoming from 2; strongest outgoing @cap/platform-core:(root) (3), @cap/shared-types:(root) (1).
- `lib`: 6 files, outgoing to 2 sub-modules, incoming from 0; strongest outgoing @cap/app:utils (4), @cap/platform-core:(root) (1).
- `hooks`: 2 files, outgoing to 1 sub-modules, incoming from 0; strongest outgoing @cap/platform-core:(root) (2).
- `assets`: 4 files, outgoing to 0 sub-modules, incoming from 0; strongest outgoing None.

### @cap/module-theme
- Files analyzed: 19
- Package efferent coupling (Ce): 5
- Package afferent coupling (Ca): 1
- Strongest package dependencies: @cap/theme (14), @cap/platform-core (2), @cap/shared-types (2), @cap/layout (1), @cap/module-auth (1)
- Strongest package dependents: @cap/app (1)
- Most referenced external imports: react (13), @mui/material (12), @emotion/styled (4), @mui/icons-material/Close (1), @mui/icons-material/Refresh (1)
- `(root)`: 1 files, outgoing to 4 sub-modules, incoming from 1; strongest outgoing @cap/module-theme:i18n (2), @cap/module-theme:routes (2).
- `routes`: 3 files, outgoing to 4 sub-modules, incoming from 1; strongest outgoing @cap/layout:(root) (1), @cap/module-auth:(root) (1).
- `screens`: 1 files, outgoing to 2 sub-modules, incoming from 2; strongest outgoing @cap/module-theme:components (7), @cap/theme:(root) (3).
- `components`: 13 files, outgoing to 1 sub-modules, incoming from 1; strongest outgoing @cap/theme:(root) (11).
- `i18n`: 1 files, outgoing to 1 sub-modules, incoming from 1; strongest outgoing @cap/platform-core:(root) (2).

### @cap/shared-types
- Files analyzed: 16
- Package efferent coupling (Ce): 0
- Package afferent coupling (Ca): 12
- Strongest package dependencies: None
- Strongest package dependents: @cap/layout (37), @cap/platform-core (30), @cap/theme (25), @cap/module-auth (12), @cap/platform-store (12)
- Most referenced external imports: react (1), react-toastify (1)
- `(root)`: 15 files, outgoing to 0 sub-modules, incoming from 47; strongest outgoing None.
- `contracts`: 1 files, outgoing to 0 sub-modules, incoming from 0; strongest outgoing None.

### @cap/authorization
- Files analyzed: 14
- Package efferent coupling (Ce): 3
- Package afferent coupling (Ca): 2
- Strongest package dependencies: @cap/platform-store (3), @cap/shared-types (3), @cap/platform-core (2)
- Strongest package dependents: @cap/platform-core (3), @cap/module-auth (2)
- Most referenced external imports: react (5), react-router-dom (1)
- `(root)`: 1 files, outgoing to 5 sub-modules, incoming from 5; strongest outgoing @cap/authorization:enforcement (4), @cap/authorization:hooks (3).
- `enforcement`: 4 files, outgoing to 5 sub-modules, incoming from 1; strongest outgoing @cap/authorization:hooks (3), @cap/authorization:engine (1).
- `hooks`: 3 files, outgoing to 3 sub-modules, incoming from 2; strongest outgoing @cap/authorization:engine (2), @cap/authorization:subject (2).
- `subject`: 1 files, outgoing to 1 sub-modules, incoming from 3; strongest outgoing @cap/shared-types:(root) (1).
- `engine`: 2 files, outgoing to 0 sub-modules, incoming from 3; strongest outgoing None.
- `policies`: 1 files, outgoing to 1 sub-modules, incoming from 1; strongest outgoing @cap/shared-types:(root) (1).
- `i18n`: 1 files, outgoing to 1 sub-modules, incoming from 0; strongest outgoing @cap/platform-core:(root) (2).
- `types`: 1 files, outgoing to 0 sub-modules, incoming from 0; strongest outgoing None.

### @cap/module-dashboard
- Files analyzed: 12
- Package efferent coupling (Ce): 6
- Package afferent coupling (Ca): 0
- Strongest package dependencies: @cap/platform-core (6), @cap/shared-types (5), @cap/theme (3), @cap/layout (1), @cap/module-auth (1)
- Strongest package dependents: None
- Most referenced external imports: react (7), @mui/material (6), react-i18next (4), @mui/icons-material/Cloud (2), @dnd-kit/core (1)
- `(root)`: 1 files, outgoing to 6 sub-modules, incoming from 0; strongest outgoing @cap/module-dashboard:i18n (2), @cap/module-dashboard:routes (2).
- `screens`: 1 files, outgoing to 4 sub-modules, incoming from 2; strongest outgoing @cap/module-dashboard:widgets (1), @cap/platform-core:(root) (1).
- `routes`: 2 files, outgoing to 4 sub-modules, incoming from 1; strongest outgoing @cap/layout:(root) (1), @cap/module-auth:(root) (1).
- `widgets`: 7 files, outgoing to 3 sub-modules, incoming from 2; strongest outgoing @cap/shared-types:(root) (3), @cap/platform-core:(root) (2).
- `i18n`: 1 files, outgoing to 1 sub-modules, incoming from 1; strongest outgoing @cap/platform-core:(root) (2).

### @cap/api-contracts
- Files analyzed: 5
- Package efferent coupling (Ce): 1
- Package afferent coupling (Ca): 2
- Strongest package dependencies: @cap/shared-types (2)
- Strongest package dependents: @cap/platform-store (4), @cap/auth-contracts (1)
- Most referenced external imports: None
- `(root)`: 3 files, outgoing to 2 sub-modules, incoming from 2; strongest outgoing @cap/api-contracts:types (3), @cap/shared-types:(root) (1).
- `types`: 2 files, outgoing to 1 sub-modules, incoming from 1; strongest outgoing @cap/shared-types:(root) (1).

### @cap/auth-contracts
- Files analyzed: 4
- Package efferent coupling (Ce): 3
- Package afferent coupling (Ca): 0
- Strongest package dependencies: @cap/shared-types (6), @cap/api-contracts (1), @cap/platform-store (1)
- Strongest package dependents: None
- Most referenced external imports: None
- `services`: 1 files, outgoing to 4 sub-modules, incoming from 1; strongest outgoing @cap/auth-contracts:types (163), @cap/shared-types:(root) (3).
- `types`: 1 files, outgoing to 1 sub-modules, incoming from 2; strongest outgoing @cap/shared-types:(root) (3).
- `(root)`: 1 files, outgoing to 2 sub-modules, incoming from 0; strongest outgoing @cap/auth-contracts:services (1), @cap/auth-contracts:types (1).
- `routes`: 1 files, outgoing to 0 sub-modules, incoming from 0; strongest outgoing None.
