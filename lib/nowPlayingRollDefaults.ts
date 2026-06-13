import { chromatic, type SlotOptions } from 'slot-text'

/**
 * slot-text roll timing for the Spotify now-playing line.
 * Tune `duration` (ms per letter) and `stagger` (ms between letters) here.
 */
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
