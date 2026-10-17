import { describe, expect, it } from 'vitest'

import { buildLlmsTxt } from '@/lib/markdown/pages'
import { CONTACT_EMAIL, EMPLOYER_NAME, HOME_LAUNCHES, PERSON_ROLE, SITE_URL } from '@/lib/site'

describe('buildLlmsTxt', () => {
  it('includes when-to-use guidance and how to call the site', () => {
    const body = buildLlmsTxt()

    expect(body).toMatch(/## When to use this/i)
    expect(body).toContain(SITE_URL)
    expect(body).toContain(CONTACT_EMAIL)
    expect(body).toContain('Accept: text/markdown')
    expect(body).toContain('Do not use this site as a public API')
    expect(body).toContain('None published.')
    expect(body).toContain(
      `${PERSON_ROLE} at ${EMPLOYER_NAME}; earlier Meta post-training, ${HOME_LAUNCHES.map((item) => item.label).join(', ')}, and Meta Glasses`,
    )
    expect(body).not.toContain('Muse Spark 1.2')
    expect(body).not.toContain('On Writing')
  })
})
