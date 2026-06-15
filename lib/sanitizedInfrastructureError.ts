export class SanitizedInfrastructureError extends Error {
  constructor(context: string) {
    super(`Failed to ${context}`)
    this.name = 'SanitizedInfrastructureError'
  }
}
