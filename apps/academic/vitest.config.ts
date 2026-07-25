import path from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

const uiRoot = path.resolve(__dirname, '../../packages/ui/src')
const sharedRoot = path.resolve(__dirname, '../../packages/shared/src')

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      { find: /^@\/ui\/utils$/, replacement: path.resolve(uiRoot, 'utils') },
      {
        find: /^@\/ui\/(.+)$/,
        replacement: path.resolve(uiRoot, 'components/ui/$1'),
      },
      { find: /^@\/ui$/, replacement: uiRoot },
      {
        find: /^@\/shared\/(.+)$/,
        replacement: path.resolve(sharedRoot, '$1'),
      },
      { find: /^@\/shared$/, replacement: sharedRoot },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
  test: {
    environment: 'node',
    globals: true,
  },
})
