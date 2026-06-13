import path from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'

import { SITE_URL } from './site.config.mjs'

const root = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('astro').AstroUserConfig} */
export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'never',
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        page !== `${SITE_URL}/` &&
        !page.endsWith('/404') &&
        !page.includes('/prototype/'),
    }),
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
