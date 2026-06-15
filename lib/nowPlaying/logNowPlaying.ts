import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { isSanitizedRedisError } from '@/lib/sanitizedRedisError'

function logNowPlaying(
  scope: string,
  error: unknown,
  log: (message: string, ...details: unknown[]) => void,
): void {
  const message = extractErrorMessage(error)
  if (error instanceof Error && !isSanitizedRedisError(error)) {
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
