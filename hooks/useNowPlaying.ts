'use client'

import { useEffect, useRef, useState, type Ref } from 'react'

import useSlotTextRoll from '@/hooks/useSlotTextRoll'
import { NOW_PLAYING_ROLL_OPTIONS } from '@/lib/nowPlayingRollDefaults'
import type { NowPlayingResponse } from '@/lib/spotify/types'

const POLL_INTERVAL_MS = 20_000
const DEV_MOCK_CYCLE_MS = 14_000

/** Rotated in `npm run dev` to preview slot-text rolls without Spotify. */
const DEV_MOCK_TRACKS: NowPlayingResponse[] = [
  {
    source: 'live',
    track: {
      id: 'dev-mock-1',
      name: 'Blinding Lights',
      artists: ['The Weeknd'],
      url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
    },
    isPlaying: true,
    updatedAt: new Date().toISOString(),
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
    updatedAt: new Date().toISOString(),
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
    updatedAt: new Date().toISOString(),
  },
]

function formatArtists(artists: string[]): string {
  return artists.join(', ')
}

function getLabel(isPlaying: boolean | null): string {
  if (isPlaying === true) {
    return 'Currently listening to'
  }
  return 'Recently listened to'
}

async function fetchNowPlaying(live: boolean): Promise<NowPlayingResponse> {
  const url = live ? '/api/now-playing?live=1' : '/api/now-playing'
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`now-playing request failed (${response.status})`)
  }
  return (await response.json()) as NowPlayingResponse
}

export type UseNowPlayingResult = {
  visible: boolean
  label: string
  trackUrl: string | null
  titleSlotRef: Ref<HTMLSpanElement>
  artistSlotRef: Ref<HTMLSpanElement>
}

export default function useNowPlaying(): UseNowPlayingResult {
  const isDevPreview = import.meta.env.DEV

  const [visible, setVisible] = useState(isDevPreview)
  const [label, setLabel] = useState('Currently listening to')
  const [trackUrl, setTrackUrl] = useState<string | null>(null)

  const trackIdRef = useRef<string | null>(null)
  const hasRolledRef = useRef(false)

  const {
    slotRef: titleSlotRef,
    rollTo: rollTitleTo,
  } = useSlotTextRoll({ direction: 'up', slotOptions: NOW_PLAYING_ROLL_OPTIONS })
  const {
    slotRef: artistSlotRef,
    rollTo: rollArtistTo,
  } = useSlotTextRoll({ direction: 'down', slotOptions: NOW_PLAYING_ROLL_OPTIONS })

  const rollTitleRef = useRef(rollTitleTo)
  const rollArtistRef = useRef(rollArtistTo)
  rollTitleRef.current = rollTitleTo
  rollArtistRef.current = rollArtistTo

  useEffect(() => {
    if (!isDevPreview) return undefined

    let index = 0
    let cancelled = false

    const showMock = (mock: NowPlayingResponse) => {
      if (!mock.track || cancelled) return

      setLabel(getLabel(mock.isPlaying))
      setTrackUrl(mock.track.url)
      setVisible(true)
      rollTitleRef.current(mock.track.name)
      rollArtistRef.current(formatArtists(mock.track.artists))
      trackIdRef.current = mock.track.id
      hasRolledRef.current = true
    }

    showMock(DEV_MOCK_TRACKS[0]!)

    const cycleTimer = window.setInterval(() => {
      index = (index + 1) % DEV_MOCK_TRACKS.length
      showMock(DEV_MOCK_TRACKS[index]!)
    }, DEV_MOCK_CYCLE_MS)

    return () => {
      cancelled = true
      window.clearInterval(cycleTimer)
    }
  }, [isDevPreview])

  useEffect(() => {
    if (isDevPreview) return undefined

    let cancelled = false
    let pollTimer: number | null = null

    const applyTrack = (payload: NowPlayingResponse, options: { forceRoll: boolean }): boolean => {
      if (!payload.track) {
        return false
      }

      const nextTrackId = payload.track.id
      const shouldRoll =
        options.forceRoll || !hasRolledRef.current || trackIdRef.current !== nextTrackId

      if (payload.isPlaying !== null) {
        setLabel(getLabel(payload.isPlaying))
      }
      setTrackUrl(payload.track.url)
      setVisible(true)

      if (shouldRoll) {
        rollTitleRef.current(payload.track.name)
        rollArtistRef.current(formatArtists(payload.track.artists))
        hasRolledRef.current = true
        trackIdRef.current = nextTrackId
      }

      return true
    }

    const refreshNowPlaying = async (options: {
      forceRoll: boolean
      live: boolean
    }): Promise<boolean> => {
      const payload = await fetchNowPlaying(options.live)
      if (cancelled) return false
      return applyTrack(payload, { forceRoll: options.forceRoll })
    }

    const clearPoll = () => {
      if (pollTimer !== null) {
        window.clearInterval(pollTimer)
        pollTimer = null
      }
    }

    const schedulePoll = () => {
      clearPoll()
      if (document.visibilityState !== 'visible') return

      pollTimer = window.setInterval(() => {
        void refreshNowPlaying({ forceRoll: false, live: true }).catch(() => undefined)
      }, POLL_INTERVAL_MS)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshNowPlaying({ forceRoll: false, live: true }).catch(() => undefined)
        schedulePoll()
        return
      }
      clearPoll()
    }

    void (async () => {
      try {
        const cached = await fetchNowPlaying(false)
        if (cancelled) return

        if (applyTrack(cached, { forceRoll: true })) {
          try {
            await refreshNowPlaying({ forceRoll: false, live: true })
          } catch {
            // Cache display is enough when live refresh is unavailable.
          }
        }
      } catch {
        try {
          await refreshNowPlaying({ forceRoll: true, live: true })
        } catch {
          // No track data available yet.
        }
      }

      if (!cancelled) {
        schedulePoll()
      }
    })()

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      clearPoll()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isDevPreview])

  return {
    visible,
    label,
    trackUrl,
    titleSlotRef,
    artistSlotRef,
  }
}
