import { describe, expect, it } from 'vitest'

import { extractErrorMessage } from '@/lib/extractErrorMessage'

describe('extractErrorMessage', () => {
  it('returns the message from Error instances', () => {
    expect(extractErrorMessage(new Error('cache miss'))).toBe('cache miss')
  })

  it('returns primitive values as strings', () => {
    expect(extractErrorMessage('network down')).toBe('network down')
    expect(extractErrorMessage(404)).toBe('404')
    expect(extractErrorMessage(false)).toBe('false')
    expect(extractErrorMessage(null)).toBe('Unknown error')
    expect(extractErrorMessage(undefined)).toBe('Unknown error')
    expect(extractErrorMessage({ reason: 'offline' })).toBe('Unknown error')
    expect(extractErrorMessage(Symbol('offline'))).toBe('Unknown error')
  })
})
