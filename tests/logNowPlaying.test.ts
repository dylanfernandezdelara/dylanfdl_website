import { beforeEach, describe, expect, it, vi } from 'vitest'

import { logNowPlayingError, logNowPlayingWarn } from '@/lib/nowPlaying/logNowPlaying'
import { SanitizedRedisError } from '@/lib/sanitizedRedisError'

describe('logNowPlaying', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('logs message and error object for ordinary failures', () => {
    const error = new TypeError('Failed to fetch')
    logNowPlayingWarn('poll refresh failed', error)

    expect(console.warn).toHaveBeenCalledWith('[now-playing] poll refresh failed:', 'Failed to fetch', error)
  })

  it('logs only the message for sanitized Redis failures', () => {
    const error = new SanitizedRedisError('read now-playing cache')
    logNowPlayingWarn('live refresh failed', error)

    expect(console.warn).toHaveBeenCalledWith(
      '[now-playing] live refresh failed:',
      'Failed to read now-playing cache',
    )
    expect(console.warn).not.toHaveBeenCalledWith(
      '[now-playing] live refresh failed:',
      'Failed to read now-playing cache',
      error,
    )
  })

  it('logs only the message for non-Error values', () => {
    logNowPlayingError('request failed', 'offline')

    expect(console.error).toHaveBeenCalledWith('[now-playing] request failed:', 'Unknown error')
  })
})
