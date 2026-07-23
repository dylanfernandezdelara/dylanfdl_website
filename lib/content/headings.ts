import GithubSlugger from 'github-slugger'

import type { ContentHeading } from '@/lib/content/types'

/**
 * Strip common markdown inline markup so TOC text/ids match rehype-slug's
 * rendered heading text (links, images, emphasis, inline code).
 */
function normalizeHeadingText(raw: string): string {
  return raw
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/([*_~]{1,3})(.+?)\1/g, '$2')
    .trim()
}

/**
 * Extract h2/h3 headings from MDX/markdown body for the article TOC.
 * Uses github-slugger (same as rehype-slug) so TOC ids match rendered heading ids.
 * Ignores fenced code blocks so hashes inside demos are not treated as headings.
 */
export function extractContentHeadings(markdown: string): ContentHeading[] {
  const headings: ContentHeading[] = []
  const slugger = new GithubSlugger()
  let inFence = false

  for (const line of markdown.split('\n')) {
    if (line.trimStart().startsWith('```')) {
      inFence = !inFence
      continue
    }
    if (inFence) {
      continue
    }

    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!match) {
      continue
    }

    const level = match[1]!.length as 2 | 3
    const text = normalizeHeadingText(match[2]!)
    if (!text) {
      continue
    }

    const id = slugger.slug(text)
    // Punctuation-only titles slug to ''; rehype-slug leaves id empty — skip those.
    if (!id) {
      continue
    }

    headings.push({ id, text, level })
  }

  return headings
}
