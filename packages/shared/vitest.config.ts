import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Composables here coordinate through provide/inject, which needs real
    // component instances — so the tests mount, and mounting needs a DOM.
    environment: 'happy-dom',
    globals: true,
  },
})
