export type LogSuppressedError = Error & { readonly logSuppressed: true }

export function isLogSuppressedError(error: unknown): error is LogSuppressedError {
  return (
    error instanceof Error &&
    'logSuppressed' in error &&
    (error as LogSuppressedError).logSuppressed === true
  )
}

export class SanitizedInfrastructureError extends Error implements LogSuppressedError {
  readonly logSuppressed = true as const

  // Never log the raw Error object outside logNowPlaying; cause is for debugging only.
  constructor(context: string, options?: { cause?: unknown }) {
    super(`Failed to ${context}`, options)
    this.name = 'SanitizedInfrastructureError'
  }
}
