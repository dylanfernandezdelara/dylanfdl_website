import {
  WORK_INDEX_SECTIONS,
  buildCardGridItems,
  partitionCardGridItems,
  type CardGridSerializableItem,
} from '@/lib/buildCardGridItems'
import {
  contentCanonicalPath,
  getEntryBySlug,
  isValidContentSlug,
  type ContentKind,
} from '@/lib/content'
import { toAgentMarkdown } from '@/lib/markdown/toAgentMarkdown'
import {
  SITE_DOCUMENTS,
  buildDocumentMarkdown,
  siteDocumentByPath,
} from '@/lib/siteDocuments'
import {
  CONTACT_EMAIL,
  LLMS_TXT_PATH,
  PERSON_LOCATION,
  PERSON_NAME,
  SITE_URL,
  SITEMAP_INDEX_URL,
  absoluteUrl,
  toIsoDateTime,
} from '@/lib/site'

const HOME_INTRO_PARAGRAPHS = [
  'I currently work on post-training at Meta and build RL environments for frontier coding agents. We recently launched Muse Spark 1.2 and Muse Code.',
  'Previously, I scaled crash infrastructure for Meta Glasses.',
  `I am a Yale graduate and am currently based in ${PERSON_LOCATION.locality}.`,
] as const

const NOT_FOUND_RECOVERY_LINKS = [
  { label: 'Home', href: '/' },
  ...SITE_DOCUMENTS.map((document) => ({ label: document.title, href: document.path })),
  { label: 'Sitemap', href: '/sitemap.xml' },
  { label: 'llms.txt', href: LLMS_TXT_PATH },
] as const

function listItems(items: CardGridSerializableItem[], empty: string): string[] {
  if (items.length === 0) {
    return [empty]
  }
  return items.map((item) => {
    const href = item.kind === 'artifact' ? item.href : absoluteUrl(item.href)
    return `- [${item.title}](${href}) — ${item.dateLabel}`
  })
}

export function buildHomeMarkdown(): string {
  const partitioned = partitionCardGridItems(buildCardGridItems())

  return [
    `# ${PERSON_NAME}`,
    '',
    'I am an optimist.',
    '',
    HOME_INTRO_PARAGRAPHS.join('\n\n'),
    '',
    ...WORK_INDEX_SECTIONS.flatMap((section) => [
      `## ${section.heading}`,
      '',
      ...listItems(partitioned[section.key], section.empty),
      '',
    ]),
    '## Pages',
    '',
    ...SITE_DOCUMENTS.map((document) => `- [${document.title}](${absoluteUrl(document.path)})`),
    `- [Sitemap](${SITEMAP_INDEX_URL})`,
    `- [llms.txt](${absoluteUrl(LLMS_TXT_PATH)})`,
    '',
  ].join('\n')
}

export function buildNotFoundMarkdown(): string {
  return [
    '# 404',
    '',
    `This path does not exist on ${new URL(SITE_URL).hostname}.`,
    '',
    '## Where to look next',
    '',
    ...NOT_FOUND_RECOVERY_LINKS.map((link) => `- [${link.label}](${absoluteUrl(link.href)})`),
    '',
  ].join('\n')
}

export function buildArticleMarkdown(kind: ContentKind, slug: string): string | null {
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
    `Canonical: ${absoluteUrl(contentCanonicalPath(entry.kind, entry.slug))}`,
    '',
    toAgentMarkdown(entry.content),
    '',
  ].join('\n')
}

export function buildLlmsTxt(): string {
  const { notes, projects } = partitionCardGridItems(buildCardGridItems())

  return [
    `# ${PERSON_NAME}`,
    '',
    `> Personal website of ${PERSON_NAME}: profile, notes, projects, and music.`,
    '',
    `Canonical URL: ${SITE_URL}`,
    '',
    '## When to use this',
    '',
    `Use this site when you need to identify ${PERSON_NAME}, confirm that www.dylanfdl.com is his canonical personal site, cite his public writing, list concerts he has played, or find a real contact path.`,
    '',
    'Reach for these jobs specifically:',
    '',
    `- Confirm identity, location (${PERSON_LOCATION.locality}), and current public work (Meta post-training, Muse Spark 1.2, Muse Code, earlier Meta Glasses crash infrastructure).`,
    '- Read or quote a published note or project from the canonical URL.',
    `- Email ${CONTACT_EMAIL} for introductions, corrections, or privacy requests.`,
    '- Prefer `Accept: text/markdown` on the same URLs a browser would load as HTML.',
    '',
    'Do not use this site as a public API, OAuth product, GraphQL endpoint, MCP server, developer portal, or commerce surface. Those interfaces are not offered. Do not ask it for confidential Meta information.',
    '',
    '## How to call this site',
    '',
    `- HTML and Markdown share the same paths. Send \`Accept: text/markdown\` or append \`.md\` (for example ${absoluteUrl('/about.md')}).`,
    `- Start with ${SITE_URL}, ${SITE_DOCUMENTS.map((document) => absoluteUrl(document.path)).join(', ')}.`,
    `- Discover URLs from ${SITEMAP_INDEX_URL} or this file.`,
    `- Missing paths return HTTP 404 with recovery links to the sitemap and ${absoluteUrl(LLMS_TXT_PATH)}.`,
    '',
    '## Published notes',
    '',
    ...(notes.length > 0
      ? notes.map((item) => `- [${item.title}](${absoluteUrl(item.href)})`)
      : ['- None published.']),
    '',
    '## Published projects',
    '',
    ...(projects.length > 0
      ? projects.map((item) => `- [${item.title}](${absoluteUrl(item.href)})`)
      : ['- None published.']),
    '',
  ].join('\n')
}

function isWritingKind(value: string): value is ContentKind {
  return value === 'notes' || value === 'projects'
}

function parseWritingPath(pathname: string): { kind: ContentKind; slug: string } | null {
  const match = pathname.match(/^\/(notes|projects)\/([^/]+)$/)
  if (!match) {
    return null
  }
  const kind = match[1]
  const slug = match[2]
  if (!kind || !slug || !isWritingKind(kind) || !isValidContentSlug(slug)) {
    return null
  }
  return { kind, slug }
}

export type MarkdownPageResult = {
  status: 200 | 404
  body: string
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
  if (normalized === '/') {
    return { status: 200, body: buildHomeMarkdown() }
  }

  const document = siteDocumentByPath(normalized)
  if (document) {
    return { status: 200, body: buildDocumentMarkdown(document) }
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
