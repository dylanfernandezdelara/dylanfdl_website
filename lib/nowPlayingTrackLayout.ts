export type NowPlayingTrackLayout = 'compact' | 'stacked'

export type NowPlayingTrackMeasurements = {
  containerWidth: number
  titleWidth: number
  byArtistWidth: number
  fullLineWidth: number
}

export function formatByArtistLine(artist: string): string {
  return `by ${artist}`
}

export function formatFullTrackLine(title: string, artist: string): string {
  return `${title} by ${artist}`
}

export function fitsOneLineTrackLayout(measurements: NowPlayingTrackMeasurements): boolean {
  const { containerWidth, titleWidth, byArtistWidth, fullLineWidth } = measurements

  if (containerWidth <= 0) {
    return false
  }

  return (
    fullLineWidth <= containerWidth &&
    titleWidth <= containerWidth &&
    byArtistWidth <= containerWidth
  )
}

export function measureTextWidth(
  measure: Pick<HTMLElement, 'textContent' | 'getBoundingClientRect'>,
  text: string,
): number {
  measure.textContent = text
  return measure.getBoundingClientRect().width
}

export function resolveNowPlayingTrackLayout(
  measure: Pick<HTMLElement, 'textContent' | 'getBoundingClientRect'>,
  containerWidth: number,
  title: string,
  artist: string,
): NowPlayingTrackLayout {
  return pickNowPlayingTrackLayout({
    containerWidth,
    titleWidth: measureTextWidth(measure, title),
    byArtistWidth: measureTextWidth(measure, formatByArtistLine(artist)),
    fullLineWidth: measureTextWidth(measure, formatFullTrackLine(title, artist)),
  })
}

/**
 * Pick how the track line should break:
 * - compact: "title by artist" fits on one line without wrapping
 * - stacked: title on its own row, then "by artist" on the next row
 *   (title may wrap across multiple lines when it is longer than the container)
 */
export function pickNowPlayingTrackLayout(
  measurements: NowPlayingTrackMeasurements,
): NowPlayingTrackLayout {
  return fitsOneLineTrackLayout(measurements) ? 'compact' : 'stacked'
}
