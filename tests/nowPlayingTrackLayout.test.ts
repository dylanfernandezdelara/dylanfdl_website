import { describe, expect, it } from 'vitest'

import {
  formatByArtistLine,
  formatFullTrackLine,
  pickNowPlayingTrackLayout,
} from '@/lib/nowPlayingTrackLayout'

describe('nowPlayingTrackLayout', () => {
  it('formats the full single-line track copy', () => {
    expect(formatFullTrackLine('Instant Crush', 'Daft Punk')).toBe(
      'Instant Crush by Daft Punk',
    )
    expect(formatByArtistLine('Daft Punk')).toBe('by Daft Punk')
  })

  it('uses compact layout only when title, by-artist, and full line all fit', () => {
    expect(
      pickNowPlayingTrackLayout({
        containerWidth: 320,
        titleWidth: 120,
        byArtistWidth: 100,
        fullLineWidth: 240,
      }),
    ).toBe('compact')
  })

  it('uses stacked layout when the full line is too wide', () => {
    expect(
      pickNowPlayingTrackLayout({
        containerWidth: 320,
        titleWidth: 200,
        byArtistWidth: 140,
        fullLineWidth: 360,
      }),
    ).toBe('stacked')
  })

  it('uses stacked layout when the title alone is wider than the container', () => {
    expect(
      pickNowPlayingTrackLayout({
        containerWidth: 320,
        titleWidth: 360,
        byArtistWidth: 120,
        fullLineWidth: 500,
      }),
    ).toBe('stacked')
  })

  it('uses stacked layout when the by-artist line is wider than the container', () => {
    expect(
      pickNowPlayingTrackLayout({
        containerWidth: 320,
        titleWidth: 120,
        byArtistWidth: 360,
        fullLineWidth: 500,
      }),
    ).toBe('stacked')
  })

  it('defaults to stacked when the container width is unknown', () => {
    expect(
      pickNowPlayingTrackLayout({
        containerWidth: 0,
        titleWidth: 120,
        byArtistWidth: 100,
        fullLineWidth: 240,
      }),
    ).toBe('stacked')
  })
})
