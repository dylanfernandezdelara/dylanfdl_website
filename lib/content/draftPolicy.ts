/**
 * Draft inclusion policy for content loading and registry generation.
 *
 * Production builds omit drafts. Local authoring includes drafts by default.
 * Override with CONTENT_INCLUDE_DRAFTS=0|1.
 */
export function includeDraftEntries(): boolean {
  if (process.env.CONTENT_INCLUDE_DRAFTS === '1') {
    return true
  }
  if (process.env.CONTENT_INCLUDE_DRAFTS === '0') {
    return false
  }
  return process.env.NODE_ENV !== 'production'
}
