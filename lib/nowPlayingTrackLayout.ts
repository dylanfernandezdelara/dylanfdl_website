export type NowPlayingTrackLayout = 'inline' | 'split' | 'stacked'

export type NowPlayingTrackMeasurements = {
  containerWidth: number
  labelWidth: number
  titleWidth: number
  byArtistWidth: number
  trackLineWidth: number
  fullLineWidth: number
}

export function formatByArtistLine(artist: string): string {
  return `by ${artist}`
}

export function formatFullTrackLine(title: string, artist: string): string {
  return `${title} by ${artist}`
}

export function formatFullNowPlayingLine(
  label: string,
  title: string,
  artist: string,
): string {
  return `${label} ${formatFullTrackLine(title, artist)}.`
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

export function measureTextWidth(measure: TextWidthMeasureElement, text: string): number {
  measure.textContent = text
  const scrollWidth = measure.scrollWidth
  if (scrollWidth > 0) {
    return scrollWidth
  }
  return measure.getBoundingClientRect().width
}

export function resolveNowPlayingTrackLayout(
  measure: Pick<HTMLElement, 'textContent' | 'getBoundingClientRect'>,
  containerWidth: number,
  label: string,
  title: string,
  artist: string,
): NowPlayingTrackLayout {
  return pickNowPlayingTrackLayout({
    containerWidth,
    labelWidth: measureTextWidth(measure, label),
    titleWidth: measureTextWidth(measure, title),
    byArtistWidth: measureTextWidth(measure, formatByArtistLine(artist)),
    trackLineWidth: measureTextWidth(measure, formatFullTrackLine(title, artist)),
    fullLineWidth: measureTextWidth(measure, formatFullNowPlayingLine(label, title, artist)),
  })
}

/**
 * Pick how the now-playing line should break:
 * - inline: "label title by artist" fits on one line
 * - split: label on its own row, then "title by artist" on the next
 * - stacked: label on its own row, title on the next, then "by artist"
 */
export function pickNowPlayingTrackLayout(
  measurements: NowPlayingTrackMeasurements,
): NowPlayingTrackLayout {
  const {
    containerWidth,
    labelWidth,
    titleWidth,
    byArtistWidth,
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

  if (trackFits) {
    return 'split'
  }

  return 'stacked'
}
