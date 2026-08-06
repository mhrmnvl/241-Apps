/**
 * Fallback typing for `*.vue` single-file components — declared once for the
 * whole workspace.
 *
 * Two toolchains read these files and they do not agree:
 *
 * - `vue-tsc` (Volar), used by `typecheck` and `build`, resolves precise
 *   per-component types and overrides this shim entirely. Nothing here weakens
 *   those builds.
 * - The plain-TS program behind type-aware ESLint (`lint:strict`) has no Vue
 *   language plugin, so without a declaration every `.vue` import is `any`.
 *   That silently disables the `no-unsafe-*` rules at exactly the boundary
 *   where components are wired together.
 *
 * So the shim exists for the linter, not the compiler. It deliberately types
 * props loosely: a precise shape is impossible without Volar, and pretending
 * otherwise would report errors the real build does not have.
 *
 * Every app includes `packages/shared/src/**\/*.ts` in its `tsconfig.app.json`,
 * which is what makes one copy reach all three. Keep it here rather than per
 * app — three copies drifted apart once already, leaving `inventory` and
 * `admission` with untyped `.vue` imports while `academic` was fine.
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    unknown
  >
  export default component
}
