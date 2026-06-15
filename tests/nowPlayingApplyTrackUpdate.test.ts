import { beforeEach, describe, expect, it, vi } from 'vitest'

import { computeTrackUpdate, getNowPlayingLabel } from '@/lib/nowPlaying/applyTrackUpdate'
import { liveBootstrapMode, planBootstrapNowPlaying } from '@/lib/nowPlaying/bootstrapNowPlaying'
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

describe('planBootstrapNowPlaying', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  it('applies cache first and then live with a forced update roll', async () => {
    const cached: NowPlayingResponse = { ...trackPayload, source: 'cache', isPlaying: null }
    const live: NowPlayingResponse = { ...trackPayload, source: 'live', isPlaying: true }
    const fetchNowPlaying = vi
      .fn()
      .mockResolvedValueOnce(cached)
      .mockResolvedValueOnce(live)

    await expect(planBootstrapNowPlaying(fetchNowPlaying)).resolves.toEqual([
      { payload: cached, forceRoll: true },
      { payload: live, forceRoll: true },
    ])
  })

  it('falls back to live-only bootstrap when cache fetch fails', async () => {
    const live: NowPlayingResponse = { ...trackPayload, source: 'live' }
    const fetchNowPlaying = vi
      .fn()
      .mockRejectedValueOnce(new Error('cache miss'))
      .mockResolvedValueOnce(live)

    await expect(planBootstrapNowPlaying(fetchNowPlaying)).resolves.toEqual([
      { payload: live, forceRoll: true },
    ])
  })
})

describe('liveBootstrapMode', () => {
  it('defers live bootstrap only when cache already displayed a track', () => {
    expect(liveBootstrapMode(true, true)).toBe('defer')
  })

  it('applies live immediately when cache did not display a track', () => {
    expect(liveBootstrapMode(false, true)).toBe('apply-immediately')
  })

  it('skips live handling when there is no live step', () => {
    expect(liveBootstrapMode(true, false)).toBe('none')
    expect(liveBootstrapMode(false, false)).toBe('none')
  })
})
