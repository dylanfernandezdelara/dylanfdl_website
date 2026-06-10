import { describe, expect, it } from 'vitest'
import {
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
    expect(SITE_URL).toBe('https://dylanfdl.com')
  })

  it('builds absolute URLs from paths', () => {
    expect(absoluteUrl('/about')).toBe('https://dylanfdl.com/about')
    expect(PERSON_URL).toBe('https://dylanfdl.com/about')
    expect(OG_IMAGE_URL).toBe('https://dylanfdl.com/og-image.png')
  })

  it('includes the full name and handle in the default description', () => {
    expect(SITE_NAME).toBe('dylanfdl')
    expect(DEFAULT_DESCRIPTION).toContain('Dylan Fernandez de Lara')
    expect(DEFAULT_DESCRIPTION).toContain('dylanfdl')
  })

  it('lists all requested name variants for structured data', () => {
    for (const variant of REQUESTED_NAME_VARIANTS) {
      expect(PERSON_NAME_ALTERNATES).toContain(variant)
    }
  })

  it('leads profile page titles with the full name', () => {
    expect(HOME_PAGE_TITLE.startsWith(PERSON_NAME)).toBe(true)
    expect(buildPageTitle({ profilePage: true })).toContain(PERSON_NAME)
    expect(buildPageTitle({ profilePage: true }).indexOf(PERSON_NAME)).toBe(0)
  })

  it('includes the full name on content page titles', () => {
    expect(buildPageTitle({ title: 'On Writing' })).toBe('On Writing — Dylan Fernandez de Lara')
  })

  it('derives twitter creator from the X profile URL', () => {
    expect(TWITTER_CREATOR).toBe('@dylan_fdl_')
  })

  it('excludes LinkedIn from rel=me URLs', () => {
    expect(REL_ME_URLS).not.toContain(SAME_AS[2])
    expect(REL_ME_URLS.every((url) => !url.includes('linkedin.com'))).toBe(true)
  })

  it('normalizes post dates to ISO datetimes', () => {
    expect(toIsoDateTime('2025-12-20')).toBe('2025-12-20T00:00:00.000Z')
    expect(toIsoDateTime('2025-12-20T12:00:00.000Z')).toBe('2025-12-20T12:00:00.000Z')
  })

  it('defines OG image dimensions and alt text', () => {
    expect(OG_IMAGE_WIDTH).toBe(1200)
    expect(OG_IMAGE_HEIGHT).toBe(630)
    expect(OG_IMAGE_ALT).toContain(PERSON_NAME)
  })

  it('derives the sitemap index URL from SITE_URL', () => {
    expect(SITEMAP_INDEX_URL).toBe('https://dylanfdl.com/sitemap-index.xml')
  })

  it('escapes less-than in JSON-LD serialization', () => {
    const serialized = serializeJsonLd({ headline: '</script><img onerror=alert(1)>' })
    expect(serialized).not.toContain('</script>')
    expect(serialized).toContain('\\u003c')
  })
})
