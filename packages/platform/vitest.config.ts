import path from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

const sharedRoot = path.resolve(__dirname, '../shared/src')
const uiRoot = path.resolve(__dirname, '../ui/src')
const masterDataRoot = path.resolve(__dirname, '../master-data/src')
const platformRoot = path.resolve(__dirname, 'src/features')

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // Platform features address each other by the same public aliases the apps
    // use, so a test that pulls one in transitively needs the whole surface —
    // not just @/shared. Mirrors apps/*/vitest.config.ts.
    alias: [
      {
        find: /^@\/shared\/(.+)$/,
        replacement: path.resolve(sharedRoot, '$1'),
      },
      { find: /^@\/shared$/, replacement: sharedRoot },
      { find: /^@\/ui\/utils$/, replacement: path.resolve(uiRoot, 'utils') },
      {
        find: /^@\/ui\/(.+)$/,
        replacement: path.resolve(uiRoot, 'components/ui/$1'),
      },
      { find: /^@\/ui$/, replacement: uiRoot },
      {
        find: /^@\/master-data\/(.+)$/,
        replacement: path.resolve(masterDataRoot, '$1'),
      },
      { find: /^@\/master-data$/, replacement: masterDataRoot },
      {
        find: /^@\/features\/platform\/(.+)$/,
        replacement: path.resolve(platformRoot, '$1'),
      },
    ],
  },
  test: {
    environment: 'node',
    globals: true,
  },
})
