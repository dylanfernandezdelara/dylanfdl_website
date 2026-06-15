export class SanitizedInfrastructureError extends Error {
  readonly logSuppressed = true

  constructor(context: string) {
    super(`Failed to ${context}`)
    this.name = 'SanitizedInfrastructureError'
  }
}
