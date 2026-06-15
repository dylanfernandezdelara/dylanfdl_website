import { extractErrorMessage } from '@/lib/extractErrorMessage'

export function logNowPlayingWarn(scope: string, error: unknown): void {
  console.warn(`[now-playing] ${scope}:`, extractErrorMessage(error))
}

export function logNowPlayingError(scope: string, error: unknown): void {
  console.error(`[now-playing] ${scope}:`, extractErrorMessage(error))
}
