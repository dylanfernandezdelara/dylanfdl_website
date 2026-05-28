import path from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'

const root = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('astro').AstroUserConfig} */
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  output: 'static',
  vite: {
    resolve: {
      alias: {
        '@': root,
      },
    },
  },
})
