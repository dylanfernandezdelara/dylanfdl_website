import { parseContentDate } from '@/lib/content/dates'
import type {
  ContentFrontMatter,
  ContentKind,
  ProjectStatus,
} from '@/lib/content/types'

const PROJECT_STATUSES = new Set<ProjectStatus>(['active', 'shipped', 'archived'])

function coerceDateField(
  value: unknown,
  field: 'date' | 'updated',
  kind: ContentKind,
  slug: string
): string | undefined {
  if (value === undefined || value === null) {
    return undefined
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getUTCFullYear()
    const month = String(value.getUTCMonth() + 1).padStart(2, '0')
    const day = String(value.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim()
  }

  throw new Error(
    `${kind} entry "${slug}" has invalid ${field} frontmatter. Expected a quoted YYYY-MM-DD string.`
  )
}

function requireStringFrontMatter(
  frontMatter: Record<string, unknown>,
  field: 'title',
  kind: ContentKind,
  slug: string
): string {
  const value = frontMatter[field]

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(
      `${kind} entry "${slug}" is missing required frontmatter field "${field}".`
    )
  }

  return value.trim()
}

function optionalString(
  frontMatter: Record<string, unknown>,
  field: string
): string | undefined {
  const value = frontMatter[field]
  if (value === undefined || value === null) {
    return undefined
  }
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined
  }
  return value.trim()
}

function parseTopics(frontMatter: Record<string, unknown>): string[] {
  const value = frontMatter.topics
  if (value === undefined || value === null) {
    return []
  }
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error('frontmatter field "topics" must be an array of strings.')
  }
  return value.map((item) => item.trim()).filter((item) => item.length > 0)
}

function parseDraft(frontMatter: Record<string, unknown>): boolean {
  const value = frontMatter.draft
  if (value === undefined || value === null) {
    return false
  }
  if (typeof value !== 'boolean') {
    throw new Error('frontmatter field "draft" must be a boolean (true/false, unquoted).')
  }
  return value
}

function parseStatus(
  frontMatter: Record<string, unknown>,
  kind: ContentKind,
  slug: string
): ProjectStatus | undefined {
  const value = frontMatter.status
  if (value === undefined || value === null) {
    return undefined
  }
  if (kind !== 'projects') {
    throw new Error(`notes entry "${slug}" cannot define project-only field "status".`)
  }
  if (typeof value !== 'string' || !PROJECT_STATUSES.has(value as ProjectStatus)) {
    throw new Error(
      `projects entry "${slug}" has invalid status "${String(value)}". Expected active, shipped, or archived.`
    )
  }
  return value as ProjectStatus
}

export function parseContentFrontMatter(
  frontMatter: Record<string, unknown>,
  kind: ContentKind,
  slug: string
): ContentFrontMatter {
  const date = coerceDateField(frontMatter.date, 'date', kind, slug)
  if (!date) {
    throw new Error(
      `${kind} entry "${slug}" is missing required frontmatter field "date".`
    )
  }
  if (!parseContentDate(date, [3])) {
    throw new Error(
      `${kind} entry "${slug}" has invalid date frontmatter "${date}". Expected YYYY-MM-DD.`
    )
  }

  const updated = coerceDateField(frontMatter.updated, 'updated', kind, slug)
  if (updated && !parseContentDate(updated, [3])) {
    throw new Error(
      `${kind} entry "${slug}" has invalid updated frontmatter "${updated}". Expected YYYY-MM-DD.`
    )
  }

  const liveUrl = optionalString(frontMatter, 'liveUrl')
  const repositoryUrl = optionalString(frontMatter, 'repositoryUrl')
  const status = parseStatus(frontMatter, kind, slug)

  if (kind === 'notes' && (liveUrl || repositoryUrl)) {
    throw new Error(
      `notes entry "${slug}" cannot define project-only fields "liveUrl" or "repositoryUrl".`
    )
  }

  const shared = {
    title: requireStringFrontMatter(frontMatter, 'title', kind, slug),
    date,
    summary: optionalString(frontMatter, 'summary'),
    draft: parseDraft(frontMatter),
    updated,
    topics: parseTopics(frontMatter),
    cardImage: optionalString(frontMatter, 'cardImage'),
    ogImage: optionalString(frontMatter, 'ogImage'),
  }

  if (kind === 'projects') {
    return {
      kind: 'projects',
      ...shared,
      status,
      liveUrl,
      repositoryUrl,
    }
  }

  return {
    kind: 'notes',
    ...shared,
  }
}
