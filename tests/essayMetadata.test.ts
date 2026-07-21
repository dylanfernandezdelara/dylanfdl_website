import { describe, expect, it } from 'vitest'

import { getPostBySlug } from '@/lib/posts'
import { PERSON_NAME, absoluteUrl, buildPageTitle } from '@/lib/site'
import { generateMetadata } from '@/src/app/essays/[slug]/page'

describe('essay generateMetadata', () => {
  it('builds title, description, canonical, and article OG fields', async () => {
    const post = getPostBySlug('purpose-of-writing')
    if (!post) {
      throw new Error('expected purpose-of-writing essay fixture')
    }

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: post.slug }),
    })

    const pageTitle = buildPageTitle({ title: post.title })

    expect(metadata.title).toEqual({ absolute: pageTitle })
    expect(metadata.description).toBe(post.excerpt)
    expect(metadata.alternates).toEqual({ canonical: `/essays/${post.slug}` })
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      title: pageTitle,
      description: post.excerpt,
      url: absoluteUrl(`/essays/${post.slug}`),
      siteName: PERSON_NAME,
    })
  })

  it('returns empty metadata for unknown slugs', async () => {
    await expect(
      generateMetadata({
        params: Promise.resolve({ slug: 'does-not-exist' }),
      }),
    ).resolves.toEqual({})
  })
})
