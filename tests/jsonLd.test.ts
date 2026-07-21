import { describe, expect, it } from 'vitest'

import { SCHEMA_IDS, buildEssayPageJsonLd, buildHomePageJsonLd } from '@/lib/jsonLd'
import { PERSON_NAME, SITE_URL } from '@/lib/site'

describe('jsonLd', () => {
  it('keeps stable schema fragment ids', () => {
    expect(SCHEMA_IDS.person).toBe(`${SITE_URL}/#person`)
    expect(SCHEMA_IDS.publisher).toBe(`${SITE_URL}/#publisher`)
    expect(SCHEMA_IDS.website).toBe(`${SITE_URL}/#website`)
  })

  it('builds a home graph with site entities and ProfilePage', () => {
    const jsonLd = buildHomePageJsonLd({ canonicalUrl: `${SITE_URL}/` })
    const types = jsonLd['@graph'].map((node) => node['@type'])

    expect(types).toEqual(['WebSite', 'Organization', 'Person', 'ProfilePage'])
    expect(jsonLd['@graph'][3]).toMatchObject({
      '@type': 'ProfilePage',
      name: PERSON_NAME,
      mainEntity: { '@id': SCHEMA_IDS.person },
    })
  })

  it('builds an essay graph with site entities and Article', () => {
    const jsonLd = buildEssayPageJsonLd({
      title: 'On Writing',
      description: 'Excerpt',
      canonicalUrl: `${SITE_URL}/essays/purpose-of-writing`,
      datePublished: '2025-12-20T00:00:00.000Z',
    })
    const types = jsonLd['@graph'].map((node) => node['@type'])

    expect(types).toEqual(['WebSite', 'Organization', 'Person', 'Article'])
    expect(jsonLd['@graph'][3]).toMatchObject({
      '@type': 'Article',
      headline: 'On Writing',
      author: { '@id': SCHEMA_IDS.person },
    })
  })
})
