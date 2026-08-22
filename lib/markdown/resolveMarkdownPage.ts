import {
  buildAboutMarkdown,
  buildArticleMarkdown,
  buildContactMarkdown,
  buildHomeMarkdown,
  buildNotFoundMarkdown,
  buildPrivacyMarkdown,
  parseWritingPath,
} from '@/lib/markdown/documents'

export type MarkdownPageResult = {
  status: 200 | 404
  body: string
}

const STATIC_MARKDOWN_PAGES: Record<string, () => string> = {
  '/': buildHomeMarkdown,
  '/about': buildAboutMarkdown,
  '/contact': buildContactMarkdown,
  '/privacy': buildPrivacyMarkdown,
}

function normalizePathname(pathname: string): string {
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`
  if (withLeadingSlash.length > 1 && withLeadingSlash.endsWith('/')) {
    return withLeadingSlash.slice(0, -1)
  }
  return withLeadingSlash === '' ? '/' : withLeadingSlash
}

export function resolveMarkdownPage(pathname: string): MarkdownPageResult {
  const normalized = normalizePathname(pathname)
  const staticBuilder = STATIC_MARKDOWN_PAGES[normalized]
  if (staticBuilder) {
    return { status: 200, body: staticBuilder() }
  }

  const writing = parseWritingPath(normalized)
  if (writing) {
    const body = buildArticleMarkdown(writing.kind, writing.slug)
    if (body) {
      return { status: 200, body }
    }
  }

  return { status: 404, body: buildNotFoundMarkdown() }
}
