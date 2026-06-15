import { beforeEach, describe, expect, it, vi } from 'vitest'

import { computeTrackUpdate, getNowPlayingLabel } from '@/lib/nowPlaying/applyTrackUpdate'
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

describe('getNowPlayingLabel', () => {
  it('returns currently listening when playback is active', () => {
    expect(getNowPlayingLabel(true)).toBe('Currently listening to')
  })

  it('returns recently listened when playback is inactive or unknown', () => {
    expect(getNowPlayingLabel(false)).toBe('Recently listened to')
    expect(getNowPlayingLabel(null)).toBe('Recently listened to')
  })
})

describe('computeTrackUpdate', () => {
  it('returns null when no track is present', () => {
    expect(
      computeTrackUpdate(
        { source: 'cache', track: null, isPlaying: null, updatedAt: null },
        { trackId: null, hasRolled: false },
        { forceRoll: true },
      ),
    ).toBeNull()
  })

  it('rolls on first track and preserves label when isPlaying is null', () => {
    const update = computeTrackUpdate(
      { ...trackPayload, isPlaying: null },
      { trackId: null, hasRolled: false },
      { forceRoll: false },
    )

    expect(update).toMatchObject({
      label: null,
      shouldRoll: true,
      title: 'Instant Crush',
      artist: 'Daft Punk, Julian Casablancas',
    })
  })

  it('skips roll when the same track is already displayed', () => {
    const update = computeTrackUpdate(trackPayload, { trackId: 'track-1', hasRolled: true }, {
      forceRoll: false,
    })

    expect(update).toMatchObject({
      label: 'Currently listening to',
      shouldRoll: false,
      nextRollState: { trackId: 'track-1', hasRolled: true },
    })
  })

  it('rolls again when the track id changes', () => {
    const update = computeTrackUpdate(
      { ...trackPayload, track: { ...trackPayload.track!, id: 'track-2' } },
      { trackId: 'track-1', hasRolled: true },
      { forceRoll: false },
    )

    expect(update?.shouldRoll).toBe(true)
    expect(update?.nextRollState).toEqual({ trackId: 'track-2', hasRolled: true })
  })
})

describe('runBootstrapFetches', () => {
  beforeEach(() => {
    vi.spyOn(logNowPlaying, 'logNowPlayingWarn').mockImplementation(() => undefined)
  })

  it('returns cache and live steps when both fetches succeed', async () => {
    const cached: NowPlayingResponse = { ...trackPayload, source: 'cache', isPlaying: null }
    const live: NowPlayingResponse = { ...trackPayload, source: 'live', isPlaying: true }
    const fetchNowPlaying = vi
      .fn()
      .mockResolvedValueOnce(cached)
      .mockResolvedValueOnce(live)

    await expect(runBootstrapFetches(fetchNowPlaying)).resolves.toEqual({
      cacheStep: { payload: cached, forceRoll: true },
      liveStep: { payload: live, forceRoll: true },
    })
  })

  it('falls back to live-only bootstrap when cache fetch fails', async () => {
    const live: NowPlayingResponse = { ...trackPayload, source: 'live' }
    const cacheError = new Error('cache miss')
    const fetchNowPlaying = vi
      .fn()
      .mockRejectedValueOnce(cacheError)
      .mockResolvedValueOnce(live)

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
    const fetchNowPlaying = vi
      .fn()
      .mockResolvedValueOnce(cached)
      .mockRejectedValueOnce(liveError)

    const onLiveError = vi.fn()
    await expect(
      runBootstrapFetches(fetchNowPlaying, { onLiveError }),
    ).resolves.toEqual({
      cacheStep: { payload: cached, forceRoll: true },
      liveStep: null,
    })
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
