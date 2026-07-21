import { extractErrorMessage } from '../extractErrorMessage'
import { isLogSuppressedError } from '../sanitizedInfrastructureError'

function logNowPlaying(
  scope: string,
  error: unknown,
  log: (message: string, ...details: unknown[]) => void,
): void {
  const message = extractErrorMessage(error)
  if (isLogSuppressedError(error)) {
    log(`[now-playing] ${scope}:`, message)
    const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'
    if (isDev && error instanceof Error && error.cause !== undefined) {
      log(`[now-playing] ${scope} cause:`, error.cause)
    }
    return
  }

  if (error instanceof Error) {
    log(`[now-playing] ${scope}:`, message, error)
    return
  }

  log(`[now-playing] ${scope}:`, message)
}

export function logNowPlayingWarn(scope: string, error: unknown): void {
  logNowPlaying(scope, error, console.warn)
}

export function logNowPlayingError(scope: string, error: unknown): void {
  logNowPlaying(scope, error, console.error)
}
