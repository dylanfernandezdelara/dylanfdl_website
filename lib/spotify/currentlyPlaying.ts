import type { CachedTrack, NowPlayingCache } from './types'

type SpotifyArtist = { name: string }
type SpotifyTrackItem = {
  id: string
  name: string
  artists: SpotifyArtist[]
  external_urls: { spotify: string }
}

type SpotifyEpisodeItem = {
  id: string
  name: string
  show: { name: string }
  external_urls: { spotify: string }
}

type SpotifyCurrentlyPlayingResponse = {
  is_playing: boolean
  item: SpotifyTrackItem | SpotifyEpisodeItem | null
}

export function parseSpotifyTrack(item: SpotifyTrackItem): CachedTrack {
  return {
    id: item.id,
    name: item.name,
    artists: item.artists.map((artist) => artist.name),
    url: item.external_urls.spotify,
  }
}

function parseSpotifyEpisode(item: SpotifyEpisodeItem): CachedTrack {
  return {
    id: item.id,
    name: item.name,
    artists: [item.show.name],
    url: item.external_urls.spotify,
  }
}

function parseSpotifyItem(item: SpotifyTrackItem | SpotifyEpisodeItem): CachedTrack {
  if ('artists' in item) {
    return parseSpotifyTrack(item)
  }
  return parseSpotifyEpisode(item)
}

export function toNowPlayingCache(track: CachedTrack): NowPlayingCache {
  return {
    track,
    updatedAt: new Date().toISOString(),
  }
}

export async function fetchCurrentlyPlaying(
  accessToken: string,
): Promise<{ isPlaying: boolean; track: CachedTrack | null }> {
  const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (response.status === 204) {
    return { isPlaying: false, track: null }
  }

  if (!response.ok) {
    throw new Error(`Spotify currently-playing failed (${response.status})`)
  }

  const data = (await response.json()) as SpotifyCurrentlyPlayingResponse
  if (!data.item) {
    return { isPlaying: data.is_playing, track: null }
  }

  return {
    isPlaying: data.is_playing,
    track: parseSpotifyItem(data.item),
  }
}
