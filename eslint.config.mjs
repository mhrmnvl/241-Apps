// @ts-check
import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '**/dist/',
      '**/node_modules/',
      '**/public/',
      // Backend has its own ESLint config/tooling — keep it out of the root
      // (frontend) lint entirely. A trailing-slash pattern does not match nested
      // files in flat config, so use the recursive glob.
      'backend/**',
      'eslint.config.mjs',
      'eslint.typecheck.config.mjs',
    ],
  },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...pluginVue.configs['flat/recommended'],
    ],
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        parser: tseslint.parser,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/define-emits-declaration': ['error', 'type-based'],
      'vue/define-props-declaration': ['error', 'type-based'],

      'vue/multi-word-component-names': [
        'error',
        {
          ignores: [
            'App',
            'Alert',
            'Avatar',
            'Badge',
            'Breadcrumb',
            'Button',
            'Calendar',
            'Card',
            'Checkbox',
            'Collapsible',
            'Command',
            'Dialog',
            'Field',
            'Input',
            'Label',
            'Pagination',
            'Popover',
            'Progress',
            'Select',
            'Separator',
            'Sheet',
            'Sidebar',
            'Skeleton',
            'Sonner',
            'Stepper',
            'Switch',
            'Table',
            'Tabs',
            'Textarea',
            'Tooltip',
          ],
        },
      ],
      'vue/require-default-prop': 'off',

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-empty-object-type': 'error',

      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  prettier,
)
