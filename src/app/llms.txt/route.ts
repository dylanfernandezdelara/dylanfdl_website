import { markdownResponse } from '@/lib/acceptMarkdown'
import { buildLlmsTxt } from '@/lib/markdown/documents'

export function GET(): Response {
  return markdownResponse(buildLlmsTxt())
}
