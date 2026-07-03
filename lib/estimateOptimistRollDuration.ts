import type { SlotOptions } from 'slot-text'

import { OPTIMIST_ROLL_DEFAULTS, SLOT_TEXT_INTERNAL_REBUILD_BUFFER_MS } from './optimistRollDefaults'

function wobble(index: number, salt: number): number {
  const n = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453
  return (n - Math.floor(n)) * 2 - 1
}

export function estimateOptimistRollDuration(
  text: string,
  options: Pick<SlotOptions, keyof typeof OPTIMIST_ROLL_DEFAULTS> = {},
): number {
  const { stagger, duration, exitOffset, bounce } = { ...OPTIMIST_ROLL_DEFAULTS, ...options }
  const maxLen = text.length

  let maxEnd = 0
  for (let i = 0; i < maxLen; i += 1) {
    const letterDuration = Math.round(duration * (1 + bounce * 0.45 * wobble(i, 1)))
    const base = Math.round(i * stagger * (1 + bounce * 0.25 * wobble(i, 2)))
    maxEnd = Math.max(maxEnd, base + exitOffset + letterDuration)
  }

  return maxEnd + SLOT_TEXT_INTERNAL_REBUILD_BUFFER_MS
}
