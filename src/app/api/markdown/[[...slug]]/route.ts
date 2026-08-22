import { markdownResponse } from '@/lib/acceptMarkdown'
import { resolveMarkdownPage } from '@/lib/markdown/resolveMarkdownPage'

type RouteContext = {
  params: Promise<{ slug?: string[] }>
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { slug = [] } = await context.params
  const pathname = slug.length === 0 ? '/' : `/${slug.join('/')}`
  const page = resolveMarkdownPage(pathname)
  return markdownResponse(page.body, page.status)
}
