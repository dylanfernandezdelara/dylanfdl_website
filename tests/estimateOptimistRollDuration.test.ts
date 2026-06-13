import { describe, expect, it } from 'vitest'

import { estimateOptimistRollDuration } from '../lib/estimateOptimistRollDuration'
import { DEFAULT_OPTIMIST_ROLL_OPTIONS, OPTIMIST_ROLL_DEFAULTS } from '../lib/optimistRollDefaults'

function wobble(index: number, salt: number): number {
  const n = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453
  return (n - Math.floor(n)) * 2 - 1
}

/** Mirror slot-text@0.2.2 transform-only maxEnd for same-length rolls (no width/color paths). */
function slotTextTransformOnlyMaxEnd(
  text: string,
  options: typeof OPTIMIST_ROLL_DEFAULTS & { direction?: 'up' | 'down' },
): number {
  const { stagger, duration, exitOffset, bounce } = { ...OPTIMIST_ROLL_DEFAULTS, ...options }
  const maxLen = text.length
  let maxEnd = 0

  for (let i = 0; i < maxLen; i += 1) {
    const fromChar = text[i] ?? ''
    const toChar = text[i] ?? ''
    if (fromChar === toChar && fromChar === '') continue

    const isTail = toChar === ''
    const d = Math.round(duration * (isTail ? 0.75 : 1) * (1 + bounce * 0.45 * wobble(i, 1)))
    const staggerIndex = isTail ? text.length * 0.5 + (i - text.length) * 0.25 : i
    const base = Math.round(staggerIndex * stagger * (1 + bounce * 0.25 * wobble(i, 2)))
    maxEnd = Math.max(maxEnd, base + exitOffset + d)
  }

  return maxEnd + 80
}

describe('estimateOptimistRollDuration', () => {
  it('matches slot-text@0.2.2 safety-net timing for optimist.', () => {
    expect(estimateOptimistRollDuration('optimist.', DEFAULT_OPTIMIST_ROLL_OPTIONS)).toBe(801)
  })

  it('matches slot-text transform-only contract for OptimistText roll options', () => {
    const text = 'optimist.'
    const options = DEFAULT_OPTIMIST_ROLL_OPTIONS
    expect(estimateOptimistRollDuration(text, options)).toBe(
      slotTextTransformOnlyMaxEnd(text, options),
    )
  })
})
