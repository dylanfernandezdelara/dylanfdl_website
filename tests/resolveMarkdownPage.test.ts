import { describe, expect, it } from 'vitest'

import { resolveMarkdownPage } from '@/lib/markdown/pages'
import { ABOUT_DOCUMENT, CONTACT_DOCUMENT, PRIVACY_DOCUMENT } from '@/lib/siteDocuments'

describe('resolveMarkdownPage', () => {
  it('serves home markdown with the card-grid work index and document links', () => {
    const page = resolveMarkdownPage('/')

    expect(page.status).toBe(200)
    expect(page.body).toContain('# Dylan Fernandez de Lara')
    expect(page.body).toContain('I am an optimist.')
    expect(page.body).toContain('## Notes')
    expect(page.body).toContain('On Writing')
    expect(page.body).toContain('/about')
    expect(page.body).not.toContain('## About this site')
    expect(page.body).not.toContain('Do not use this site as a public API')
  })

  it('serves about, contact, and privacy markdown from the document catalog', () => {
    expect(resolveMarkdownPage('/about').body).toContain('# About')
    expect(resolveMarkdownPage('/contact').body).toContain(CONTACT_DOCUMENT.paragraphs[0])
    expect(resolveMarkdownPage('/contact').body).toContain('## Profiles')
    expect(resolveMarkdownPage('/privacy').body).toContain('# Privacy')
  })

  it('serves published note markdown and 404s unknown slugs', () => {
    const note = resolveMarkdownPage('/notes/purpose-of-writing')
    expect(note.status).toBe(200)
    expect(note.body).toContain('# On Writing')
    expect(note.body).toContain('I have decided to start writing')
    expect(note.body).toContain('Canonical: https://www.dylanfdl.com/notes/purpose-of-writing')

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
