/// <reference types="vite/client" />

// Fallback typing for `*.vue` single-file components.
// `vue-tsc` (Volar) resolves precise per-component types during build/typecheck
// and overrides this shim; it exists so the plain-TS program used by type-aware
// ESLint (`lint:strict`) sees `.vue` imports as a component instead of `error`.
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    unknown
  >
  export default component
}
