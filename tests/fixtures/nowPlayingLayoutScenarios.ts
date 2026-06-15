import type { NowPlayingTrackLayout } from '@/lib/nowPlayingTrackLayout'

/** Content width inside the about intro column after horizontal padding. */
export const NOW_PLAYING_CONTAINER_WIDTHS = {
  mobile: 358,
  tablet: 848,
  desktop: 864,
} as const

export type NowPlayingLayoutScenario = {
  id: string
  viewport: keyof typeof NOW_PLAYING_CONTAINER_WIDTHS
  title: string
  artist: string
  containerWidth: number
  titleWidth: number
  byArtistWidth: number
  fullLineWidth: number
  expected: NowPlayingTrackLayout
  reason: string
}

export const NOW_PLAYING_LAYOUT_SCENARIOS: NowPlayingLayoutScenario[] = [
  {
    id: 'desktop-short-track',
    viewport: 'desktop',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.desktop,
    titleWidth: 118,
    byArtistWidth: 108,
    fullLineWidth: 236,
    expected: 'compact',
    reason: 'short track fits comfortably on a wide desktop line',
  },
  {
    id: 'desktop-medium-track',
    viewport: 'desktop',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.desktop,
    titleWidth: 188,
    byArtistWidth: 92,
    fullLineWidth: 290,
    expected: 'compact',
    reason: 'medium-length desktop track still fits on one line',
  },
  {
    id: 'tablet-short-track',
    viewport: 'tablet',
    title: 'Motion',
    artist: 'Luke Hemmings',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.tablet,
    titleWidth: 72,
    byArtistWidth: 142,
    fullLineWidth: 224,
    expected: 'compact',
    reason: 'short title and artist fit within tablet content width',
  },
  {
    id: 'mobile-short-track',
    viewport: 'mobile',
    title: 'Motion',
    artist: 'Luke Hemmings',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.mobile,
    titleWidth: 72,
    byArtistWidth: 142,
    fullLineWidth: 224,
    expected: 'compact',
    reason: 'short mobile track still fits on one line',
  },
  {
    id: 'mobile-ariana-long-title',
    viewport: 'mobile',
    title: "we can't be friends (wait for your love)",
    artist: 'Ariana Grande',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.mobile,
    titleWidth: 332,
    byArtistWidth: 128,
    fullLineWidth: 472,
    expected: 'stacked',
    reason: 'full line is wider than mobile, so artist moves below the title',
  },
  {
    id: 'mobile-title-overflow',
    viewport: 'mobile',
    title: "we can't be friends (wait for your love)",
    artist: 'Ariana Grande',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.mobile,
    titleWidth: 372,
    byArtistWidth: 128,
    fullLineWidth: 512,
    expected: 'stacked',
    reason: 'title alone exceeds mobile width and must wrap on its own row',
  },
  {
    id: 'mobile-long-artist',
    viewport: 'mobile',
    title: 'Instant Crush',
    artist: 'Daft Punk, Julian Casablancas',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.mobile,
    titleWidth: 118,
    byArtistWidth: 248,
    fullLineWidth: 378,
    expected: 'stacked',
    reason: 'by-artist segment is wider than mobile and must sit on its own row',
  },
  {
    id: 'mobile-boundary-exact-fit',
    viewport: 'mobile',
    title: 'Instant Crush',
    artist: 'Daft Punk',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.mobile,
    titleWidth: 118,
    byArtistWidth: 108,
    fullLineWidth: 358,
    expected: 'compact',
    reason: 'line that exactly matches container width is still compact',
  },
  {
    id: 'mobile-boundary-one-pixel-over',
    viewport: 'mobile',
    title: 'Instant Crush',
    artist: 'Daft Punk',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.mobile,
    titleWidth: 118,
    byArtistWidth: 108,
    fullLineWidth: 359,
    expected: 'stacked',
    reason: 'line one pixel wider than container must stack',
  },
]

export function createMockTextMeasure(
  widthsByText: Record<string, number>,
): Pick<HTMLElement, 'textContent' | 'getBoundingClientRect'> {
  let text = ''

  return {
    get textContent() {
      return text
    },
    set textContent(value) {
      text = value ?? ''
    },
    getBoundingClientRect() {
      const width = widthsByText[text]
      if (width === undefined) {
        throw new Error(`Missing mocked width for text: ${text}`)
      }

      return { width } as DOMRect
    },
  }
}

export function widthsForScenario(
  scenario: Pick<
    NowPlayingLayoutScenario,
    'title' | 'artist' | 'titleWidth' | 'byArtistWidth' | 'fullLineWidth'
  >,
): Record<string, number> {
  return {
    [scenario.title]: scenario.titleWidth,
    [`by ${scenario.artist}`]: scenario.byArtistWidth,
    [`${scenario.title} by ${scenario.artist}`]: scenario.fullLineWidth,
  }
}
