/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createNowPlayingPollController } from '@/lib/nowPlaying/createNowPlayingPollController'

describe('createNowPlayingPollController', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('polls on the configured interval while the tab is visible', async () => {
    const refresh = vi.fn(async () => undefined)
    const controller = createNowPlayingPollController({
      pollIntervalMs: 20_000,
      refresh,
      visibilityState: { visibilityState: 'visible' },
      timers: {
        setInterval: window.setInterval.bind(window),
        clearInterval: window.clearInterval.bind(window),
      },
    })

    controller.schedule()

    expect(refresh).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(20_000)
    expect(refresh).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(20_000)
    expect(refresh).toHaveBeenCalledTimes(2)

    controller.destroy()
  })

  it('does not start polling when the tab is hidden', () => {
    const refresh = vi.fn(async () => undefined)
    const controller = createNowPlayingPollController({
      pollIntervalMs: 20_000,
      refresh,
      visibilityState: { visibilityState: 'hidden' },
      timers: {
        setInterval: window.setInterval.bind(window),
        clearInterval: window.clearInterval.bind(window),
      },
    })

    controller.schedule()
    vi.advanceTimersByTime(60_000)
    expect(refresh).not.toHaveBeenCalled()
  })

  it('clears polling when the tab becomes hidden and resumes on visible', async () => {
    const refresh = vi.fn(async () => undefined)
    const visibilityState = { visibilityState: 'visible' as DocumentVisibilityState }
    const controller = createNowPlayingPollController({
      pollIntervalMs: 20_000,
      refresh,
      visibilityState,
      timers: {
        setInterval: window.setInterval.bind(window),
        clearInterval: window.clearInterval.bind(window),
      },
    })

    controller.schedule()
    await vi.advanceTimersByTimeAsync(20_000)
    expect(refresh).toHaveBeenCalledTimes(1)

    visibilityState.visibilityState = 'hidden'
    controller.handleVisibilityChange()
    await vi.advanceTimersByTimeAsync(40_000)
    expect(refresh).toHaveBeenCalledTimes(1)

    visibilityState.visibilityState = 'visible'
    controller.handleVisibilityChange()
    expect(refresh).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(20_000)
    expect(refresh).toHaveBeenCalledTimes(3)

    controller.destroy()
  })
})
