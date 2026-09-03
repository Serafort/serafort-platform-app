import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'

// Workspace architectural layers.
// Note: several @cap/module-* and @cap/civil-registry packages listed below are provisioned
// ahead of package creation to reserve their architectural layer boundaries.
const Layers = {
  FOUNDATION: ['@cap/shared-types', '@cap/api-contracts'],
  LAYER_1: ['@cap/auth-contracts', '@cap/theme'],
  LAYER_2: ['@cap/platform-store'],
  LAYER_3: ['@cap/platform-core'],
  LAYER_4: ['@cap/layout', '@cap/civil-registry'],
  LAYER_5: ['@cap/module-admin', '@cap/module-auth', '@cap/module-landing', '@cap/module-theme', '@cap/module-kyc', '@cap/module-digital-id', '@cap/module-blockchain-idaas', '@cap/module-monitoring-alerts', '@cap/module-user'],
  LAYER_6: ['@cap/app'],
  ID_AAS: ['@idaas/authentication-core', '@idaas/authorization-engine', '@idaas/identity-broker', '@idaas/mfa-orchestrator', '@idaas/passwordless-service', '@idaas/platform-cluster', '@idaas/session-manager', '@idaas/user-directory'],
}

const restrictedLayers = [
  { group: Layers.LAYER_6, message: '@cap/app can only depend on layers below it' },
  { group: Layers.LAYER_5, message: 'Modules cannot depend on @cap/app (layer 6)' },
  { group: Layers.LAYER_4, message: 'Layout cannot depend on modules (layer 5+) or @cap/app (layer 6)' },
  { group: Layers.LAYER_3, message: 'Platform-core cannot depend on layout (layer 4+), modules (layer 5), or @cap/app (layer 6)' },
  { group: Layers.LAYER_2, message: 'Platform primitives cannot depend on platform-core (layer 3+), layout, modules, or @cap/app' },
  { group: Layers.LAYER_1, message: 'Layer 1 packages cannot depend on platform primitives (layer 2+)' },
  { group: Layers.FOUNDATION, message: 'Foundation packages cannot depend on any other workspace packages' },
]

function createLayerRules(currentLayer) {
  const allowedGroups = [
    ...Layers.FOUNDATION,
    ...Layers.LAYER_1,
    ...Layers.LAYER_2,
  ]

  if (currentLayer >= 2) allowedGroups.push(...Layers.LAYER_2)
  if (currentLayer >= 3) allowedGroups.push(...Layers.LAYER_3)
  if (currentLayer >= 4) allowedGroups.push(...Layers.LAYER_4)
  if (currentLayer >= 5) allowedGroups.push(...Layers.LAYER_5)

  return {
    'import/no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: Layers.LAYER_3,
            message: `Layer ${currentLayer} cannot depend on @cap/platform-core (layer 3 barrel)`,
          },
          {
            group: Layers.LAYER_4,
            message: `Layer ${currentLayer} cannot depend on layout or domain packages (layer 4)`,
          },
          {
            group: Layers.LAYER_5,
            message: `Layer ${currentLayer} cannot depend on feature modules (layer 5)`,
          },
          {
            group: Layers.LAYER_6,
            message: `Layer ${currentLayer} cannot depend on @cap/app (layer 6)`,
          },
        ],
      },
    ],
  }
}

export const baseConfig = tseslint.config(
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/no-unresolved': 'error',
      'import/order': ['warn', {
        'groups': [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
          'object',
          'type',
        ],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true,
        },
      }],
    },
  },
)

export const layerConfigs = {
  foundation: {
    name: 'cap/layer-foundation',
    rules: {
      'import/no-restricted-imports': ['error', {
        patterns: [
          {
            group: [...Layers.LAYER_1, ...Layers.LAYER_2, ...Layers.LAYER_3, ...Layers.LAYER_4, ...Layers.LAYER_5, ...Layers.LAYER_6],
            message: 'Foundation packages (@cap/shared-types, @cap/api-contracts) cannot depend on other workspace packages',
          },
        ],
      }],
    },
  },
  layer1: {
    name: 'cap/layer-1',
    rules: {
      'import/no-restricted-imports': ['error', {
        patterns: [
          {
            group: [...Layers.LAYER_2, ...Layers.LAYER_3, ...Layers.LAYER_4, ...Layers.LAYER_5, ...Layers.LAYER_6],
            message: 'Layer 1 packages cannot depend on platform primitives or higher layers',
          },
        ],
      }],
    },
  },
  layer2: {
    name: 'cap/layer-2',
    rules: {
      'import/no-restricted-imports': ['error', {
        patterns: [
          {
            group: [...Layers.LAYER_3, ...Layers.LAYER_4, ...Layers.LAYER_5, ...Layers.LAYER_6],
            message: 'Layer 2 packages cannot depend on platform-core, layout, modules, or app',
          },
        ],
      }],
    },
  },
  layer3: {
    name: 'cap/layer-3',
    rules: {
      'import/no-restricted-imports': ['error', {
        patterns: [
          {
            group: [...Layers.LAYER_4, ...Layers.LAYER_5, ...Layers.LAYER_6],
            message: 'Platform-core cannot depend on layout, modules, or app',
          },
        ],
      }],
    },
  },
  layer4: {
    name: 'cap/layer-4',
    rules: {
      'import/no-restricted-imports': ['error', {
        patterns: [
          {
            group: [...Layers.LAYER_5, ...Layers.LAYER_6],
            message: 'Layout/Civil-registry cannot depend on modules or app',
          },
        ],
      }],
    },
  },
  layer5: {
    name: 'cap/layer-5',
    rules: {
      'import/no-restricted-imports': ['error', {
        patterns: [
          {
            group: Layers.LAYER_6,
            message: 'Modules cannot depend on @cap/app',
          },
        ],
      }],
    },
  },
  idaas: {
    name: 'cap/idaas',
    rules: {
      'import/no-restricted-imports': ['error', {
        patterns: [
          {
            group: [...Layers.LAYER_3, ...Layers.LAYER_4, ...Layers.LAYER_5, ...Layers.LAYER_6],
            message: '@idaas packages cannot depend on platform packages or app',
          },
        ],
      }],
    },
  },
}

export default baseConfig
