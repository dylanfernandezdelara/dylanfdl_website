'use client'

import { useEffect, useRef, useState, type Ref } from 'react'

import useSlotTextRoll from '@/hooks/useSlotTextRoll'
import {
  computeTrackUpdate,
  type TrackRollState,
  type TrackUpdate,
} from '@/lib/nowPlaying/applyTrackUpdate'
import {
  fetchBootstrapCacheStep,
  fetchBootstrapLiveStep,
  liveBootstrapMode,
} from '@/lib/nowPlaying/bootstrapNowPlaying'
import { NOW_PLAYING_ROLL_OPTIONS } from '@/lib/nowPlayingRollDefaults'
import { logNowPlayingWarn } from '@/lib/nowPlaying/logNowPlaying'
import { DEV_MOCK_CYCLE_MS, DEV_MOCK_TRACKS } from '@/lib/spotify/devFixtures'
import { parseNowPlayingResponse } from '@/lib/spotify/parseNowPlayingResponse'
import type { NowPlayingResponse } from '@/lib/spotify/types'

const POLL_INTERVAL_MS = 20_000

async function fetchNowPlaying(live: boolean): Promise<NowPlayingResponse> {
  const url = live ? '/api/now-playing?live=1' : '/api/now-playing'
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`now-playing request failed (${response.status})`)
  }
  return parseNowPlayingResponse(await response.json())
}

function applyTrackUpdate(
  update: TrackUpdate,
  actions: {
    setLabel: (label: string) => void
    setTrackUrl: (url: string) => void
    setVisible: (visible: boolean) => void
    setTitle: (title: string) => void
    setArtist: (artist: string) => void
    rollTitle: (title: string) => void
    rollArtist: (artist: string) => void
  },
): TrackRollState {
  if (update.label !== null) {
    actions.setLabel(update.label)
  }
  actions.setTrackUrl(update.trackUrl)
  actions.setTitle(update.title)
  actions.setArtist(update.artist)
  actions.setVisible(true)

  if (update.shouldRoll) {
    actions.rollTitle(update.title)
    actions.rollArtist(update.artist)
  }

  return update.nextRollState
}

export type UseNowPlayingResult = {
  visible: boolean
  label: string
  trackUrl: string | null
  title: string
  artist: string
  titleSlotRef: Ref<HTMLSpanElement>
  artistSlotRef: Ref<HTMLSpanElement>
}

export default function useNowPlaying(): UseNowPlayingResult {
  const isDevPreview = import.meta.env.DEV

  const [visible, setVisible] = useState(false)
  const [label, setLabel] = useState('Currently listening to')
  const [trackUrl, setTrackUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')

  const rollStateRef = useRef<TrackRollState>({ trackId: null, hasRolled: false })
  const [pendingLivePayload, setPendingLivePayload] = useState<NowPlayingResponse | null>(null)
  const beginPollingRef = useRef<(() => void) | null>(null)

  const {
    slotRef: titleSlotRef,
    slotMounted: titleSlotMounted,
    rollTo: rollTitleTo,
  } = useSlotTextRoll({
    direction: 'up',
    slotOptions: NOW_PLAYING_ROLL_OPTIONS,
  })
  const {
    slotRef: artistSlotRef,
    slotMounted: artistSlotMounted,
    rollTo: rollArtistTo,
  } = useSlotTextRoll({
    direction: 'down',
    slotOptions: NOW_PLAYING_ROLL_OPTIONS,
  })

  const rollTitleRef = useRef(rollTitleTo)
  const rollArtistRef = useRef(rollArtistTo)
  rollTitleRef.current = rollTitleTo
  rollArtistRef.current = rollArtistTo

  const applyPayload = (payload: NowPlayingResponse, options: { forceRoll: boolean }): boolean => {
    const update = computeTrackUpdate(payload, rollStateRef.current, options)
    if (!update) return false

    rollStateRef.current = applyTrackUpdate(update, {
      setLabel,
      setTrackUrl,
      setVisible,
      setTitle,
      setArtist,
      rollTitle: (nextTitle) => rollTitleRef.current(nextTitle),
      rollArtist: (nextArtist) => rollArtistRef.current(nextArtist),
    })
    return true
  }

  useEffect(() => {
    if (!isDevPreview) return undefined

    let index = 0
    let cancelled = false

    const showMock = (mock: NowPlayingResponse) => {
      if (cancelled) return
      applyPayload(mock, { forceRoll: true })
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

    const refreshNowPlaying = async (options: {
      forceRoll: boolean
      live: boolean
    }): Promise<boolean> => {
      const payload = await fetchNowPlaying(options.live)
      if (cancelled) return false
      return applyPayload(payload, { forceRoll: options.forceRoll })
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
        void refreshNowPlaying({ forceRoll: false, live: true }).catch((error) => {
          logNowPlayingWarn('poll refresh failed', error)
        })
      }, POLL_INTERVAL_MS)
    }

    beginPollingRef.current = schedulePoll

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshNowPlaying({ forceRoll: false, live: true }).catch((error) => {
          logNowPlayingWarn('visibility refresh failed', error)
        })
        schedulePoll()
        return
      }
      clearPoll()
    }

    void (async () => {
      const cacheStep = await fetchBootstrapCacheStep(fetchNowPlaying)
      if (cancelled) return

      let cacheApplied = false
      if (cacheStep) {
        cacheApplied = applyPayload(cacheStep.payload, { forceRoll: cacheStep.forceRoll })
      }

      const liveStep = await fetchBootstrapLiveStep(fetchNowPlaying)
      if (cancelled) return

      if (liveStep) {
        const mode = liveBootstrapMode(cacheApplied, true)
        switch (mode) {
          case 'defer':
            setPendingLivePayload(liveStep.payload)
            break
          case 'apply-immediately':
            applyPayload(liveStep.payload, { forceRoll: liveStep.forceRoll })
            schedulePoll()
            break
          case 'none':
            break
          default: {
            const _exhaustive: never = mode
            void _exhaustive
            break
          }
        }
      } else if (!cancelled) {
        schedulePoll()
      }
    })()

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      beginPollingRef.current = null
      clearPoll()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isDevPreview])

  useEffect(() => {
    if (isDevPreview) return undefined

    if (!pendingLivePayload || !visible || !titleSlotMounted || !artistSlotMounted) {
      return undefined
    }

    applyPayload(pendingLivePayload, { forceRoll: false })
    setPendingLivePayload(null)
    beginPollingRef.current?.()

    return undefined
  }, [artistSlotMounted, isDevPreview, pendingLivePayload, titleSlotMounted, visible])

  return {
    visible,
    label,
    trackUrl,
    title,
    artist,
    titleSlotRef,
    artistSlotRef,
  }
}
