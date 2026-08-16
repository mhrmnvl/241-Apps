// @ts-check
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      'node_modules/',
      'coverage/',
      'eslint.config.mjs',
      'eslint.typecheck.config.mjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  prettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
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

      // Disabled due to an upstream crash: `@typescript-eslint/unbound-method`
      // throws `Cannot read properties of undefined (reading 'kind')` under
      // ESLint 10's new AST traverser (still present in typescript-eslint 8.64,
      // the latest). It takes down the whole `lint:strict` run, so it is turned
      // off here to keep the other type-aware rules working. Re-enable once the
      // upstream fix lands. Test mocking also legitimately trips this rule.
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    // Test files legitimately use `any`/loosely-typed mocks (jest mocks, partial
    // fixtures). Relaxing the type-aware "unsafe" family here is the pattern
    // typescript-eslint itself recommends for tests — production `src/` keeps
    // full strictness.
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    // `no-unnecessary-type-assertion` misfires on Prisma's XOR create/update
    // input unions: tsc genuinely requires the cast here (verified with
    // `tsc --noEmit`), so the rule is scoped off for this file. Using an inline
    // disable instead would be reported as "unused" by the non-type-aware
    // `lint` config, which does not run this rule.
    files: ['**/prisma-profile-address.repository.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    },
  },
);
