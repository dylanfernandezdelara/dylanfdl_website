import { describe, expect, it } from 'vitest'

import { extractErrorMessage } from '@/lib/extractErrorMessage'

describe('extractErrorMessage', () => {
  it('returns the message from Error instances', () => {
    expect(extractErrorMessage(new Error('cache miss'))).toBe('cache miss')
  })

  it('returns a generic message for non-Error values', () => {
    expect(extractErrorMessage('network down')).toBe('network down')
    expect(extractErrorMessage(null)).toBe('Unknown error')
  })
})
