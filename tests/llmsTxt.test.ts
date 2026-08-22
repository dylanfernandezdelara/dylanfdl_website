import { describe, expect, it } from 'vitest'

import { buildLlmsTxt } from '@/lib/siteCopy'
import { CONTACT_EMAIL, SITE_URL } from '@/lib/site'

describe('buildLlmsTxt', () => {
  it('includes when-to-use guidance and how to call the site', () => {
    const body = buildLlmsTxt()

    expect(body).toMatch(/## When to use this/i)
    expect(body).toContain(SITE_URL)
    expect(body).toContain(CONTACT_EMAIL)
    expect(body).toContain('Accept: text/markdown')
    expect(body).toContain('Do not use this site as a public API')
    expect(body).toContain('On Writing')
  })
})
