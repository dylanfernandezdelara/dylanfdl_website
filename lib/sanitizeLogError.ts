/**
 * Extracts a log-safe message from an error. Does not redact secrets — callers
 * must sanitize sensitive failures at the throw site before logging.
 */
export function toLogErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}
