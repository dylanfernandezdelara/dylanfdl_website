import { describe, expect, it } from 'vitest'

import {
  formatCompactTrackLine,
  pickNowPlayingTrackLayout,
} from '@/lib/nowPlayingTrackLayout'

describe('nowPlayingTrackLayout', () => {
  it('formats the compact single-line track copy', () => {
    expect(formatCompactTrackLine('Instant Crush', 'Daft Punk')).toBe(
      'Instant Crush • Daft Punk',
    )
  })

  it('uses compact layout when the line fits the container', () => {
    expect(pickNowPlayingTrackLayout(240, 320)).toBe('compact')
    expect(pickNowPlayingTrackLayout(320, 320)).toBe('compact')
  })

  it('uses stacked layout when the line is wider than the container', () => {
    expect(pickNowPlayingTrackLayout(400, 320)).toBe('stacked')
  })

  it('defaults to stacked when the container width is unknown', () => {
    expect(pickNowPlayingTrackLayout(120, 0)).toBe('stacked')
  })
})
