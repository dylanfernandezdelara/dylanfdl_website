import { describe, expect, it } from 'vitest'

import {
  isLogSuppressedError,
  SanitizedInfrastructureError,
} from '@/lib/sanitizedInfrastructureError'

describe('isLogSuppressedError', () => {
  it('returns true for SanitizedInfrastructureError instances', () => {
    expect(isLogSuppressedError(new SanitizedInfrastructureError('read cache'))).toBe(true)
  })

  it('returns true for Error objects with logSuppressed set', () => {
    const error = Object.assign(new Error('safe failure'), { logSuppressed: true as const })
    expect(isLogSuppressedError(error)).toBe(true)
  })

  it('returns false for plain objects with logSuppressed', () => {
    expect(isLogSuppressedError({ logSuppressed: true, message: 'safe failure' })).toBe(false)
  })
})
