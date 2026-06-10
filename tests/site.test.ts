import { describe, expect, it } from 'vitest'
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from '../lib/site'

describe('site', () => {
  it('uses the production domain', () => {
    expect(SITE_URL).toBe('https://dylanfdl.com')
  })

  it('builds absolute URLs from paths', () => {
    expect(absoluteUrl('/about')).toBe('https://dylanfdl.com/about')
  })

  it('includes the dylanfdl handle in the default description', () => {
    expect(SITE_NAME).toBe('dylanfdl')
    expect(DEFAULT_DESCRIPTION).toContain('dylanfdl')
  })
})
