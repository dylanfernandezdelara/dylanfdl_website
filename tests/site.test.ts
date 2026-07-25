import { describe, expect, it } from 'vitest'
import {
  CONTACT_LINKS,
  DEFAULT_DESCRIPTION,
  HOME_PAGE_TITLE,
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_URL,
  OG_IMAGE_WIDTH,
  PERSON_NAME,
  PERSON_NAME_ALTERNATES,
  PERSON_URL,
  REL_ME_URLS,
  SAME_AS,
  SITE_NAME,
  SITE_URL,
  SITEMAP_INDEX_URL,
  TWITTER_CREATOR,
  absoluteUrl,
  buildPageTitle,
  serializeJsonLd,
  toIsoDateTime,
} from '../lib/site'

/** Name spellings the site should signal to search engines. */
const REQUESTED_NAME_VARIANTS = [
  'Dylan Fernandez',
  'Dylan Fernandez de lara',
  'Dylan Lara',
  'Dylan fernandezdelara',
  'Dylan F',
] as const

describe('site', () => {
  it('uses the production domain', () => {
    expect(SITE_URL).toBe('https://www.dylanfdl.com')
  })

  it('builds absolute URLs from paths', () => {
    expect(absoluteUrl('/about')).toBe('https://www.dylanfdl.com/about')
    expect(PERSON_URL).toBe('https://www.dylanfdl.com/')
    expect(OG_IMAGE_URL).toBe('https://www.dylanfdl.com/og-image.png')
  })

  it('uses a short link-preview description', () => {
    expect(SITE_NAME).toBe('dylanfdl')
    expect(DEFAULT_DESCRIPTION).toBe(`${PERSON_NAME}. Portfolio, projects, music.`)
  })

  it('lists all requested name variants for structured data', () => {
    for (const variant of REQUESTED_NAME_VARIANTS) {
      expect(PERSON_NAME_ALTERNATES).toContain(variant)
    }
  })

  it('uses the short profile page title', () => {
    expect(HOME_PAGE_TITLE).toBe(PERSON_NAME)
    expect(buildPageTitle({ profilePage: true })).toBe(HOME_PAGE_TITLE)
  })

  it('includes the full name on content page titles', () => {
    expect(buildPageTitle({ title: 'On Writing' })).toBe('On Writing — Dylan Fernandez de Lara')
  })

  it('derives twitter creator from the X profile URL', () => {
    expect(TWITTER_CREATOR).toBe('@dylan_fdl_')
  })

  it('derives sameAs URLs from contact link flags', () => {
    expect(SAME_AS).toEqual(
      CONTACT_LINKS.filter((link) => 'sameAs' in link && link.sameAs).map((link) => link.href),
    )
  })

  it('derives rel=me URLs from contact link flags', () => {
    expect(REL_ME_URLS).toEqual(
      CONTACT_LINKS.filter((link) => 'relMe' in link && link.relMe).map((link) => link.href),
    )
  })

  it('excludes LinkedIn from rel=me URLs', () => {
    const linkedInUrl = CONTACT_LINKS.find((link) => link.href.includes('linkedin.com'))?.href
    expect(linkedInUrl).toBeDefined()
    expect(REL_ME_URLS).not.toContain(linkedInUrl)
  })

  it('normalizes post dates to ISO datetimes', () => {
    expect(toIsoDateTime('2025-12-20')).toBe('2025-12-20T00:00:00.000Z')
    expect(toIsoDateTime('2025-12-20T12:00:00.000Z')).toBe('2025-12-20T12:00:00.000Z')
  })

  it('defines OG image dimensions and alt text', () => {
    expect(OG_IMAGE_WIDTH).toBe(1200)
    expect(OG_IMAGE_HEIGHT).toBe(630)
    expect(OG_IMAGE_ALT).toBe(PERSON_NAME)
  })

  it('derives the sitemap index URL from SITE_URL', () => {
    expect(SITEMAP_INDEX_URL).toBe('https://www.dylanfdl.com/sitemap.xml')
  })

  it('escapes less-than in JSON-LD serialization', () => {
    const serialized = serializeJsonLd({ headline: '</script><img onerror=alert(1)>' })
    expect(serialized).not.toContain('</script>')
    expect(serialized).toContain('\\u003c')
  })
})
