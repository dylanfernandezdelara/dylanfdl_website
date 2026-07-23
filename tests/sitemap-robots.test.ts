import { describe, expect, it } from 'vitest'

import { contentCanonicalPath, getPublishedEntries } from '@/lib/content'
import { SITE_URL, SITEMAP_INDEX_URL, absoluteUrl } from '@/lib/site'
import robots from '@/src/app/robots'
import sitemap from '@/src/app/sitemap'

describe('sitemap', () => {
  it('includes the home page and every published writing entry', () => {
    const entries = sitemap()
    const urls = entries.map((entry) => entry.url)
    const published = getPublishedEntries()

    expect(urls).toContain(SITE_URL)
    for (const entry of published) {
      expect(urls).toContain(absoluteUrl(contentCanonicalPath(entry.kind, entry.slug)))
    }
    expect(urls).toHaveLength(1 + published.length)
    expect(urls.some((url) => url.includes('component-showcase'))).toBe(false)
  })
})

describe('robots', () => {
  it('allows all crawlers and points at the sitemap', () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: '*',
        allow: '/',
      },
      sitemap: SITEMAP_INDEX_URL,
    })
  })
})
