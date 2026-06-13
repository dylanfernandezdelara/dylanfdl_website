'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'

import useSlotTextRoll from '@/hooks/useSlotTextRoll'
import type { NowPlayingResponse } from '@/lib/spotify/types'

const POLL_INTERVAL_MS = 20_000

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
  titleSlotRef: RefObject<HTMLSpanElement>
  artistSlotRef: RefObject<HTMLSpanElement>
}

export default function useNowPlaying(): UseNowPlayingResult {
  const [visible, setVisible] = useState(false)
  const [label, setLabel] = useState('Recently listened to')
  const [trackUrl, setTrackUrl] = useState<string | null>(null)

  const trackIdRef = useRef<string | null>(null)
  const hasRolledRef = useRef(false)

  const { slotRef: titleSlotRef, rollTo: rollTitleTo } = useSlotTextRoll({ direction: 'up' })
  const { slotRef: artistSlotRef, rollTo: rollArtistTo } = useSlotTextRoll({ direction: 'down' })

  const rollTitleRef = useRef(rollTitleTo)
  const rollArtistRef = useRef(rollArtistTo)
  rollTitleRef.current = rollTitleTo
  rollArtistRef.current = rollArtistTo

  useEffect(() => {
    let cancelled = false
    let pollTimer: number | null = null

    const applyTrack = (payload: NowPlayingResponse, options: { forceRoll: boolean }): boolean => {
      if (!payload.track) {
        return false
      }

      const nextTrackId = payload.track.id
      const shouldRoll =
        options.forceRoll || !hasRolledRef.current || trackIdRef.current !== nextTrackId

      if (shouldRoll) {
        rollTitleRef.current(payload.track.name)
        rollArtistRef.current(formatArtists(payload.track.artists))
        hasRolledRef.current = true
        trackIdRef.current = nextTrackId
      }

      setLabel(getLabel(payload.isPlaying))
      setTrackUrl(payload.track.url)
      setVisible(true)
      return true
    }

    const refreshNowPlaying = async (options: { forceRoll: boolean; live: boolean }) => {
      const payload = await fetchNowPlaying(options.live)
      if (cancelled) return
      applyTrack(payload, { forceRoll: options.forceRoll })
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
          // Hide the line until we have a track to show.
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
  }, [])

  return {
    visible,
    label,
    trackUrl,
    titleSlotRef,
    artistSlotRef,
  }
}
