import { chromatic, type SlotOptions } from 'slot-text'

export const NOW_PLAYING_ROLL_TIMING = {
  stagger: 110,
  duration: 850,
  exitOffset: 80,
  bounce: 0.6,
  colorFade: 650,
} as const

export const NOW_PLAYING_ROLL_OPTIONS: Omit<SlotOptions, 'direction'> = {
  ...NOW_PLAYING_ROLL_TIMING,
  color: chromatic({ from: 190 }),
  skipUnchanged: false,
}
