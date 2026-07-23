import { describe, expect, it } from 'vitest'

import nextConfig from '@/next.config'

describe('next.config redirects', () => {
  it('permanently redirects /about to the home page', async () => {
    const redirects = (await nextConfig.redirects?.()) ?? []

    expect(redirects).toContainEqual({
      source: '/about',
      destination: '/',
      permanent: true,
    })
  })

  it('permanently redirects legacy Astro sitemap URLs', async () => {
    const redirects = (await nextConfig.redirects?.()) ?? []

    expect(redirects).toContainEqual({
      source: '/sitemap-index.xml',
      destination: '/sitemap.xml',
      permanent: true,
    })
    expect(redirects).toContainEqual({
      source: '/sitemap-0.xml',
      destination: '/sitemap.xml',
      permanent: true,
    })
  })

  it('permanently redirects legacy essay URLs to notes', async () => {
    const redirects = (await nextConfig.redirects?.()) ?? []

    expect(redirects).toContainEqual({
      source: '/essays/:slug',
      destination: '/notes/:slug',
      permanent: true,
    })
  })
})
