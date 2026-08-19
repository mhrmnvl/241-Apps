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
      'backend/',
      'eslint.config.mjs',
      'eslint.typecheck.config.mjs',
    ],
  },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
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
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'],
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
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-empty-object-type': 'error',

      /**
       * `||` stays allowed on strings, and only on strings.
       *
       * The rule is right about the general case and wrong about this one. An
       * empty string is a value a form actually produces — a cleared input is
       * `''`, not null — so `??` keeps it and sends the empty string onward.
       * That is what happened to the calendar's optional hours: taking the
       * autofix would have posted `""` into a field validated as `HH:mm`.
       *
       * Numbers and booleans are deliberately left under the rule, because
       * there `||` usually *is* the bug: `score || 100` silently rewrites a
       * mark of zero, and a report card is exactly the place that must not
       * happen. `ignorePrimitives` is typescript-eslint's own option for
       * drawing that line.
       */
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        { ignorePrimitives: { string: true } },
      ],

      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',

      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',

      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  prettier,
)
