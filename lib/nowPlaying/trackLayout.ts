export type NowPlayingTrackLayout = 'inline' | 'prefix-split' | 'split' | 'stacked'

export type NowPlayingTrackMeasurements = {
  containerWidth: number
  labelWidth: number
  titleWidth: number
  byArtistWidth: number
  labelTitleWidth: number
  trackLineWidth: number
  fullLineWidth: number
}

export function formatByArtistLineWithPeriod(artist: string): string {
  return `by ${artist}.`
}

export function formatLabelTitleLine(label: string, title: string): string {
  return `${label} ${title}`
}

export function formatFullTrackLine(title: string, artist: string): string {
  return `${title} by ${artist}`
}

export function formatFullTrackLineWithPeriod(title: string, artist: string): string {
  return `${formatFullTrackLine(title, artist)}.`
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
  const trackSuffix = ` ${formatFullTrackLine(title, artist)}.`
  const titleWidth = measureTextWidth(trackMeasure, title)

  return pickNowPlayingTrackLayout({
    containerWidth,
    labelWidth,
    titleWidth,
    byArtistWidth: measureTextWidth(trackMeasure, formatByArtistLineWithPeriod(artist)),
    labelTitleWidth: measurePrefixRowWidth(prefixRowMeasure, label, title),
    trackLineWidth,
    fullLineWidth: labelWidth + measureTextWidth(trackMeasure, trackSuffix),
  })
}

/**
 * Pick how the now-playing line should break:
 * - inline: "label title by artist." fits on one line
 * - prefix-split: "label title" on one row, then "by artist." on the next
 * - split: label on its own row, then "title by artist." on the next
 * - stacked: label on its own row, title on the next, then "by artist."
 */
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
