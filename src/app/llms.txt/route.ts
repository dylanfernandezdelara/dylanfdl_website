import { MARKDOWN_CONTENT_TYPE } from '@/lib/acceptMarkdown'
import { buildLlmsTxt } from '@/lib/siteCopy'

export function GET(): Response {
  return new Response(buildLlmsTxt(), {
    status: 200,
    headers: {
      'Content-Type': MARKDOWN_CONTENT_TYPE,
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400',
    },
  })
}
