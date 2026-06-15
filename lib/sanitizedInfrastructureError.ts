export type LogSuppressedError = Error & { readonly logSuppressed: true }

export function isLogSuppressedError(error: unknown): error is LogSuppressedError {
  return error instanceof Error && (error as LogSuppressedError).logSuppressed === true
}

export class SanitizedInfrastructureError extends Error implements LogSuppressedError {
  readonly logSuppressed = true as const

  constructor(context: string) {
    super(`Failed to ${context}`)
    this.name = 'SanitizedInfrastructureError'
  }
}
