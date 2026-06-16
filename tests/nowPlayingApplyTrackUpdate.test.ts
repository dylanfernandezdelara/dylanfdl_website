import { describe, expect, it, vi } from 'vitest'

import {
  applyTrackUpdate,
  computeTrackUpdate,
  getNowPlayingLabel,
} from '@/lib/nowPlaying/applyTrackUpdate'
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

describe('applyTrackUpdate', () => {
  it('applies all fields and rolls when requested', () => {
    const setLabel = vi.fn()
    const setTrackUrl = vi.fn()
    const setVisible = vi.fn()
    const setTitle = vi.fn()
    const setArtist = vi.fn()
    const rollTitle = vi.fn()
    const rollArtist = vi.fn()

    const nextState = applyTrackUpdate(
      {
        label: 'Currently listening to',
        trackUrl: 'https://open.spotify.com/track/track-1',
        title: 'Instant Crush',
        artist: 'Daft Punk',
        shouldRoll: true,
        nextRollState: { trackId: 'track-1', hasRolled: true },
      },
      {
        setLabel,
        setTrackUrl,
        setVisible,
        setTitle,
        setArtist,
        rollTitle,
        rollArtist,
      },
    )

    expect(setLabel).toHaveBeenCalledWith('Currently listening to')
    expect(setTrackUrl).toHaveBeenCalledWith('https://open.spotify.com/track/track-1')
    expect(setVisible).toHaveBeenCalledWith(true)
    expect(setTitle).toHaveBeenCalledWith('Instant Crush')
    expect(setArtist).toHaveBeenCalledWith('Daft Punk')
    expect(rollTitle).toHaveBeenCalledWith('Instant Crush')
    expect(rollArtist).toHaveBeenCalledWith('Daft Punk')
    expect(nextState).toEqual({ trackId: 'track-1', hasRolled: true })
  })

  it('skips label and roll updates when not requested', () => {
    const setLabel = vi.fn()
    const rollTitle = vi.fn()
    const rollArtist = vi.fn()

    applyTrackUpdate(
      {
        label: null,
        trackUrl: 'https://open.spotify.com/track/track-1',
        title: 'Instant Crush',
        artist: 'Daft Punk',
        shouldRoll: false,
        nextRollState: { trackId: 'track-1', hasRolled: true },
      },
      {
        setLabel,
        setTrackUrl: vi.fn(),
        setVisible: vi.fn(),
        setTitle: vi.fn(),
        setArtist: vi.fn(),
        rollTitle,
        rollArtist,
      },
    )

    expect(setLabel).not.toHaveBeenCalled()
    expect(rollTitle).not.toHaveBeenCalled()
    expect(rollArtist).not.toHaveBeenCalled()
  })
})
