import { describe, expect, it } from 'vitest'

import { toLogErrorMessage } from '@/lib/sanitizeLogError'

describe('toLogErrorMessage', () => {
  it('returns the message from Error instances', () => {
    expect(toLogErrorMessage(new Error('cache miss'))).toBe('cache miss')
  })

  it('returns a generic message for non-Error values', () => {
    expect(toLogErrorMessage('network down')).toBe('Unknown error')
    expect(toLogErrorMessage(null)).toBe('Unknown error')
  })
})
