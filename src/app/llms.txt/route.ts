import { markdownResponse } from '@/lib/acceptMarkdown'
import { buildLlmsTxt } from '@/lib/markdown/pages'

export function GET(): Response {
  return markdownResponse(buildLlmsTxt())
}
