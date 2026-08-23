import { describe, expect, it } from 'vitest'

import { resolveMarkdownPage } from '@/lib/markdown/resolveMarkdownPage'
import {
  ABOUT_PAGE_PARAGRAPHS,
  CONTACT_PAGE_PARAGRAPHS,
  HOME_INTRO_PARAGRAPHS,
  PRIVACY_PAGE_PARAGRAPHS,
} from '@/lib/siteCopy'

describe('resolveMarkdownPage', () => {
  it('serves home markdown with heading structure and when-to-use pages', () => {
    const page = resolveMarkdownPage('/')

    expect(page.status).toBe(200)
    expect(page.body).toContain('# Dylan Fernandez de Lara')
    expect(page.body).toContain('## Profile')
    expect(page.body).toContain('## Work')
    expect(page.body).toContain('## Notes')
    expect(page.body).toContain('## About this site')
    expect(page.body).toContain('On Writing')
    expect(page.body).toContain('/about')
  })

  it('serves about, contact, and privacy markdown', () => {
    expect(resolveMarkdownPage('/about').body).toContain('# About')
    expect(resolveMarkdownPage('/contact').body).toContain(CONTACT_PAGE_PARAGRAPHS[0])
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

    expect(length(ABOUT_PAGE_PARAGRAPHS)).toBeGreaterThanOrEqual(500)
    expect(length(CONTACT_PAGE_PARAGRAPHS)).toBeGreaterThanOrEqual(500)
    expect(length(PRIVACY_PAGE_PARAGRAPHS)).toBeGreaterThanOrEqual(500)
    expect(length(HOME_INTRO_PARAGRAPHS)).toBeGreaterThanOrEqual(500)
  })
})
