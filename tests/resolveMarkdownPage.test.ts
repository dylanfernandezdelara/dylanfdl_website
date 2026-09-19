import { describe, expect, it } from 'vitest'

import { resolveMarkdownPage } from '@/lib/markdown/pages'
import { HOME_INTRO_LINKS } from '@/lib/site'
import { CONTACT_DOCUMENT, PRIVACY_DOCUMENT } from '@/lib/siteDocuments'

describe('resolveMarkdownPage', () => {
  it('serves home markdown with the card-grid work index and document links', () => {
    const page = resolveMarkdownPage('/')

    expect(page.status).toBe(200)
    expect(page.body).toContain('# Dylan Fernandez de Lara')
    expect(page.body).toContain('I am an optimist.')
    expect(page.body).toContain(
      `We recently launched [${HOME_INTRO_LINKS.muse.label}](${HOME_INTRO_LINKS.muse.href}), [${HOME_INTRO_LINKS.museSpark13.label}](${HOME_INTRO_LINKS.museSpark13.href}), and [${HOME_INTRO_LINKS.museCode.label}](${HOME_INTRO_LINKS.museCode.href}).`,
    )
    expect(page.body.indexOf(HOME_INTRO_LINKS.muse.href)).toBeLessThan(
      page.body.indexOf(HOME_INTRO_LINKS.museSpark13.href),
    )
    expect(page.body).not.toContain('Muse Spark 1.2')
    expect(page.body).toContain('## Notes')
    expect(page.body).toContain('No published notes yet.')
    expect(page.body).not.toContain('On Writing')
    expect(page.body).toContain('/contact')
    expect(page.body).not.toContain('/about')
    expect(page.body).not.toContain('## About this site')
    expect(page.body).not.toContain('Do not use this site as a public API')
  })

  it('serves contact and privacy markdown from the document catalog', () => {
    expect(resolveMarkdownPage('/contact').body).toContain(CONTACT_DOCUMENT.paragraphs[0])
    expect(resolveMarkdownPage('/contact').body).toContain('## Profiles')
    expect(resolveMarkdownPage('/privacy').body).toContain('# Privacy')
  })

  it('does not serve a standalone about document', () => {
    const page = resolveMarkdownPage('/about')

    expect(page.status).toBe(404)
    expect(page.body).not.toContain('# About')
  })

  it('404s retired and unknown note slugs', () => {
    const retired = resolveMarkdownPage('/notes/purpose-of-writing')
    expect(retired.status).toBe(404)
    expect(retired.body).toContain('# 404')

    const missing = resolveMarkdownPage('/notes/does-not-exist')
    expect(missing.status).toBe(404)
    expect(missing.body).toContain('# 404')
    expect(missing.body).toContain('llms.txt')
    expect(missing.body).toContain('sitemap.xml')
  })
})

describe('trust page copy length', () => {
  it('keeps contact and privacy above the 500-character floor', () => {
    const length = (paragraphs: readonly string[]) => paragraphs.join('').length

    expect(length(CONTACT_DOCUMENT.paragraphs)).toBeGreaterThanOrEqual(500)
    expect(length(PRIVACY_DOCUMENT.paragraphs)).toBeGreaterThanOrEqual(500)
  })
})
