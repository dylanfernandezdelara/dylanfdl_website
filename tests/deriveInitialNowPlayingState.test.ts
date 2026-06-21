import { describe, expect, it } from 'vitest'

import { deriveInitialNowPlayingState } from '@/lib/nowPlaying/deriveInitialNowPlayingState'
import type { NowPlayingResponse } from '@/lib/spotify/types'

const cachedPayload: NowPlayingResponse = {
  source: 'cache',
  track: {
    id: 'track-1',
    name: 'Instant Crush',
    artists: ['Daft Punk'],
    url: 'https://open.spotify.com/track/track-1',
  },
  isPlaying: null,
  updatedAt: '2026-06-13T12:00:00.000Z',
}

describe('deriveInitialNowPlayingState', () => {
  it('returns intro state when payload is missing or has no track', () => {
    expect(deriveInitialNowPlayingState(null)).toEqual({
      label: 'Recently listened to',
      trackUrl: null,
      title: '',
      artist: '',
      rollState: { trackId: null, hasRolled: false },
    })

    expect(
      deriveInitialNowPlayingState({
        ...cachedPayload,
        track: null,
      }),
    ).toEqual({
      label: 'Recently listened to',
      trackUrl: null,
      title: '',
      artist: '',
      rollState: { trackId: null, hasRolled: false },
    })
  })

  it('derives track state from cached payload', () => {
    expect(deriveInitialNowPlayingState(cachedPayload)).toEqual({
      label: 'Recently listened to',
      trackUrl: 'https://open.spotify.com/track/track-1',
      title: 'Instant Crush',
      artist: 'Daft Punk',
      rollState: { trackId: 'track-1', hasRolled: true },
    })
  })
})
