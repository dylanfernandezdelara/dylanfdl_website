import { describe, expect, it } from 'vitest'

import {
  formatArtistWithTrailingPeriod,
  formatByArtistLineWithPeriod,
  formatFullTrackLineWithPeriod,
  formatLabelTitleLine,
  fitsTrackOnOneLine,
  measurePrefixRowWidth,
  measureTextWidth,
  resolveNowPlayingTrackLayout,
} from '@/lib/nowPlaying/trackLayout'
import { createMockPrefixRowMeasure, createMockTextMeasure } from '@/tests/fixtures/mockTextMeasure'
import {
  NOW_PLAYING_LABEL,
  NOW_PLAYING_LAYOUT_SCENARIOS,
  labelWidthsForScenario,
  prefixRowWidthsForScenario,
  trackWidthsForScenario,
} from '@/tests/fixtures/nowPlayingLayoutScenarios'

describe('measureTextWidth', () => {
  it('prefers scrollWidth when getBoundingClientRect width is zero', () => {
    const measure = createMockTextMeasure({ 'Liv Likë Dis': 248 }, { fallbackWidth: 0 })
    expect(measureTextWidth(measure, 'Liv Likë Dis')).toBe(248)
  })

  it('uses the larger of scrollWidth and bounding rect width', () => {
    const measure = createMockTextMeasure({ 'Instant Crush': 120 })
    Object.defineProperty(measure, 'getBoundingClientRect', {
      value: () => ({ width: 180 }) as DOMRect,
    })
    expect(measureTextWidth(measure, 'Instant Crush')).toBe(180)
  })
})

describe('measurePrefixRowWidth', () => {
  it('measures the combined label and title row as one width', () => {
    const prefixRowMeasure = createMockPrefixRowMeasure({
      [formatLabelTitleLine(NOW_PLAYING_LABEL, 'Motion')]: 244,
    })

    expect(
      measurePrefixRowWidth(prefixRowMeasure, NOW_PLAYING_LABEL, 'Motion'),
    ).toBe(244)
  })
})

describe('formatArtistWithTrailingPeriod', () => {
  it('glues the sentence period directly onto the artist slot text', () => {
    expect(formatArtistWithTrailingPeriod('Daft Punk')).toBe('Daft Punk.')
  })

  it('keeps the period attached for long, multi-artist names', () => {
    expect(
      formatArtistWithTrailingPeriod('Daft Punk, Julian Casablancas, Some Very Long Featured Artist Name'),
    ).toBe('Daft Punk, Julian Casablancas, Some Very Long Featured Artist Name.')
  })

  it('is the suffix the by-artist line is built from, so measurement matches render', () => {
    const artist = 'Olivia Rodrigo, Robert Smith'
    expect(formatByArtistLineWithPeriod(artist)).toBe(`by ${formatArtistWithTrailingPeriod(artist)}`)
  })
})

describe('formatFullTrackLineWithPeriod', () => {
  it('reuses the artist trailing period helper for the full track line', () => {
    const title = 'Instant Crush'
    const artist = 'Daft Punk'
    expect(formatFullTrackLineWithPeriod(title, artist)).toBe(
      `${title} by ${formatArtistWithTrailingPeriod(artist)}`,
    )
  })
})

describe('fitsTrackOnOneLine', () => {
  it('requires the title, by-artist, and track line to all fit', () => {
    expect(fitsTrackOnOneLine(358, 332, 128, 472)).toBe(false)
    expect(fitsTrackOnOneLine(864, 102, 72, 186)).toBe(true)
  })
})

describe('now playing layout scenarios', () => {
  describe.each(NOW_PLAYING_LAYOUT_SCENARIOS)('$id ($viewport)', (scenario) => {
    it(scenario.reason, () => {
      const labelMeasure = createMockTextMeasure(labelWidthsForScenario(scenario))
      const trackMeasure = createMockTextMeasure(trackWidthsForScenario(scenario))
      const prefixRowMeasure = createMockPrefixRowMeasure(prefixRowWidthsForScenario(scenario))

      expect(
        resolveNowPlayingTrackLayout({
          labelMeasure,
          trackMeasure,
          prefixRowMeasure,
          containerWidth: scenario.containerWidth,
          label: scenario.label,
          title: scenario.title,
          artist: scenario.artist,
        }),
      ).toBe(scenario.expected)
    })
  })
})

describe('now playing viewport coverage', () => {
  it('includes desktop, tablet, and mobile scenario coverage', () => {
    const viewports = new Set(NOW_PLAYING_LAYOUT_SCENARIOS.map((scenario) => scenario.viewport))

    expect(viewports).toEqual(new Set(['desktop', 'tablet', 'mobile']))
  })

  it('includes inline, prefix-split, split, and stacked expectations across scenarios', () => {
    const layouts = new Set(NOW_PLAYING_LAYOUT_SCENARIOS.map((scenario) => scenario.expected))

    expect(layouts).toEqual(new Set(['inline', 'prefix-split', 'split', 'stacked']))
  })
})
