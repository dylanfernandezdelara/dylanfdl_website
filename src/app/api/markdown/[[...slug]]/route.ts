import { MARKDOWN_CONTENT_TYPE } from '@/lib/acceptMarkdown'
import { resolveMarkdownPage } from '@/lib/markdown/resolveMarkdownPage'

type RouteContext = {
  params: Promise<{ slug?: string[] }>
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { slug = [] } = await context.params
  const pathname = slug.length === 0 ? '/' : `/${slug.join('/')}`
  const page = resolveMarkdownPage(pathname)

  return new Response(page.body, {
    status: page.status,
    headers: {
      'Content-Type': MARKDOWN_CONTENT_TYPE,
      Vary: 'Accept',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400',
    },
  })
}
