import { describe, expect, it } from 'vitest'

import {
  formatByArtistLine,
  formatByArtistLineWithPeriod,
  formatFullNowPlayingLine,
  formatFullTrackLine,
  formatLabelTitleLine,
  fitsTrackOnOneLine,
  measurePrefixRowWidth,
  measureTextWidth,
  pickNowPlayingTrackLayout,
  resolveNowPlayingTrackLayout,
} from '@/lib/nowPlayingTrackLayout'
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
    let text = ''
    const measure = {
      get textContent() {
        return text
      },
      set textContent(value) {
        text = value ?? ''
      },
      get scrollWidth() {
        return 248
      },
      getBoundingClientRect() {
        return { width: 0 } as DOMRect
      },
    }

    expect(measureTextWidth(measure, 'Liv Likë Dis')).toBe(248)
  })

  it('uses the larger of scrollWidth and bounding rect width', () => {
    let text = ''
    const measure = {
      get textContent() {
        return text
      },
      set textContent(value) {
        text = value ?? ''
      },
      get scrollWidth() {
        return 120
      },
      getBoundingClientRect() {
        return { width: 180 } as DOMRect
      },
    }

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

describe('nowPlayingTrackLayout formatting', () => {
  it('formats label, track, and full now-playing lines', () => {
    expect(formatFullTrackLine('Instant Crush', 'Daft Punk')).toBe(
      'Instant Crush by Daft Punk',
    )
    expect(formatByArtistLine('Daft Punk')).toBe('by Daft Punk')
    expect(formatByArtistLineWithPeriod('Daft Punk')).toBe('by Daft Punk.')
    expect(formatFullNowPlayingLine(NOW_PLAYING_LABEL, 'Liv Likë Dis', 'Yeat')).toBe(
      'Recently listened to Liv Likë Dis by Yeat.',
    )
  })
})

describe('fitsTrackOnOneLine', () => {
  it('requires the title, by-artist, and track line to all fit', () => {
    expect(fitsTrackOnOneLine(358, 332, 128, 472)).toBe(false)
    expect(fitsTrackOnOneLine(864, 102, 72, 186)).toBe(true)
  })
})

describe('pickNowPlayingTrackLayout', () => {
  it('uses inline layout when the label and track fit together', () => {
    expect(
      pickNowPlayingTrackLayout({
        containerWidth: 864,
        labelWidth: 168,
        titleWidth: 102,
        byArtistWidth: 76,
        labelTitleWidth: 274,
        trackLineWidth: 186,
        fullLineWidth: 366,
      }),
    ).toBe('inline')
  })

  it('uses prefix-split layout when label+title and by-artist fit on separate rows', () => {
    expect(
      pickNowPlayingTrackLayout({
        containerWidth: 358,
        labelWidth: 168,
        titleWidth: 156,
        byArtistWidth: 240,
        labelTitleWidth: 328,
        trackLineWidth: 404,
        fullLineWidth: 584,
      }),
    ).toBe('prefix-split')
  })

  it('prefers prefix-split over split when both two-line options fit', () => {
    expect(
      pickNowPlayingTrackLayout({
        containerWidth: 358,
        labelWidth: 168,
        titleWidth: 72,
        byArtistWidth: 146,
        labelTitleWidth: 244,
        trackLineWidth: 224,
        fullLineWidth: 404,
      }),
    ).toBe('prefix-split')
  })

  it('uses split layout when label+title cannot share a row but title and artist can', () => {
    expect(
      pickNowPlayingTrackLayout({
        containerWidth: 358,
        labelWidth: 168,
        titleWidth: 192,
        byArtistWidth: 96,
        labelTitleWidth: 364,
        trackLineWidth: 292,
        fullLineWidth: 472,
      }),
    ).toBe('split')
  })

  it('uses split layout when prefix-split fails and the track still fits on one row', () => {
    expect(
      pickNowPlayingTrackLayout({
        containerWidth: 358,
        labelWidth: 168,
        titleWidth: 72,
        byArtistWidth: 146,
        labelTitleWidth: 400,
        trackLineWidth: 224,
        fullLineWidth: 404,
      }),
    ).toBe('split')
  })

  it('uses stacked layout when the track line is too wide', () => {
    expect(
      pickNowPlayingTrackLayout({
        containerWidth: 358,
        labelWidth: 168,
        titleWidth: 332,
        byArtistWidth: 132,
        labelTitleWidth: 504,
        trackLineWidth: 472,
        fullLineWidth: 652,
      }),
    ).toBe('stacked')
  })

  it('uses stacked layout when the title alone is wider than the container', () => {
    expect(
      pickNowPlayingTrackLayout({
        containerWidth: 358,
        labelWidth: 168,
        titleWidth: 372,
        byArtistWidth: 132,
        labelTitleWidth: 544,
        trackLineWidth: 512,
        fullLineWidth: 692,
      }),
    ).toBe('stacked')
  })

  it('uses stacked layout when container width is zero', () => {
    expect(
      pickNowPlayingTrackLayout({
        containerWidth: 0,
        labelWidth: 168,
        titleWidth: 72,
        byArtistWidth: 146,
        labelTitleWidth: 244,
        trackLineWidth: 224,
        fullLineWidth: 404,
      }),
    ).toBe('stacked')
  })

  it('uses stacked layout when the by-artist line including period is wider than the container', () => {
    expect(
      pickNowPlayingTrackLayout({
        containerWidth: 358,
        labelWidth: 168,
        titleWidth: 118,
        byArtistWidth: 359,
        labelTitleWidth: 290,
        trackLineWidth: 359,
        fullLineWidth: 539,
      }),
    ).toBe('stacked')
  })

  it('uses stacked layout when the by-artist line is wider than the container', () => {
    expect(
      pickNowPlayingTrackLayout({
        containerWidth: 358,
        labelWidth: 168,
        titleWidth: 118,
        byArtistWidth: 384,
        labelTitleWidth: 290,
        trackLineWidth: 510,
        fullLineWidth: 690,
      }),
    ).toBe('stacked')
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
      resolveNowPlayingTrackLayout(
        labelMeasure,
        trackMeasure,
        prefixRowMeasure,
        NOW_PLAYING_CONTAINER_WIDTHS.desktop,
        NOW_PLAYING_LABEL,
        title,
        artist,
      ),
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
        resolveNowPlayingTrackLayout(
          labelMeasure,
          trackMeasure,
          prefixRowMeasure,
          scenario.containerWidth,
          scenario.label,
          scenario.title,
          scenario.artist,
        ),
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
