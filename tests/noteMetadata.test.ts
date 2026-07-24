import { describe, expect, it } from 'vitest'

import { getEntryBySlug } from '@/lib/content'
import {
  DEFAULT_DESCRIPTION,
  PERSON_NAME,
  absoluteUrl,
  buildPageTitle,
} from '@/lib/site'
import { generateMetadata } from '@/src/app/notes/[slug]/page'

describe('note generateMetadata', () => {
  it('builds title, description, canonical, and article OG fields', async () => {
    const entry = getEntryBySlug('notes', 'purpose-of-writing')
    if (!entry) {
      throw new Error('expected purpose-of-writing note fixture')
    }

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: entry.slug }),
    })

    const pageTitle = buildPageTitle({ title: entry.title })
    const description = entry.summary ?? DEFAULT_DESCRIPTION

    expect(metadata.title).toEqual({ absolute: pageTitle })
    expect(metadata.description).toBe(description)
    expect(metadata.alternates).toEqual({ canonical: `/notes/${entry.slug}` })
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      title: pageTitle,
      description,
      url: absoluteUrl(`/notes/${entry.slug}`),
      siteName: PERSON_NAME,
    })
  })

  it('returns empty metadata for unknown slugs', async () => {
    await expect(
      generateMetadata({
        params: Promise.resolve({ slug: 'does-not-exist' }),
      })
    ).resolves.toEqual({})
  })
})
