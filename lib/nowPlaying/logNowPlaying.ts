import { extractErrorMessage } from '@/lib/extractErrorMessage'

function isSanitizedRedisFailureMessage(message: string): boolean {
  return message.startsWith('Failed to ')
}

export function logNowPlayingWarn(scope: string, error: unknown): void {
  const message = extractErrorMessage(error)
  if (error instanceof Error && !isSanitizedRedisFailureMessage(message)) {
    console.warn(`[now-playing] ${scope}:`, message, error)
    return
  }

  console.warn(`[now-playing] ${scope}:`, message)
}

export function logNowPlayingError(scope: string, error: unknown): void {
  const message = extractErrorMessage(error)
  if (error instanceof Error && !isSanitizedRedisFailureMessage(message)) {
    console.error(`[now-playing] ${scope}:`, message, error)
    return
  }

  console.error(`[now-playing] ${scope}:`, message)
}
