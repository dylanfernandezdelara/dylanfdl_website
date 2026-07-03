import type { NowPlayingResponse } from '@/lib/spotify/types'

const DEV_FIXTURE_STATIC_UPDATED_AT = '2026-06-13T12:00:00.000Z'

export const DEV_MOCK_TRACKS: NowPlayingResponse[] = [
  {
    source: 'live',
    track: {
      id: 'dev-mock-1',
      name: 'Blinding Lights',
      artists: ['The Weeknd'],
      url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
    },
    isPlaying: true,
    updatedAt: DEV_FIXTURE_STATIC_UPDATED_AT,
  },
  {
    source: 'live',
    track: {
      id: 'dev-mock-2',
      name: 'Motion',
      artists: ['Luke Hemmings'],
      url: 'https://open.spotify.com/track/4OSwjumisE6U7mHjJuVyEn',
    },
    isPlaying: true,
    updatedAt: DEV_FIXTURE_STATIC_UPDATED_AT,
  },
  {
    source: 'live',
    track: {
      id: 'dev-mock-3',
      name: 'Bohemian Rhapsody',
      artists: ['Queen'],
      url: 'https://open.spotify.com/track/4u7EneptDzaNVyFuJS10OJ',
    },
    isPlaying: false,
    updatedAt: DEV_FIXTURE_STATIC_UPDATED_AT,
  },
]

export const DEV_MOCK_CYCLE_MS = 14_000
