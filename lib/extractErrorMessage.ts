export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string' || typeof error === 'number' || typeof error === 'boolean') {
    return String(error)
  }

  return 'Unknown error'
}
