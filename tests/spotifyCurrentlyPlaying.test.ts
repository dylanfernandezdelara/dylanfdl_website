import { describe, expect, it } from 'vitest'

import { parseSpotifyTrack, toNowPlayingCache } from '@/lib/spotify/currentlyPlaying'

describe('parseSpotifyTrack', () => {
  it('maps Spotify track fields into cached track shape', () => {
    const track = parseSpotifyTrack({
      id: 'track-1',
      name: 'Instant Crush',
      artists: [{ name: 'Daft Punk' }, { name: 'Julian Casablancas' }],
      external_urls: { spotify: 'https://open.spotify.com/track/track-1' },
    })

    expect(track).toEqual({
      id: 'track-1',
      name: 'Instant Crush',
      artists: ['Daft Punk', 'Julian Casablancas'],
      url: 'https://open.spotify.com/track/track-1',
    })
  })
})

describe('toNowPlayingCache', () => {
  it('wraps track with ISO updatedAt timestamp', () => {
    const cache = toNowPlayingCache({
      id: 'track-1',
      name: 'Instant Crush',
      artists: ['Daft Punk'],
      url: 'https://open.spotify.com/track/track-1',
    })

    expect(cache.track.name).toBe('Instant Crush')
    expect(cache.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
