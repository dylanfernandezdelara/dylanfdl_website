import { describe, expect, it } from 'vitest'

import { resolveMarkdownPage } from '@/lib/markdown/pages'
import { ABOUT_DOCUMENT, CONTACT_DOCUMENT, PRIVACY_DOCUMENT } from '@/lib/siteDocuments'

describe('resolveMarkdownPage', () => {
  it('serves home markdown with the card-grid work index and document links', () => {
    const page = resolveMarkdownPage('/')

    expect(page.status).toBe(200)
    expect(page.body).toContain('# Dylan Fernandez de Lara')
    expect(page.body).toContain('I am an optimist.')
    expect(page.body).toContain('Muse Spark 1.3')
    expect(page.body).not.toContain('Muse Spark 1.2')
    expect(page.body).toContain('## Notes')
    expect(page.body).toContain('No published notes yet.')
    expect(page.body).not.toContain('On Writing')
    expect(page.body).toContain('/about')
    expect(page.body).not.toContain('## About this site')
    expect(page.body).not.toContain('Do not use this site as a public API')
  })

  it('serves about, contact, and privacy markdown from the document catalog', () => {
    expect(resolveMarkdownPage('/about').body).toContain('# About')
    expect(resolveMarkdownPage('/about').body).toContain('Muse Spark 1.3')
    expect(resolveMarkdownPage('/about').body).not.toContain('Muse Spark 1.2')
    expect(resolveMarkdownPage('/contact').body).toContain(CONTACT_DOCUMENT.paragraphs[0])
    expect(resolveMarkdownPage('/contact').body).toContain('## Profiles')
    expect(resolveMarkdownPage('/privacy').body).toContain('# Privacy')
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
  it('keeps about, contact, and privacy above the 500-character floor', () => {
    const length = (paragraphs: readonly string[]) => paragraphs.join('').length

    expect(length(ABOUT_DOCUMENT.paragraphs)).toBeGreaterThanOrEqual(500)
    expect(length(CONTACT_DOCUMENT.paragraphs)).toBeGreaterThanOrEqual(500)
    expect(length(PRIVACY_DOCUMENT.paragraphs)).toBeGreaterThanOrEqual(500)
  })
})
