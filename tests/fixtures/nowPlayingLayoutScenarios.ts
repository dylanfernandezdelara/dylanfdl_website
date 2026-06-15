import type { NowPlayingTrackLayout } from '@/lib/nowPlayingTrackLayout'
import { formatFullTrackLine } from '@/lib/nowPlayingTrackLayout'

export const NOW_PLAYING_LABEL = 'Recently listened to'

/** Content width inside the about intro column after horizontal padding. */
export const NOW_PLAYING_CONTAINER_WIDTHS = {
  mobile: 358,
  tablet: 848,
  desktop: 864,
} as const

export type NowPlayingLayoutScenario = {
  id: string
  viewport: keyof typeof NOW_PLAYING_CONTAINER_WIDTHS
  label: string
  title: string
  artist: string
  containerWidth: number
  labelWidth: number
  titleWidth: number
  titleSuffixWidth: number
  labelTitleWidth: number
  byArtistWidth: number
  trackLineWidth: number
  fullLineWidth: number
  expected: NowPlayingTrackLayout
  reason: string
}

export const NOW_PLAYING_LAYOUT_SCENARIOS: NowPlayingLayoutScenario[] = [
  {
    id: 'desktop-short-track',
    viewport: 'desktop',
    label: NOW_PLAYING_LABEL,
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.desktop,
    labelWidth: 168,
    titleWidth: 118,
    titleSuffixWidth: 122,
    labelTitleWidth: 290,
    byArtistWidth: 108,
    trackLineWidth: 236,
    fullLineWidth: 416,
    expected: 'inline',
    reason: 'label and short track fit together on a wide desktop line',
  },
  {
    id: 'desktop-yeat-track',
    viewport: 'desktop',
    label: NOW_PLAYING_LABEL,
    title: 'Liv Likë Dis',
    artist: 'Yeat',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.desktop,
    labelWidth: 168,
    titleWidth: 102,
    titleSuffixWidth: 106,
    labelTitleWidth: 274,
    byArtistWidth: 72,
    trackLineWidth: 186,
    fullLineWidth: 366,
    expected: 'inline',
    reason: 'desktop keeps label and track on one line when the full phrase fits',
  },
  {
    id: 'desktop-medium-track',
    viewport: 'desktop',
    label: NOW_PLAYING_LABEL,
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.desktop,
    labelWidth: 168,
    titleWidth: 188,
    titleSuffixWidth: 192,
    labelTitleWidth: 360,
    byArtistWidth: 92,
    trackLineWidth: 290,
    fullLineWidth: 470,
    expected: 'inline',
    reason: 'medium-length desktop track still fits inline with the label',
  },
  {
    id: 'tablet-short-track',
    viewport: 'tablet',
    label: NOW_PLAYING_LABEL,
    title: 'Motion',
    artist: 'Luke Hemmings',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.tablet,
    labelWidth: 168,
    titleWidth: 72,
    titleSuffixWidth: 76,
    labelTitleWidth: 244,
    byArtistWidth: 142,
    trackLineWidth: 224,
    fullLineWidth: 404,
    expected: 'inline',
    reason: 'tablet width keeps the label and track on one line',
  },
  {
    id: 'mobile-short-track',
    viewport: 'mobile',
    label: NOW_PLAYING_LABEL,
    title: 'Motion',
    artist: 'Luke Hemmings',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.mobile,
    labelWidth: 168,
    titleWidth: 72,
    titleSuffixWidth: 76,
    labelTitleWidth: 244,
    byArtistWidth: 142,
    trackLineWidth: 224,
    fullLineWidth: 404,
    expected: 'prefix-split',
    reason: 'mobile keeps label and title together, with artist on the next row',
  },
  {
    id: 'mobile-olivia-rodrigo-track',
    viewport: 'mobile',
    label: NOW_PLAYING_LABEL,
    title: "what's wrong with me",
    artist: 'Olivia Rodrigo, Robert Smith',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.mobile,
    labelWidth: 168,
    titleWidth: 156,
    titleSuffixWidth: 160,
    labelTitleWidth: 328,
    byArtistWidth: 236,
    trackLineWidth: 404,
    fullLineWidth: 584,
    expected: 'prefix-split',
    reason: 'featured-artist track fits as label+title then by-artist on mobile',
  },
  {
    id: 'mobile-ariana-long-title',
    viewport: 'mobile',
    label: NOW_PLAYING_LABEL,
    title: "we can't be friends (wait for your love)",
    artist: 'Ariana Grande',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.mobile,
    labelWidth: 168,
    titleWidth: 332,
    titleSuffixWidth: 336,
    labelTitleWidth: 504,
    byArtistWidth: 128,
    trackLineWidth: 472,
    fullLineWidth: 652,
    expected: 'stacked',
    reason: 'long mobile title forces title and artist onto separate rows',
  },
  {
    id: 'mobile-title-overflow',
    viewport: 'mobile',
    label: NOW_PLAYING_LABEL,
    title: "we can't be friends (wait for your love)",
    artist: 'Ariana Grande',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.mobile,
    labelWidth: 168,
    titleWidth: 372,
    titleSuffixWidth: 376,
    labelTitleWidth: 544,
    byArtistWidth: 128,
    trackLineWidth: 512,
    fullLineWidth: 692,
    expected: 'stacked',
    reason: 'title alone exceeds mobile width and must wrap on its own row',
  },
  {
    id: 'mobile-long-artist',
    viewport: 'mobile',
    label: NOW_PLAYING_LABEL,
    title: 'Instant Crush',
    artist: 'Daft Punk, Julian Casablancas',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.mobile,
    labelWidth: 168,
    titleWidth: 118,
    titleSuffixWidth: 122,
    labelTitleWidth: 290,
    byArtistWidth: 248,
    trackLineWidth: 378,
    fullLineWidth: 558,
    expected: 'prefix-split',
    reason: 'long artist list still fits when label and title share the first row',
  },
  {
    id: 'mobile-long-title-split',
    viewport: 'mobile',
    label: NOW_PLAYING_LABEL,
    title: 'A Song Title That Is Too Long For Label Plus Title',
    artist: 'Short Name',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.mobile,
    labelWidth: 168,
    titleWidth: 192,
    titleSuffixWidth: 196,
    labelTitleWidth: 364,
    byArtistWidth: 92,
    trackLineWidth: 292,
    fullLineWidth: 472,
    expected: 'split',
    reason: 'label and title cannot share a row, but title and artist can',
  },
  {
    id: 'mobile-boundary-exact-fit',
    viewport: 'mobile',
    label: NOW_PLAYING_LABEL,
    title: 'Instant Crush',
    artist: 'Daft Punk',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.mobile,
    labelWidth: 168,
    titleWidth: 118,
    titleSuffixWidth: 122,
    labelTitleWidth: 290,
    byArtistWidth: 108,
    trackLineWidth: 358,
    fullLineWidth: 538,
    expected: 'prefix-split',
    reason: 'track that exactly matches container width still uses prefix-split',
  },
  {
    id: 'mobile-boundary-one-pixel-over',
    viewport: 'mobile',
    label: NOW_PLAYING_LABEL,
    title: 'Instant Crush',
    artist: 'Daft Punk',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.mobile,
    labelWidth: 168,
    titleWidth: 118,
    titleSuffixWidth: 122,
    labelTitleWidth: 290,
    byArtistWidth: 108,
    trackLineWidth: 359,
    fullLineWidth: 539,
    expected: 'prefix-split',
    reason: 'track one pixel wider than container still fits as prefix-split',
  },
]

export function labelWidthsForScenario(
  scenario: Pick<NowPlayingLayoutScenario, 'label' | 'labelWidth'>,
): Record<string, number> {
  return {
    [scenario.label]: scenario.labelWidth,
  }
}

export function trackWidthsForScenario(
  scenario: Pick<
    NowPlayingLayoutScenario,
    | 'title'
    | 'artist'
    | 'titleWidth'
    | 'titleSuffixWidth'
    | 'byArtistWidth'
    | 'trackLineWidth'
    | 'fullLineWidth'
    | 'labelWidth'
  >,
): Record<string, number> {
  const trackLine = formatFullTrackLine(scenario.title, scenario.artist)
  const trackSuffix = ` ${trackLine}.`

  return {
    [scenario.title]: scenario.titleWidth,
    [` ${scenario.title}`]: scenario.titleSuffixWidth,
    [`by ${scenario.artist}`]: scenario.byArtistWidth,
    [trackLine]: scenario.trackLineWidth,
    [trackSuffix]: scenario.fullLineWidth - scenario.labelWidth,
  }
}
