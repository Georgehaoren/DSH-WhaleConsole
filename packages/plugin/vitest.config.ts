import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@dsh-whale-console/skins': fileURLToPath(new URL('../skins/src/index.ts', import.meta.url)),
    },
  },
})
