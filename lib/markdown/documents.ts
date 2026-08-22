import { buildCardGridItems, partitionCardGridItems } from '@/lib/buildCardGridItems'
import {
  contentCanonicalPath,
  getEntryBySlug,
  isValidContentSlug,
  type ContentKind,
} from '@/lib/content'
import {
  ABOUT_PAGE_PARAGRAPHS,
  ABOUT_PAGE_TITLE,
  CONTACT_PAGE_PARAGRAPHS,
  CONTACT_PAGE_TITLE,
  HOME_ABOUT_HEADING,
  HOME_DETAIL_PARAGRAPHS,
  HOME_INTRO_PARAGRAPHS,
  HOME_WORK_HEADING,
  HOME_WORK_INTRO,
  NOT_FOUND_RECOVERY_LINKS,
  PRIVACY_PAGE_PARAGRAPHS,
  PRIVACY_PAGE_TITLE,
  joinParagraphs,
} from '@/lib/siteCopy'
import {
  ABOUT_PATH,
  CONTACT_EMAIL,
  CONTACT_LINKS,
  CONTACT_PATH,
  LLMS_TXT_PATH,
  PERSON_LOCATION,
  PERSON_NAME,
  PRIVACY_PATH,
  SITE_URL,
  SITEMAP_INDEX_URL,
  absoluteUrl,
  toIsoDateTime,
} from '@/lib/site'

function listItems(
  items: { title: string; href: string; dateLabel: string; kind?: string }[],
  empty: string,
): string[] {
  if (items.length === 0) {
    return [empty]
  }
  return items.map((item) => {
    const href = item.kind === 'artifact' ? item.href : absoluteUrl(item.href)
    return `- [${item.title}](${href}) — ${item.dateLabel}`
  })
}

export function buildHomeMarkdown(): string {
  const { projects, notes, music } = partitionCardGridItems(buildCardGridItems())

  return [
    `# ${PERSON_NAME}`,
    '',
    'I am an optimist.',
    '',
    joinParagraphs(HOME_INTRO_PARAGRAPHS),
    '',
    `## ${HOME_WORK_HEADING}`,
    '',
    HOME_WORK_INTRO,
    '',
    '## Projects',
    '',
    ...listItems(projects, 'No published projects yet.'),
    '',
    '## Notes',
    '',
    ...listItems(notes, 'No published notes yet.'),
    '',
    '## Music',
    '',
    ...listItems(music, 'No music recordings yet.'),
    '',
    `## ${HOME_ABOUT_HEADING}`,
    '',
    joinParagraphs(HOME_DETAIL_PARAGRAPHS),
    '',
    '## Pages',
    '',
    `- [About](${absoluteUrl(ABOUT_PATH)})`,
    `- [Contact](${absoluteUrl(CONTACT_PATH)})`,
    `- [Privacy](${absoluteUrl(PRIVACY_PATH)})`,
    `- [Sitemap](${SITEMAP_INDEX_URL})`,
    `- [llms.txt](${absoluteUrl(LLMS_TXT_PATH)})`,
    '',
  ].join('\n')
}

export function buildAboutMarkdown(): string {
  return [`# ${ABOUT_PAGE_TITLE}`, '', joinParagraphs(ABOUT_PAGE_PARAGRAPHS), ''].join('\n')
}

export function buildContactMarkdown(): string {
  return [
    `# ${CONTACT_PAGE_TITLE}`,
    '',
    joinParagraphs(CONTACT_PAGE_PARAGRAPHS),
    '',
    '## Profiles',
    '',
    ...CONTACT_LINKS.map((link) => `- [${link.label}](${link.href})`),
    '',
  ].join('\n')
}

export function buildPrivacyMarkdown(): string {
  return [`# ${PRIVACY_PAGE_TITLE}`, '', joinParagraphs(PRIVACY_PAGE_PARAGRAPHS), ''].join('\n')
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
    `Canonical: ${contentCanonicalPath(entry.kind, entry.slug)}`,
    '',
    entry.content.trim(),
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
    `- Start with ${SITE_URL}, ${absoluteUrl(ABOUT_PATH)}, ${absoluteUrl(CONTACT_PATH)}, and ${absoluteUrl(PRIVACY_PATH)}.`,
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

export function isWritingKind(value: string): value is ContentKind {
  return value === 'notes' || value === 'projects'
}

export function parseWritingPath(pathname: string): { kind: ContentKind; slug: string } | null {
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
