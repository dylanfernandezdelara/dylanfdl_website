import { describe, expect, it } from 'vitest'

import { getAllPosts } from '@/lib/posts'
import { SITE_URL, SITEMAP_INDEX_URL, absoluteUrl } from '@/lib/site'
import robots from '@/src/app/robots'
import sitemap from '@/src/app/sitemap'

describe('sitemap', () => {
  it('includes the home page and every essay', () => {
    const entries = sitemap()
    const urls = entries.map((entry) => entry.url)
    const posts = getAllPosts()

    expect(urls).toContain(SITE_URL)
    for (const post of posts) {
      expect(urls).toContain(absoluteUrl(`/essays/${post.slug}`))
    }
    expect(urls).toHaveLength(1 + posts.length)
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
