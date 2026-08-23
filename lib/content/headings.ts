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
 * Visible (non-comment) text on a line, updating JSX comment state across lines.
 */
function visibleLineText(
  line: string,
  inJsxComment: boolean
): { text: string; inJsxComment: boolean } {
  let result = ''
  let index = 0
  let comment = inJsxComment

  while (index < line.length) {
    if (!comment) {
      const start = line.indexOf('{/*', index)
      if (start === -1) {
        result += line.slice(index)
        break
      }
      result += line.slice(index, start)
      comment = true
      index = start + 3
    } else {
      const end = line.indexOf('*/}', index)
      if (end === -1) {
        break
      }
      comment = false
      index = end + 3
    }
  }

  return { text: result, inJsxComment: comment }
}

/**
 * Extract h2/h3 headings from MDX/markdown body for the article TOC.
 * Uses github-slugger (same as rehype-slug) so TOC ids match rendered heading ids.
 * Ignores fenced code blocks and JSX block comments.
 */
export function extractContentHeadings(markdown: string): ContentHeading[] {
  const headings: ContentHeading[] = []
  const slugger = new GithubSlugger()
  let inFence = false
  let inJsxComment = false

  for (const line of markdown.split('\n')) {
    if (!inJsxComment && line.trimStart().startsWith('```')) {
      inFence = !inFence
      continue
    }
    if (inFence) {
      continue
    }

    const visible = visibleLineText(line, inJsxComment)
    inJsxComment = visible.inJsxComment

    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(visible.text)
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
