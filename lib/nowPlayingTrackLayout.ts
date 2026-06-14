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

/**
 * Pick how the track line should break:
 * - compact: "title by artist" fits on one line without wrapping
 * - stacked: title on its own row, then "by artist" on the next row
 *   (title may wrap across multiple lines when it is longer than the container)
 */
export function pickNowPlayingTrackLayout(
  measurements: NowPlayingTrackMeasurements,
): NowPlayingTrackLayout {
  const { containerWidth, titleWidth, byArtistWidth, fullLineWidth } = measurements

  if (containerWidth <= 0) {
    return 'stacked'
  }

  const fitsOneLine =
    fullLineWidth <= containerWidth &&
    titleWidth <= containerWidth &&
    byArtistWidth <= containerWidth

  return fitsOneLine ? 'compact' : 'stacked'
}
