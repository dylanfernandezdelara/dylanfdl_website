import fs from 'node:fs'
import path from 'node:path'

import matter from 'gray-matter'

import { includeDraftEntries } from '@/lib/content/draftPolicy'
import { parseContentFrontMatter } from '@/lib/content/frontmatter'
import { extractContentHeadings } from '@/lib/content/headings'
import {
  CONTENT_KINDS,
  contentEntryFile,
  contentKindDir,
  isValidContentSlug,
} from '@/lib/content/paths'
import type { ContentEntry, ContentKind } from '@/lib/content/types'

export { includeDraftEntries }

function isDirectory(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isDirectory()
  } catch {
    return false
  }
}

function isDraftFlag(data: Record<string, unknown>): boolean {
  return data.draft === true
}

export function getContentSlugs(kind: ContentKind): string[] {
  const kindDir = contentKindDir(kind)
  if (!fs.existsSync(kindDir)) {
    return []
  }

  return fs
    .readdirSync(kindDir)
    .filter((slug) => isValidContentSlug(slug))
    .filter((slug) => isDirectory(path.join(kindDir, slug)))
    .filter((slug) => fs.existsSync(contentEntryFile(kind, slug)))
    .sort((a, b) => a.localeCompare(b))
}

export function getEntryBySlug(
  kind: ContentKind,
  slug: string,
  options: { allowDrafts?: boolean } = {}
): ContentEntry | null {
  if (!isValidContentSlug(slug)) {
    return null
  }

  let filePath: string
  try {
    filePath = contentEntryFile(kind, slug)
  } catch {
    return null
  }

  if (!fs.existsSync(filePath)) {
    return null
  }

  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)
  const allowDrafts = options.allowDrafts ?? includeDraftEntries()

  // Exclude boolean drafts before full validation so a broken draft cannot take
  // down published listings. Non-boolean draft values fail closed in parse.
  if (!allowDrafts && isDraftFlag(data)) {
    return null
  }

  const frontMatter = parseContentFrontMatter(data, kind, slug)

  if (frontMatter.draft && !allowDrafts) {
    return null
  }

  return {
    ...frontMatter,
    slug,
    content,
    headings: extractContentHeadings(content),
  }
}

function loadEntriesForKind(kind: ContentKind, allowDrafts: boolean): ContentEntry[] {
  return getContentSlugs(kind)
    .map((slug) => {
      try {
        return getEntryBySlug(kind, slug, { allowDrafts })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`Skipping invalid ${kind} entry "${slug}": ${message}`)
        return null
      }
    })
    .filter((entry): entry is ContentEntry => entry !== null)
}

export function getAllEntries(options: { allowDrafts?: boolean } = {}): ContentEntry[] {
  const allowDrafts = options.allowDrafts ?? includeDraftEntries()

  return CONTENT_KINDS.flatMap((kind) => loadEntriesForKind(kind, allowDrafts)).sort(
    (a, b) => b.date.localeCompare(a.date)
  )
}

export function getEntriesByKind(
  kind: ContentKind,
  options: { allowDrafts?: boolean } = {}
): ContentEntry[] {
  const allowDrafts = options.allowDrafts ?? includeDraftEntries()
  return loadEntriesForKind(kind, allowDrafts).sort((a, b) => b.date.localeCompare(a.date))
}

export function getPublishedEntries(): ContentEntry[] {
  return getAllEntries({ allowDrafts: false })
}
