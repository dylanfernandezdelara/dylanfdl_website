'use client'

import { useEffect, useLayoutEffect, useRef, useState, type Ref } from 'react'

import useSlotTextRoll from '@/hooks/useSlotTextRoll'
import {
  applyTrackUpdate,
  computeTrackUpdate,
  type TrackRollState,
} from '@/lib/nowPlaying/applyTrackUpdate'
import { deriveInitialNowPlayingState } from '@/lib/nowPlaying/deriveInitialNowPlayingState'
import { formatByArtistLineWithPeriod } from '@/lib/nowPlaying/trackLayout'
import {
  resolveLiveBootstrapEffects,
  runBootstrapFetches,
} from '@/lib/nowPlaying/bootstrapNowPlaying'
import { logNowPlayingWarn } from '@/lib/nowPlaying/logNowPlaying'
import { NOW_PLAYING_ROLL_OPTIONS } from '@/lib/nowPlayingRollDefaults'
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

export type UseNowPlayingOptions = {
  initialPayload?: NowPlayingResponse | null
}

export type UseNowPlayingResult = {
  visible: boolean
  label: string
  trackUrl: string | null
  title: string
  artist: string
  /** Full "by artist." line for the artist slot (SSR/hydration fallback). */
  artistSlotDisplayText: string
  /** True once slot-text owns the slots; callers render `null` slot children then. */
  slotTextActive: boolean
  titleSlotRef: Ref<HTMLSpanElement>
  artistSlotRef: Ref<HTMLSpanElement>
}

export default function useNowPlaying(
  options: UseNowPlayingOptions = {},
): UseNowPlayingResult {
  const isDevPreview = import.meta.env.DEV
  const initialStateRef = useRef(deriveInitialNowPlayingState(options.initialPayload))

  const [visible, setVisible] = useState(initialStateRef.current.visible)
  const [label, setLabel] = useState(initialStateRef.current.label)
  const [trackUrl, setTrackUrl] = useState<string | null>(initialStateRef.current.trackUrl)
  const [title, setTitle] = useState(initialStateRef.current.title)
  const [artist, setArtist] = useState(initialStateRef.current.artist)

  const rollStateRef = useRef<TrackRollState>(initialStateRef.current.rollState)
  const shouldSeedInitialTextRef = useRef(initialStateRef.current.visible)
  const [pendingLivePayload, setPendingLivePayload] = useState<NowPlayingResponse | null>(null)
  const beginPollingRef = useRef<(() => void) | null>(null)

  const {
    slotRef: titleSlotRef,
    slotMounted: titleSlotMounted,
    active: titleActive,
    rollTo: rollTitleTo,
  } = useSlotTextRoll({
    direction: 'up',
    slotOptions: NOW_PLAYING_ROLL_OPTIONS,
  })
  const {
    slotRef: artistSlotRef,
    slotMounted: artistSlotMounted,
    active: artistActive,
    rollTo: rollArtistTo,
  } = useSlotTextRoll({
    direction: 'down',
    slotOptions: NOW_PLAYING_ROLL_OPTIONS,
  })

  const slotTextActive = titleActive && artistActive

  const rollTitleRef = useRef<(title: string, options?: { instant?: boolean }) => void>(rollTitleTo)
  const rollArtistRef = useRef<(artistText: string, options?: { instant?: boolean }) => void>(rollArtistTo)
  rollTitleRef.current = rollTitleTo
  // Artist rolls apply formatByArtistLineWithPeriod here so "by", the name, and the
  // trailing period share one wrapping context. Before slot-text activates, callers
  // render artistSlotDisplayText from this hook's return value (same formatter).
  rollArtistRef.current = (artistText: string, options?: { instant?: boolean }) =>
    rollArtistTo(formatByArtistLineWithPeriod(artistText), options)

  useLayoutEffect(() => {
    if (!shouldSeedInitialTextRef.current) {
      return undefined
    }

    shouldSeedInitialTextRef.current = false
    rollTitleRef.current(title, { instant: true })
    rollArtistRef.current(artist, { instant: true })

    return undefined
  }, [artist, title])

  const applyPayload = (payload: NowPlayingResponse, options: { forceRoll: boolean }): boolean => {
    const update = computeTrackUpdate(payload, rollStateRef.current, options)
    if (!update) return false

    const instant = !rollStateRef.current.hasRolled

    rollStateRef.current = applyTrackUpdate(update, {
      setLabel,
      setTrackUrl,
      setVisible,
      setTitle,
      setArtist,
      rollTitle: (nextTitle) =>
        rollTitleRef.current(nextTitle, instant ? { instant: true } : undefined),
      rollArtist: (nextArtist) =>
        rollArtistRef.current(nextArtist, instant ? { instant: true } : undefined),
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
      const skipCacheBootstrap = initialStateRef.current.visible
      const { cacheStep, liveStep } = await runBootstrapFetches(
        fetchNowPlaying,
        {
          onCacheError: (error) => logNowPlayingWarn('cache bootstrap failed', error),
          onLiveError: (error) => logNowPlayingWarn('live bootstrap failed', error),
        },
        { skipCache: skipCacheBootstrap },
      )
      if (cancelled) return

      let cacheApplied = skipCacheBootstrap
      if (cacheStep) {
        cacheApplied = applyPayload(cacheStep.payload, {
          forceRoll: cacheStep.forceRoll && !rollStateRef.current.hasRolled,
        })
      }

      if (cancelled) return

      const effects = resolveLiveBootstrapEffects(cacheApplied, liveStep)
      switch (effects.kind) {
        case 'defer-live':
          if (!cancelled) setPendingLivePayload(effects.payload)
          break
        case 'apply-live-immediately':
          if (!cancelled) {
            applyPayload(effects.payload, {
              forceRoll: effects.forceRoll && !rollStateRef.current.hasRolled,
            })
            schedulePoll()
          }
          break
        case 'schedule-poll':
          if (!cancelled) schedulePoll()
          break
        default: {
          const exhaustive: never = effects
          return exhaustive
        }
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
    artistSlotDisplayText: formatByArtistLineWithPeriod(artist),
    slotTextActive,
    titleSlotRef,
    artistSlotRef,
  }
}
