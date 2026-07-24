import path from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import tsconfigPaths from 'vite-tsconfig-paths'

const uiRoot = path.resolve(__dirname, '../../packages/ui/src')
const sharedRoot = path.resolve(__dirname, '../../packages/shared/src')
const masterDataRoot = path.resolve(__dirname, '../../packages/master-data/src')
const platformRoot = path.resolve(
  __dirname,
  '../../packages/platform/src/features',
)

export default defineConfig({
  server: { port: 5175 },
  plugins: [vue(), tailwindcss(), tsconfigPaths()],
  resolve: {
    dedupe: ['vue', 'pinia', 'vue-router'],
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
      {
        find: /^@\/master-data\/(.+)$/,
        replacement: path.resolve(masterDataRoot, '$1'),
      },
      { find: /^@\/master-data$/, replacement: masterDataRoot },
      {
        find: /^@\/features\/platform\/(.+)$/,
        replacement: path.resolve(platformRoot, '$1'),
      },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
})
