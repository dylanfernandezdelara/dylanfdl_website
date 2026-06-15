import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import {
  fitsOneLineTrackLayout,
  formatByArtistLine,
  formatFullTrackLine,
  pickNowPlayingTrackLayout,
  resolveNowPlayingTrackLayout,
} from '@/lib/nowPlayingTrackLayout'
import {
  createMockTextMeasure,
  NOW_PLAYING_CONTAINER_WIDTHS,
  NOW_PLAYING_LAYOUT_SCENARIOS,
  widthsForScenario,
} from '@/tests/fixtures/nowPlayingLayoutScenarios'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('nowPlayingTrackLayout formatting', () => {
  it('formats the full single-line track copy', () => {
    expect(formatFullTrackLine('Instant Crush', 'Daft Punk')).toBe(
      'Instant Crush by Daft Punk',
    )
    expect(formatByArtistLine('Daft Punk')).toBe('by Daft Punk')
  })
})

describe('fitsOneLineTrackLayout', () => {
  it('requires the title, by-artist, and full line to all fit', () => {
    expect(
      fitsOneLineTrackLayout({
        containerWidth: 358,
        titleWidth: 332,
        byArtistWidth: 128,
        fullLineWidth: 472,
      }),
    ).toBe(false)
  })

  it('rejects unknown container widths', () => {
    expect(
      fitsOneLineTrackLayout({
        containerWidth: 0,
        titleWidth: 120,
        byArtistWidth: 100,
        fullLineWidth: 240,
      }),
    ).toBe(false)
  })
})

describe('pickNowPlayingTrackLayout', () => {
  it('uses compact layout only when every segment fits', () => {
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
})

describe('resolveNowPlayingTrackLayout', () => {
  it('returns stacked for a long Ariana Grande title on mobile widths', () => {
    const title = "we can't be friends (wait for your love)"
    const artist = 'Ariana Grande'
    const measure = createMockTextMeasure(widthsForScenario({
      title,
      artist,
      titleWidth: 332,
      byArtistWidth: 128,
      fullLineWidth: 472,
    }))

    expect(
      resolveNowPlayingTrackLayout(
        measure,
        NOW_PLAYING_CONTAINER_WIDTHS.mobile,
        title,
        artist,
      ),
    ).toBe('stacked')
  })
})

describe('now playing layout scenarios', () => {
  describe.each(NOW_PLAYING_LAYOUT_SCENARIOS)('$id ($viewport)', (scenario) => {
    it(scenario.reason, () => {
      const measure = createMockTextMeasure(widthsForScenario(scenario))

      expect(
        resolveNowPlayingTrackLayout(
          measure,
          scenario.containerWidth,
          scenario.title,
          scenario.artist,
        ),
      ).toBe(scenario.expected)

      expect(
        pickNowPlayingTrackLayout({
          containerWidth: scenario.containerWidth,
          titleWidth: scenario.titleWidth,
          byArtistWidth: scenario.byArtistWidth,
          fullLineWidth: scenario.fullLineWidth,
        }),
      ).toBe(scenario.expected)
    })
  })
})

describe('now playing layout CSS contract', () => {
  const nowPlayingCss = readFileSync(join(repoRoot, 'src/styles/now-playing-text.css'), 'utf8')

  it('keeps compact lines on a single row', () => {
    expect(nowPlayingCss).toContain(".now-playing-track[data-layout='compact']")
    expect(nowPlayingCss).toContain('white-space: nowrap')
  })

  it('forces stacked title and artist onto separate rows', () => {
    expect(nowPlayingCss).toContain(".now-playing-track[data-layout='stacked']")
    expect(nowPlayingCss).toContain('flex-direction: column')
    expect(nowPlayingCss).toContain(".now-playing-track[data-layout='stacked'] .now-playing-artist-line")
  })

  it('allows long stacked titles to wrap without pulling artist inline', () => {
    expect(nowPlayingCss).toContain(".now-playing-track[data-layout='stacked'] .now-playing-title")
    expect(nowPlayingCss).toContain('white-space: normal')
  })
})

describe('now playing viewport coverage', () => {
  it('includes desktop, tablet, and mobile scenario coverage', () => {
    const viewports = new Set(NOW_PLAYING_LAYOUT_SCENARIOS.map((scenario) => scenario.viewport))

    expect(viewports).toEqual(new Set(['desktop', 'tablet', 'mobile']))
  })

  it('includes both compact and stacked expectations across scenarios', () => {
    const layouts = new Set(NOW_PLAYING_LAYOUT_SCENARIOS.map((scenario) => scenario.expected))

    expect(layouts).toEqual(new Set(['compact', 'stacked']))
  })
})
