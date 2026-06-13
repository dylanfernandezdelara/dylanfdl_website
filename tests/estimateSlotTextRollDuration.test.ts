import { describe, expect, it } from 'vitest'

import { estimateSlotTextRollDuration } from '../lib/estimateSlotTextRollDuration'
import { DEFAULT_OPTIMIST_ROLL_OPTIONS } from '../lib/optimistRollDefaults'

describe('estimateSlotTextRollDuration', () => {
  it('matches slot-text@0.2.2 safety-net timing for optimist.', () => {
    expect(
      estimateSlotTextRollDuration('optimist.', DEFAULT_OPTIMIST_ROLL_OPTIONS),
    ).toBe(801)
  })
})
