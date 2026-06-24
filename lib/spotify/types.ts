export type CachedTrack = {
  id: string
  name: string
  artists: string[]
  url: string
}

export type NowPlayingCache = {
  track: CachedTrack
  updatedAt: string
  /** Last-known playback state from a live Spotify refresh. */
  isPlaying?: boolean | null
}

export type NowPlayingResponse = {
  source: 'cache' | 'live'
  track: CachedTrack | null
  isPlaying: boolean | null
  updatedAt: string | null
}
