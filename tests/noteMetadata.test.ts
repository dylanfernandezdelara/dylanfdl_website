import { describe, expect, it } from 'vitest'

import { getEntryBySlug, resolveContentDescription } from '@/lib/content'
import { DEFAULT_DESCRIPTION, PERSON_NAME, absoluteUrl, buildPageTitle } from '@/lib/site'
import { generateMetadata } from '@/src/app/(article)/notes/[slug]/page'

describe('note generateMetadata', () => {
  it('builds title, description, canonical, and article OG fields', async () => {
    const entry = getEntryBySlug('notes', 'component-showcase', { allowDrafts: true })
    if (!entry) {
      throw new Error('expected component-showcase note fixture')
    }

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: entry.slug }),
    })

    const pageTitle = buildPageTitle({ title: entry.title })
    const description = resolveContentDescription(entry.summary)

    expect(metadata.title).toEqual({ absolute: pageTitle })
    expect(metadata.description).toBe(description)
    expect(metadata.alternates).toEqual({
      canonical: `/notes/${entry.slug}`,
      types: { 'text/markdown': `/notes/${entry.slug}` },
    })
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      title: pageTitle,
      description,
      url: absoluteUrl(`/notes/${entry.slug}`),
      siteName: PERSON_NAME,
    })
  })

  it('falls back to the site description when a note has no summary', () => {
    expect(resolveContentDescription(undefined)).toBe(DEFAULT_DESCRIPTION)
  })

  it('returns empty metadata for unknown slugs', async () => {
    await expect(
      generateMetadata({
        params: Promise.resolve({ slug: 'does-not-exist' }),
      })
    ).resolves.toEqual({})
  })
})
