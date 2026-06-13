import { describe, expect, it } from 'vitest'

import { parseNowPlayingResponse } from '@/lib/spotify/parseNowPlayingResponse'

describe('parseNowPlayingResponse', () => {
  it('accepts a valid now-playing payload', () => {
    expect(
      parseNowPlayingResponse({
        source: 'live',
        track: {
          id: 'track-1',
          name: 'Instant Crush',
          artists: ['Daft Punk'],
          url: 'https://open.spotify.com/track/track-1',
        },
        isPlaying: true,
        updatedAt: '2026-06-13T12:00:00.000Z',
      }),
    ).toEqual({
      source: 'live',
      track: {
        id: 'track-1',
        name: 'Instant Crush',
        artists: ['Daft Punk'],
        url: 'https://open.spotify.com/track/track-1',
      },
      isPlaying: true,
      updatedAt: '2026-06-13T12:00:00.000Z',
    })
  })

  it('rejects malformed payloads', () => {
    expect(() => parseNowPlayingResponse({ source: 'live' })).toThrow(
      'Invalid now-playing track',
    )
    expect(() => parseNowPlayingResponse(null)).toThrow('Invalid now-playing response')
  })
})
