import {
  CONTENT_SLUG_PATTERN,
  contentCanonicalPath,
  getEntryBySlug,
  type ContentKind,
} from '@/lib/content'
import {
  buildAboutMarkdown,
  buildContactMarkdown,
  buildHomeMarkdown,
  buildPrivacyMarkdown,
  NOT_FOUND_MARKDOWN_BODY,
} from '@/lib/siteCopy'
import { PERSON_NAME, toIsoDateTime } from '@/lib/site'

export type MarkdownPageResult = {
  status: 200 | 404
  body: string
}

function normalizePathname(pathname: string): string {
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`
  if (withLeadingSlash.length > 1 && withLeadingSlash.endsWith('/')) {
    return withLeadingSlash.slice(0, -1)
  }
  return withLeadingSlash
}

function buildArticleMarkdown(kind: ContentKind, slug: string): string | null {
  const entry = getEntryBySlug(kind, slug, { allowDrafts: false })
  if (!entry) {
    return null
  }

  const kindLabel = entry.kind === 'projects' ? 'Project' : 'Note'
  const published = toIsoDateTime(entry.date)
  const updated = entry.updated ? toIsoDateTime(entry.updated) : undefined

  return [
    `# ${entry.title}`,
    '',
    `${kindLabel} by ${PERSON_NAME}`,
    '',
    `Published: ${published}`,
    ...(updated ? [`Updated: ${updated}`] : []),
    ...(entry.summary ? ['', entry.summary] : []),
    '',
    `Canonical: ${contentCanonicalPath(entry.kind, entry.slug)}`,
    '',
    entry.content.trim(),
    '',
  ].join('\n')
}

export function resolveMarkdownPage(pathname: string): MarkdownPageResult {
  const normalized = normalizePathname(pathname)

  if (normalized === '/' || normalized === '') {
    return { status: 200, body: buildHomeMarkdown() }
  }

  if (normalized === '/about') {
    return { status: 200, body: buildAboutMarkdown() }
  }

  if (normalized === '/contact') {
    return { status: 200, body: buildContactMarkdown() }
  }

  if (normalized === '/privacy') {
    return { status: 200, body: buildPrivacyMarkdown() }
  }

  const writingMatch = normalized.match(
    new RegExp(`^/(notes|projects)/(${CONTENT_SLUG_PATTERN.source.slice(1, -1)})$`)
  )
  if (writingMatch) {
    const kind = writingMatch[1] as ContentKind
    const slug = writingMatch[2]
    if (slug) {
      const body = buildArticleMarkdown(kind, slug)
      if (body) {
        return { status: 200, body }
      }
    }
  }

  return { status: 404, body: NOT_FOUND_MARKDOWN_BODY }
}
