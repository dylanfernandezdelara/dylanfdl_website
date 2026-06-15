import { extractErrorMessage } from '@/lib/extractErrorMessage'

function shouldSuppressErrorObject(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { logSuppressed?: boolean }).logSuppressed === true
  )
}

function logNowPlaying(
  scope: string,
  error: unknown,
  log: (message: string, ...details: unknown[]) => void,
): void {
  const message = extractErrorMessage(error)
  if (shouldSuppressErrorObject(error)) {
    log(`[now-playing] ${scope}:`, message)
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
