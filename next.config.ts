import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  async redirects() {
    return [
      {
        source: '/about',
        destination: '/',
        permanent: true,
      },
      // Astro @astrojs/sitemap used these URLs; keep crawlers from 404ing.
      {
        source: '/sitemap-index.xml',
        destination: '/sitemap.xml',
        permanent: true,
      },
      {
        source: '/sitemap-0.xml',
        destination: '/sitemap.xml',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
