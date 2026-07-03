import type { SlotOptions } from 'slot-text'

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

export const SLOT_TEXT_INTERNAL_REBUILD_BUFFER_MS = 80

export const FINISH_ROLL_BUFFER_MS = 20
