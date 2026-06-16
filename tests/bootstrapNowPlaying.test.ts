import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  resolveLiveBootstrapEffects,
  runBootstrapFetches,
} from '@/lib/nowPlaying/bootstrapNowPlaying'
import * as logNowPlaying from '@/lib/nowPlaying/logNowPlaying'
import type { NowPlayingResponse } from '@/lib/spotify/types'

const trackPayload: NowPlayingResponse = {
  source: 'live',
  track: {
    id: 'track-1',
    name: 'Instant Crush',
    artists: ['Daft Punk', 'Julian Casablancas'],
    url: 'https://open.spotify.com/track/track-1',
  },
  isPlaying: true,
  updatedAt: '2026-06-13T12:00:00.000Z',
}

describe('runBootstrapFetches', () => {
  beforeEach(() => {
    vi.spyOn(logNowPlaying, 'logNowPlayingWarn').mockImplementation(() => undefined)
  })

  it('returns cache and live steps when both fetches succeed', async () => {
    const cached: NowPlayingResponse = { ...trackPayload, source: 'cache', isPlaying: null }
    const live: NowPlayingResponse = { ...trackPayload, source: 'live', isPlaying: true }
    const fetchNowPlaying = vi.fn(async (liveRequest: boolean) =>
      liveRequest ? live : cached,
    )

    await expect(runBootstrapFetches(fetchNowPlaying)).resolves.toEqual({
      cacheStep: { payload: cached, forceRoll: true },
      liveStep: { payload: live, forceRoll: true },
    })
    expect(fetchNowPlaying).toHaveBeenCalledWith(false)
    expect(fetchNowPlaying).toHaveBeenCalledWith(true)
  })

  it('falls back to live-only bootstrap when cache fetch fails', async () => {
    const live: NowPlayingResponse = { ...trackPayload, source: 'live' }
    const cacheError = new Error('cache miss')
    const fetchNowPlaying = vi.fn(async (liveRequest: boolean) => {
      if (!liveRequest) throw cacheError
      return live
    })

    const onCacheError = vi.fn()
    await expect(
      runBootstrapFetches(fetchNowPlaying, { onCacheError }),
    ).resolves.toEqual({
      cacheStep: null,
      liveStep: { payload: live, forceRoll: true },
    })
    expect(onCacheError).toHaveBeenCalledWith(cacheError)
  })

  it('returns cache only when live fetch fails after cache succeeds', async () => {
    const cached: NowPlayingResponse = { ...trackPayload, source: 'cache', isPlaying: null }
    const liveError = new Error('live miss')
    const fetchNowPlaying = vi.fn(async (liveRequest: boolean) => {
      if (liveRequest) throw liveError
      return cached
    })

    const onLiveError = vi.fn()
    await expect(
      runBootstrapFetches(fetchNowPlaying, { onLiveError }),
    ).resolves.toEqual({
      cacheStep: { payload: cached, forceRoll: true },
      liveStep: null,
    })
    expect(onLiveError).toHaveBeenCalledWith(liveError)
  })

  it('returns no steps when both fetches fail', async () => {
    const cacheError = new Error('cache miss')
    const liveError = new Error('live miss')
    const fetchNowPlaying = vi.fn(async (liveRequest: boolean) => {
      throw liveRequest ? liveError : cacheError
    })

    const onCacheError = vi.fn()
    const onLiveError = vi.fn()
    await expect(
      runBootstrapFetches(fetchNowPlaying, { onCacheError, onLiveError }),
    ).resolves.toEqual({
      cacheStep: null,
      liveStep: null,
    })
    expect(onCacheError).toHaveBeenCalledWith(cacheError)
    expect(onLiveError).toHaveBeenCalledWith(liveError)
  })
})

describe('resolveLiveBootstrapEffects', () => {
  const liveStep = { payload: trackPayload, forceRoll: true }

  it('defers live payload when cache was applied so slots can mount first', () => {
    expect(resolveLiveBootstrapEffects(true, liveStep)).toEqual({
      kind: 'defer-live',
      payload: trackPayload,
    })
  })

  it('applies live immediately and starts polling when cache did not apply', () => {
    expect(resolveLiveBootstrapEffects(false, liveStep)).toEqual({
      kind: 'apply-live-immediately',
      payload: trackPayload,
      forceRoll: true,
    })
  })

  it('schedules polling when live bootstrap is unavailable', () => {
    expect(resolveLiveBootstrapEffects(true, null)).toEqual({ kind: 'schedule-poll' })
    expect(resolveLiveBootstrapEffects(false, null)).toEqual({ kind: 'schedule-poll' })
  })
})
