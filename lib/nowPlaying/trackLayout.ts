export type NowPlayingTrackLayout = 'inline' | 'prefix-split' | 'split' | 'stacked'

export const NOW_PLAYING_SLOT_CLASS =
  'now-playing-slot slot-text-cell-clip italic max-w-full flex-wrap'

export type NowPlayingLayoutPresentation = {
  labelTrackSeparator: boolean
  titleArtistSeparator: boolean
  allowTitleWrap: boolean
}

export function getNowPlayingLayoutPresentation(
  layout: NowPlayingTrackLayout,
): NowPlayingLayoutPresentation {
  return {
    labelTrackSeparator: layout === 'inline' || layout === 'prefix-split',
    titleArtistSeparator: layout === 'inline' || layout === 'split',
    allowTitleWrap: layout === 'stacked',
  }
}

export type NowPlayingTrackMeasurements = {
  containerWidth: number
  labelWidth: number
  titleWidth: number
  byArtistWidth: number
  labelTitleWidth: number
  trackLineWidth: number
  fullLineWidth: number
}

export function formatArtistWithTrailingPeriod(artist: string): string {
  return `${artist}.`
}

export function formatByArtistLineWithPeriod(artist: string): string {
  return `by ${formatArtistWithTrailingPeriod(artist)}`
}

export function formatLabelTitleLine(label: string, title: string): string {
  return `${label} ${title}`
}

export function formatFullTrackLine(title: string, artist: string): string {
  return `${title} by ${artist}`
}

export function formatFullTrackLineWithPeriod(title: string, artist: string): string {
  return `${title} by ${formatArtistWithTrailingPeriod(artist)}`
}

export function fitsTrackOnOneLine(
  containerWidth: number,
  titleWidth: number,
  byArtistWidth: number,
  trackLineWidth: number,
): boolean {
  if (containerWidth <= 0) {
    return false
  }

  return (
    trackLineWidth <= containerWidth &&
    titleWidth <= containerWidth &&
    byArtistWidth <= containerWidth
  )
}

export type TextWidthMeasureElement = Pick<
  HTMLElement,
  'textContent' | 'scrollWidth' | 'getBoundingClientRect'
>

export type PrefixRowMeasureElement = {
  root: Pick<HTMLElement, 'scrollWidth' | 'getBoundingClientRect'>
  labelSpan: TextWidthMeasureElement
  titleSpan: TextWidthMeasureElement
}

export function measureTextWidth(measure: TextWidthMeasureElement, text: string): number {
  measure.textContent = text
  return Math.max(measure.scrollWidth, measure.getBoundingClientRect().width)
}

export function measurePrefixRowWidth(
  prefixRowMeasure: PrefixRowMeasureElement,
  label: string,
  title: string,
): number {
  prefixRowMeasure.labelSpan.textContent = label
  prefixRowMeasure.titleSpan.textContent = title
  return Math.max(
    prefixRowMeasure.root.scrollWidth,
    prefixRowMeasure.root.getBoundingClientRect().width,
  )
}

export type ResolveNowPlayingTrackLayoutInput = {
  labelMeasure: TextWidthMeasureElement
  trackMeasure: TextWidthMeasureElement
  prefixRowMeasure: PrefixRowMeasureElement
  containerWidth: number
  label: string
  title: string
  artist: string
}

export function resolveNowPlayingTrackLayout({
  labelMeasure,
  trackMeasure,
  prefixRowMeasure,
  containerWidth,
  label,
  title,
  artist,
}: ResolveNowPlayingTrackLayoutInput): NowPlayingTrackLayout {
  const labelWidth = measureTextWidth(labelMeasure, label)
  const trackLineWidth = measureTextWidth(
    trackMeasure,
    formatFullTrackLineWithPeriod(title, artist),
  )
  const trackSuffix = ` ${formatFullTrackLineWithPeriod(title, artist)}`
  const titleWidth = measureTextWidth(trackMeasure, title)
  const fullLineWidth = labelWidth + measureTextWidth(trackMeasure, trackSuffix)

  return pickNowPlayingTrackLayout({
    containerWidth,
    labelWidth,
    titleWidth,
    byArtistWidth: measureTextWidth(trackMeasure, formatByArtistLineWithPeriod(artist)),
    labelTitleWidth: measurePrefixRowWidth(prefixRowMeasure, label, title),
    trackLineWidth,
    fullLineWidth,
  })
}

export function pickNowPlayingTrackLayout(
  measurements: NowPlayingTrackMeasurements,
): NowPlayingTrackLayout {
  const {
    containerWidth,
    labelWidth,
    titleWidth,
    byArtistWidth,
    labelTitleWidth,
    trackLineWidth,
    fullLineWidth,
  } = measurements

  if (containerWidth <= 0) {
    return 'stacked'
  }

  const trackFits = fitsTrackOnOneLine(
    containerWidth,
    titleWidth,
    byArtistWidth,
    trackLineWidth,
  )

  if (
    fullLineWidth <= containerWidth &&
    labelWidth <= containerWidth &&
    trackFits
  ) {
    return 'inline'
  }

  if (labelTitleWidth <= containerWidth && byArtistWidth <= containerWidth) {
    return 'prefix-split'
  }

  if (trackFits) {
    return 'split'
  }

  return 'stacked'
}
