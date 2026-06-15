/**
 * Extracts the message from an Error for logging. Does not redact secrets —
 * sanitize sensitive failures at the throw site before logging.
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}
