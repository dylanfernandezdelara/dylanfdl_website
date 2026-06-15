export class SanitizedRedisError extends Error {
  constructor(context: string) {
    super(`Failed to ${context}`)
    this.name = 'SanitizedRedisError'
  }
}

export function isSanitizedRedisError(error: unknown): error is SanitizedRedisError {
  return error instanceof SanitizedRedisError
}
