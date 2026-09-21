import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import reactCompiler from 'eslint-plugin-react-compiler'

import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default tseslint.config(
  {
    ignores: [
      'dist',
      'dev-dist',
      'node_modules',
      'coverage',
      'test-results',
      'analyze-report.cjs',
      'eslint-report-*.json',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'react-compiler': reactCompiler,
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json', './tsconfig.e2e.json'], // Web app usually has specific tsconfigs
        tsconfigRootDir: __dirname,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...prettierConfig.rules,

      'prettier/prettier': 'warn',

      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      'react-compiler/react-compiler': 'error',

      // Custom rules
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Architectural rules
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/apps/**', 'apps/**'],
              message:
                'ARCHITECTURAL VIOLATION: UI components in src/app cannot import from apps/.',
            },
            {
              group: ['**/src/app/Modules/**', '../Modules/**', './Modules/**'],
              message: 'ARCHITECTURAL VIOLATION: Components cannot directly import from Modules.',
            },
          ],
        },
      ],
    },
  },
)
