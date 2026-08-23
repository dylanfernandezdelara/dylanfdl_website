import { describe, expect, it } from 'vitest'

import nextConfig from '@/next.config'
import { APEX_HOST, SITE_URL } from '@/lib/site'

describe('next.config redirects', () => {
  it('permanently redirects the apex host to www', async () => {
    const redirects = (await nextConfig.redirects?.()) ?? []

    expect(redirects).toContainEqual({
      source: '/:path*',
      has: [{ type: 'host', value: APEX_HOST }],
      destination: `${SITE_URL}/:path*`,
      permanent: true,
    })
  })

  it('does not redirect /about so the about page can be served', async () => {
    const redirects = (await nextConfig.redirects?.()) ?? []

    expect(redirects.some((redirect) => redirect.source === '/about')).toBe(false)
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

  it('permanently redirects the retired On Writing note to home', async () => {
    const redirects = (await nextConfig.redirects?.()) ?? []
    const essaySpecificIndex = redirects.findIndex(
      (redirect) => redirect.source === '/essays/purpose-of-writing'
    )
    const essayGenericIndex = redirects.findIndex((redirect) => redirect.source === '/essays/:slug')

    expect(redirects).toContainEqual({
      source: '/notes/purpose-of-writing',
      destination: '/',
      permanent: true,
    })
    expect(redirects).toContainEqual({
      source: '/essays/purpose-of-writing',
      destination: '/',
      permanent: true,
    })
    expect(essaySpecificIndex).toBeGreaterThan(-1)
    expect(essayGenericIndex).toBeGreaterThan(-1)
    expect(essaySpecificIndex).toBeLessThan(essayGenericIndex)
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

describe('next.config rewrites and headers', () => {
  it('rewrites the well-known llms.txt alias', async () => {
    const rewrites = (await nextConfig.rewrites?.()) ?? []
    const list = Array.isArray(rewrites) ? rewrites : (rewrites.beforeFiles ?? [])

    expect(list).toContainEqual({
      source: '/.well-known/llms.txt',
      destination: '/llms.txt',
    })
  })

  it('does not set a site-wide Vary: Accept header on static assets', async () => {
    expect(nextConfig.headers).toBeUndefined()
  })
})
