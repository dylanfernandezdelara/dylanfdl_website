/**
 * Extracts the message from an Error for logging. Does not redact secrets —
 * sanitize sensitive failures at the throw site before logging.
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string' || typeof error === 'number' || typeof error === 'boolean') {
    return String(error)
  }

  return 'Unknown error'
}
