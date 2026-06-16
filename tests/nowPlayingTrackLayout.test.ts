import { describe, expect, it } from 'vitest'

import {
  formatLabelTitleLine,
  fitsTrackOnOneLine,
  measurePrefixRowWidth,
  measureTextWidth,
  pickNowPlayingTrackLayout,
  resolveNowPlayingTrackLayout,
} from '@/lib/nowPlaying/trackLayout'
import { createMockPrefixRowMeasure, createMockTextMeasure } from '@/tests/fixtures/mockTextMeasure'
import {
  NOW_PLAYING_CONTAINER_WIDTHS,
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

describe('fitsTrackOnOneLine', () => {
  it('requires the title, by-artist, and track line to all fit', () => {
    expect(fitsTrackOnOneLine(358, 332, 128, 472)).toBe(false)
    expect(fitsTrackOnOneLine(864, 102, 72, 186)).toBe(true)
  })
})

describe('resolveNowPlayingTrackLayout', () => {
  it('returns inline for a desktop Yeat track with the label included', () => {
    const title = 'Liv Likë Dis'
    const artist = 'Yeat'
    const scenario = {
      label: NOW_PLAYING_LABEL,
      title,
      artist,
      labelWidth: 168,
      titleWidth: 102,
      labelTitleWidth: 274,
      byArtistWidth: 76,
      trackLineWidth: 186,
      fullLineWidth: 366,
    }
    const labelMeasure = createMockTextMeasure(labelWidthsForScenario(scenario))
    const trackMeasure = createMockTextMeasure(trackWidthsForScenario(scenario))
    const prefixRowMeasure = createMockPrefixRowMeasure(prefixRowWidthsForScenario(scenario))

    expect(
      resolveNowPlayingTrackLayout({
        labelMeasure,
        trackMeasure,
        prefixRowMeasure,
        containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.desktop,
        label: NOW_PLAYING_LABEL,
        title,
        artist,
      }),
    ).toBe('inline')
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

      expect(
        pickNowPlayingTrackLayout({
          containerWidth: scenario.containerWidth,
          labelWidth: scenario.labelWidth,
          titleWidth: scenario.titleWidth,
          byArtistWidth: scenario.byArtistWidth,
          labelTitleWidth: scenario.labelTitleWidth,
          trackLineWidth: scenario.trackLineWidth,
          fullLineWidth: scenario.fullLineWidth,
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

describe('track line width includes trailing period', () => {
  it('measures the rendered title by artist line with period', () => {
    const title = 'Instant Crush'
    const artist = 'Daft Punk'
    const scenario = {
      label: NOW_PLAYING_LABEL,
      title,
      artist,
      labelWidth: 168,
      titleWidth: 118,
      labelTitleWidth: 290,
      byArtistWidth: 112,
      trackLineWidth: 248,
      fullLineWidth: 416,
    }

    expect(
      resolveNowPlayingTrackLayout({
        labelMeasure: createMockTextMeasure(labelWidthsForScenario(scenario)),
        trackMeasure: createMockTextMeasure(trackWidthsForScenario(scenario)),
        prefixRowMeasure: createMockPrefixRowMeasure(prefixRowWidthsForScenario(scenario)),
        containerWidth: 864,
        label: NOW_PLAYING_LABEL,
        title,
        artist,
      }),
    ).toBe('inline')
  })
})
