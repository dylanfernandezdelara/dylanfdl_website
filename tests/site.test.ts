import { describe, expect, it } from 'vitest'
import {
  DEFAULT_DESCRIPTION,
  HOME_PAGE_TITLE,
  PERSON_NAME,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  buildPageTitle,
} from '../lib/site'

describe('site', () => {
  it('uses the production domain', () => {
    expect(SITE_URL).toBe('https://dylanfdl.com')
  })

  it('builds absolute URLs from paths', () => {
    expect(absoluteUrl('/about')).toBe('https://dylanfdl.com/about')
  })

  it('includes the full name and handle in the default description', () => {
    expect(SITE_NAME).toBe('dylanfdl')
    expect(DEFAULT_DESCRIPTION).toContain('Dylan Fernandez de Lara')
    expect(DEFAULT_DESCRIPTION).toContain('dylanfdl')
  })

  it('leads profile page titles with the full name', () => {
    expect(HOME_PAGE_TITLE.startsWith(PERSON_NAME)).toBe(true)
    expect(buildPageTitle({ profilePage: true })).toContain(PERSON_NAME)
    expect(buildPageTitle({ profilePage: true }).indexOf(PERSON_NAME)).toBe(0)
  })

  it('includes the full name on content page titles', () => {
    expect(buildPageTitle({ title: 'On Writing' })).toBe('On Writing — Dylan Fernandez de Lara')
  })
})
