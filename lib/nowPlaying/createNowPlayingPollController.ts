export type NowPlayingPollController = {
  schedule: () => void
  clear: () => void
  handleVisibilityChange: () => void
  destroy: () => void
}

type CreateNowPlayingPollControllerOptions = {
  pollIntervalMs: number
  refresh: () => Promise<void>
  onVisibilityRefreshError?: (error: unknown) => void
  onPollRefreshError?: (error: unknown) => void
  visibilityState?: Pick<Document, 'visibilityState'>
  timers?: Pick<typeof window, 'setInterval' | 'clearInterval'>
}

export function createNowPlayingPollController(
  options: CreateNowPlayingPollControllerOptions,
): NowPlayingPollController {
  const visibilityState = options.visibilityState ?? document
  const timers = options.timers ?? window
  let pollTimer: number | null = null

  const clear = () => {
    if (pollTimer !== null) {
      timers.clearInterval(pollTimer)
      pollTimer = null
    }
  }

  const schedule = () => {
    clear()
    if (visibilityState.visibilityState !== 'visible') return

    pollTimer = timers.setInterval(() => {
      void options.refresh().catch((error) => {
        options.onPollRefreshError?.(error)
      })
    }, options.pollIntervalMs)
  }

  const handleVisibilityChange = () => {
    if (visibilityState.visibilityState === 'visible') {
      void options.refresh().catch((error) => {
        options.onVisibilityRefreshError?.(error)
      })
      schedule()
      return
    }
    clear()
  }

  const destroy = () => {
    clear()
  }

  return { schedule, clear, handleVisibilityChange, destroy }
}
