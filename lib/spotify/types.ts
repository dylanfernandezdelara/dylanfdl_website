export type CachedTrack = {
  id: string
  name: string
  artists: string[]
  url: string
}

export type NowPlayingCache = {
  track: CachedTrack
  updatedAt: string
  isPlaying?: boolean | null
}

export type NowPlayingResponse = {
  source: 'cache' | 'live'
  track: CachedTrack | null
  isPlaying: boolean | null
  updatedAt: string | null
}
