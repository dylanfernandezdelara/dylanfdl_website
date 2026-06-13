import { describe, expect, it } from 'vitest'

import { getSiteOrigin, isSameOriginRequest } from '@/lib/api/origin'
import type { ApiRequest } from '@/lib/api/vercel'

function makeRequest(headers: Record<string, string | undefined>): ApiRequest {
  return {
    query: {},
    headers,
  } as ApiRequest
}

describe('isSameOriginRequest', () => {
  it('accepts matching Origin headers', () => {
    const req = makeRequest({
      origin: 'https://www.dylanfdl.com',
      host: 'www.dylanfdl.com',
      'x-forwarded-proto': 'https',
    })

    expect(isSameOriginRequest(req)).toBe(true)
  })

  it('accepts matching Referer when Origin is absent', () => {
    const req = makeRequest({
      referer: 'https://www.dylanfdl.com/about',
      host: 'www.dylanfdl.com',
      'x-forwarded-proto': 'https',
    })

    expect(isSameOriginRequest(req)).toBe(true)
  })

  it('rejects cross-origin requests without trusted headers', () => {
    const req = makeRequest({
      host: 'www.dylanfdl.com',
      'x-forwarded-proto': 'https',
    })

    expect(isSameOriginRequest(req)).toBe(false)
  })
})

describe('getSiteOrigin', () => {
  it('builds the site origin from forwarded headers', () => {
    const req = makeRequest({
      host: 'www.dylanfdl.com',
      'x-forwarded-proto': 'https',
    })

    expect(getSiteOrigin(req)).toBe('https://www.dylanfdl.com')
  })
})
