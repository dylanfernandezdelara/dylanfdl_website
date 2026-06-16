import type { NowPlayingTrackLayout } from '@/lib/nowPlaying/trackLayout'
import {
  formatByArtistLineWithPeriod,
  formatFullTrackLine,
  formatFullTrackLineWithPeriod,
  formatLabelTitleLine,
} from '@/lib/nowPlaying/trackLayout'

export const NOW_PLAYING_LABEL = 'Recently listened to'

/**
 * Scenario pixel widths were captured from Inter 500 Italic (@fontsource/inter/500-italic)
 * in the about intro column at mobile (358px), tablet (848px), and desktop (864px) content widths.
 * Regenerate by measuring rendered `.now-playing-measure` spans in the target viewport.
 */
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
  labelTitleWidth: number
  /** Width of `by ${artist}.` including the trailing period. */
  byArtistWidth: number
  /** Width of `${title} by ${artist}.` including the trailing period. */
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
    labelTitleWidth: 290,
    byArtistWidth: 112,
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
    labelTitleWidth: 274,
    byArtistWidth: 76,
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
    labelTitleWidth: 360,
    byArtistWidth: 96,
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
    labelTitleWidth: 244,
    byArtistWidth: 146,
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
    labelTitleWidth: 244,
    byArtistWidth: 146,
    trackLineWidth: 224,
    fullLineWidth: 404,
    expected: 'prefix-split',
    reason: 'mobile prefers label and title together when both two-line options fit',
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
    labelTitleWidth: 328,
    byArtistWidth: 240,
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
    labelTitleWidth: 504,
    byArtistWidth: 132,
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
    labelTitleWidth: 544,
    byArtistWidth: 132,
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
    labelTitleWidth: 290,
    byArtistWidth: 252,
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
    labelTitleWidth: 364,
    byArtistWidth: 96,
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
    labelTitleWidth: 290,
    byArtistWidth: 112,
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
    labelTitleWidth: 290,
    byArtistWidth: 112,
    trackLineWidth: 359,
    fullLineWidth: 539,
    expected: 'prefix-split',
    reason: 'track one pixel wider than container still fits as prefix-split',
  },
  {
    id: 'mobile-artist-period-boundary',
    viewport: 'mobile',
    label: NOW_PLAYING_LABEL,
    title: 'Instant Crush',
    artist: 'Daft Punk',
    containerWidth: NOW_PLAYING_CONTAINER_WIDTHS.mobile,
    labelWidth: 168,
    titleWidth: 118,
    labelTitleWidth: 290,
    byArtistWidth: 359,
    trackLineWidth: 359,
    fullLineWidth: 539,
    expected: 'stacked',
    reason: 'artist row including trailing period exceeds mobile width',
  },
]

export function labelWidthsForScenario(
  scenario: Pick<NowPlayingLayoutScenario, 'label' | 'labelWidth'>,
): Record<string, number> {
  return {
    [scenario.label]: scenario.labelWidth,
  }
}

export function prefixRowWidthsForScenario(
  scenario: Pick<NowPlayingLayoutScenario, 'label' | 'title' | 'labelTitleWidth'>,
): Record<string, number> {
  return {
    [formatLabelTitleLine(scenario.label, scenario.title)]: scenario.labelTitleWidth,
  }
}

export function trackWidthsForScenario(
  scenario: Pick<
    NowPlayingLayoutScenario,
    'title' | 'artist' | 'titleWidth' | 'byArtistWidth' | 'trackLineWidth' | 'fullLineWidth' | 'labelWidth'
  >,
): Record<string, number> {
  const trackLine = formatFullTrackLine(scenario.title, scenario.artist)
  const trackLineWithPeriod = formatFullTrackLineWithPeriod(scenario.title, scenario.artist)
  const trackSuffix = ` ${trackLine}.`

  return {
    [scenario.title]: scenario.titleWidth,
    [formatByArtistLineWithPeriod(scenario.artist)]: scenario.byArtistWidth,
    [trackLineWithPeriod]: scenario.trackLineWidth,
    [trackLine]: scenario.trackLineWidth,
    [trackSuffix]: scenario.fullLineWidth - scenario.labelWidth,
  }
}
