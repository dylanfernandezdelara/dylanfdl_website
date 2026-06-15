import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchCurrentlyPlaying, parseSpotifyTrack, toNowPlayingCache } from '@/lib/spotify/currentlyPlaying'
import { SanitizedInfrastructureError } from '@/lib/sanitizedInfrastructureError'

describe('fetchCurrentlyPlaying', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sanitizes non-OK Spotify API failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ error: { message: 'SECRET_TOKEN_VALUE' } }),
      }),
    )

    const error = await fetchCurrentlyPlaying('access-token').catch((caught) => caught)

    expect(error).toBeInstanceOf(SanitizedInfrastructureError)
    expect((error as Error).message).toBe('Failed to fetch Spotify currently-playing (503)')
    expect((error as Error).message).not.toContain('SECRET_TOKEN_VALUE')
  })
})

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
