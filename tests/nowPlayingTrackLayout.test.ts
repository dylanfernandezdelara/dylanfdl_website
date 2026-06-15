import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import {
  formatByArtistLine,
  formatFullNowPlayingLine,
  formatFullTrackLine,
  fitsTrackOnOneLine,
  measureTextWidth,
  pickNowPlayingTrackLayout,
  resolveNowPlayingTrackLayout,
} from '@/lib/nowPlayingTrackLayout'
import {
  createMockTextMeasure,
  NOW_PLAYING_CONTAINER_WIDTHS,
  NOW_PLAYING_LABEL,
  NOW_PLAYING_LAYOUT_SCENARIOS,
  widthsForScenario,
} from '@/tests/fixtures/nowPlayingLayoutScenarios'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

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
})

describe('nowPlayingTrackLayout formatting', () => {
  it('formats label, track, and full now-playing lines', () => {
    expect(formatFullTrackLine('Instant Crush', 'Daft Punk')).toBe(
      'Instant Crush by Daft Punk',
    )
    expect(formatByArtistLine('Daft Punk')).toBe('by Daft Punk')
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
        byArtistWidth: 72,
        trackLineWidth: 186,
        fullLineWidth: 366,
      }),
    ).toBe('inline')
  })

  it('uses split layout when the track fits but the label does not fit inline', () => {
    expect(
      pickNowPlayingTrackLayout({
        containerWidth: 358,
        labelWidth: 168,
        titleWidth: 72,
        byArtistWidth: 142,
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
        byArtistWidth: 128,
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
        byArtistWidth: 128,
        trackLineWidth: 512,
        fullLineWidth: 692,
      }),
    ).toBe('stacked')
  })

  it('uses stacked layout when the by-artist line is wider than the container', () => {
    expect(
      pickNowPlayingTrackLayout({
        containerWidth: 358,
        labelWidth: 168,
        titleWidth: 118,
        byArtistWidth: 248,
        trackLineWidth: 378,
        fullLineWidth: 558,
      }),
    ).toBe('stacked')
  })
})

describe('resolveNowPlayingTrackLayout', () => {
  it('returns inline for a desktop Yeat track with the label included', () => {
    const title = 'Liv Likë Dis'
    const artist = 'Yeat'
    const measure = createMockTextMeasure(widthsForScenario({
      label: NOW_PLAYING_LABEL,
      title,
      artist,
      labelWidth: 168,
      titleWidth: 102,
      byArtistWidth: 72,
      trackLineWidth: 186,
      fullLineWidth: 366,
    }))

    expect(
      resolveNowPlayingTrackLayout(
        measure,
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
      const measure = createMockTextMeasure(widthsForScenario(scenario))

      expect(
        resolveNowPlayingTrackLayout(
          measure,
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
          trackLineWidth: scenario.trackLineWidth,
          fullLineWidth: scenario.fullLineWidth,
        }),
      ).toBe(scenario.expected)
    })
  })
})

describe('now playing layout CSS contract', () => {
  const nowPlayingCss = readFileSync(join(repoRoot, 'src/styles/now-playing-text.css'), 'utf8')

  it('keeps inline layouts on a single row including the label', () => {
    expect(nowPlayingCss).toContain(".now-playing[data-layout='inline']")
    expect(nowPlayingCss).toContain('white-space: nowrap')
  })

  it('splits the label onto its own row when inline no longer fits', () => {
    expect(nowPlayingCss).toContain(".now-playing[data-layout='split'] .now-playing-label")
    expect(nowPlayingCss).toContain('display: block')
  })

  it('forces stacked title and artist onto separate rows', () => {
    expect(nowPlayingCss).toContain(".now-playing[data-layout='stacked']")
    expect(nowPlayingCss).toContain('flex-direction: column')
    expect(nowPlayingCss).toContain(".now-playing[data-layout='stacked'] .now-playing-artist-line")
  })
})

describe('now playing viewport coverage', () => {
  it('includes desktop, tablet, and mobile scenario coverage', () => {
    const viewports = new Set(NOW_PLAYING_LAYOUT_SCENARIOS.map((scenario) => scenario.viewport))

    expect(viewports).toEqual(new Set(['desktop', 'tablet', 'mobile']))
  })

  it('includes inline, split, and stacked expectations across scenarios', () => {
    const layouts = new Set(NOW_PLAYING_LAYOUT_SCENARIOS.map((scenario) => scenario.expected))

    expect(layouts).toEqual(new Set(['inline', 'split', 'stacked']))
  })
})
