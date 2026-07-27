import path from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

const sharedRoot = path.resolve(__dirname, '../shared/src')

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: /^@\/shared\/(.+)$/,
        replacement: path.resolve(sharedRoot, '$1'),
      },
      { find: /^@\/shared$/, replacement: sharedRoot },
    ],
  },
  test: {
    environment: 'node',
    globals: true,
  },
})
