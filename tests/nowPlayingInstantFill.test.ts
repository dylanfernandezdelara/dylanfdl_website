import { describe, expect, it } from 'vitest'

import { markPendingInstantFill } from '@/lib/nowPlayingInstantFill'

describe('markPendingInstantFill', () => {
  it('marks instant fill when bootstrap should roll in immediately', () => {
    expect(markPendingInstantFill(false, true, true)).toBe(true)
  })

  it('keeps pending fill after a follow-up apply skips rolling', () => {
    expect(markPendingInstantFill(true, false, false)).toBe(true)
  })

  it('stays false when no instant fill is needed', () => {
    expect(markPendingInstantFill(false, false, false)).toBe(false)
  })
})
