import type { SlotOptions } from 'slot-text'

/** Mirrors slot-text@0.2.2 defaults used by OptimistText rolls. */
export const OPTIMIST_ROLL_DEFAULTS = {
  stagger: 45,
  duration: 300,
  exitOffset: 50,
  bounce: 0.6,
} as const

export const DEFAULT_OPTIMIST_ROLL_OPTIONS: SlotOptions = {
  direction: 'up',
  ...OPTIMIST_ROLL_DEFAULTS,
  skipUnchanged: false,
}

/** Safety margin after slot-text's internal maxEnd + 80ms rebuild timer. */
export const FINISH_ROLL_BUFFER_MS = 20
