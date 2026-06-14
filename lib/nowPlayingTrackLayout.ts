export type NowPlayingTrackLayout = 'compact' | 'stacked'

export function formatCompactTrackLine(title: string, artist: string): string {
  return `${title} • ${artist}`
}

export function pickNowPlayingTrackLayout(
  compactLineWidth: number,
  containerWidth: number,
): NowPlayingTrackLayout {
  if (containerWidth <= 0) {
    return 'stacked'
  }

  return compactLineWidth <= containerWidth ? 'compact' : 'stacked'
}
