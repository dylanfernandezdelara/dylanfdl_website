export function formatNowPlayingArtists(artists: string[]): string {
  return artists.join(', ')
}

export function getNowPlayingLabel(isPlaying: boolean | null): string {
  if (isPlaying === true) {
    return 'Currently listening to'
  }
  return 'Recently listened to'
}
