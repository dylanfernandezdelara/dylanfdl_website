import { describe, expect, it } from 'vitest'

import { getSiteOrigin, isSameOriginRequest } from '@/lib/api/origin'

function makeHeaders(headers: Record<string, string | undefined>): Headers {
  const result = new Headers()
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      result.set(key, value)
    }
  }
  return result
}

describe('isSameOriginRequest', () => {
  it('accepts matching Origin headers', () => {
    const headers = makeHeaders({
      origin: 'https://www.dylanfdl.com',
      host: 'www.dylanfdl.com',
      'x-forwarded-proto': 'https',
    })

    expect(isSameOriginRequest(headers)).toBe(true)
  })

  it('accepts matching Referer when Origin is absent', () => {
    const headers = makeHeaders({
      referer: 'https://www.dylanfdl.com/about',
      host: 'www.dylanfdl.com',
      'x-forwarded-proto': 'https',
    })

    expect(isSameOriginRequest(headers)).toBe(true)
  })

  it('rejects cross-origin requests without trusted headers', () => {
    const headers = makeHeaders({
      host: 'www.dylanfdl.com',
      'x-forwarded-proto': 'https',
    })

    expect(isSameOriginRequest(headers)).toBe(false)
  })
})

describe('getSiteOrigin', () => {
  it('builds the site origin from forwarded headers', () => {
    const headers = makeHeaders({
      host: 'www.dylanfdl.com',
      'x-forwarded-proto': 'https',
    })

    expect(getSiteOrigin(headers)).toBe('https://www.dylanfdl.com')
  })
})
