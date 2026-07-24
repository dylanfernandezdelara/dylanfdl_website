import path from 'node:path'

import type { ContentKind } from '@/lib/content/types'

export const CONTENT_KINDS: ContentKind[] = ['notes', 'projects']

/** Folder / URL slug: lowercase kebab-case only. */
export const CONTENT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidContentSlug(slug: string): boolean {
  return CONTENT_SLUG_PATTERN.test(slug)
}

export function slugifyTitle(title: string): string | null {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  return isValidContentSlug(slug) ? slug : null
}

export function contentRootDir(): string {
  return path.join(process.cwd(), 'content')
}

export function contentKindDir(kind: ContentKind): string {
  return path.join(contentRootDir(), kind)
}

export function assertContentSlug(kind: ContentKind, slug: string): void {
  if (!isValidContentSlug(slug)) {
    throw new Error(
      `${kind} entry slug "${slug}" is invalid. Expected lowercase kebab-case (a-z, 0-9, hyphens).`
    )
  }
}

export function contentEntryDir(kind: ContentKind, slug: string): string {
  assertContentSlug(kind, slug)
  const kindDir = contentKindDir(kind)
  const entryDir = path.resolve(kindDir, slug)
  const relative = path.relative(kindDir, entryDir)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${kind} entry slug "${slug}" escapes the content directory.`)
  }
  return entryDir
}

export function contentEntryFile(kind: ContentKind, slug: string): string {
  return path.join(contentEntryDir(kind, slug), 'index.mdx')
}

export function contentPublicMediaDir(kind: ContentKind, slug: string): string {
  assertContentSlug(kind, slug)
  return path.join(process.cwd(), 'public', 'writing', kind, slug)
}

export function contentCanonicalPath(kind: ContentKind, slug: string): string {
  assertContentSlug(kind, slug)
  return `/${kind}/${slug}`
}

export function contentRegistryKey(kind: ContentKind, slug: string): string {
  assertContentSlug(kind, slug)
  return `${kind}/${slug}`
}
