import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/essays')

export interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
}

type DateFormat = 'full' | 'card'

type ParsedPostDate = {
  year: number
  month: number
  day: number
}

type PostFrontMatter = {
  title: string
  date: string
  excerpt: string
}

function parsePostDate(date: string, allowedSegmentCounts: number[]): ParsedPostDate | null {
  const segments = date.split('-')
  if (!allowedSegmentCounts.includes(segments.length)) {
    return null
  }

  if (segments.some((segment) => !/^\d+$/.test(segment))) {
    return null
  }

  const [year, month = 1, day = 1] = segments.map(Number)
  if (![year, month, day].every(Number.isInteger)) {
    return null
  }

  if (month < 1 || month > 12) {
    return null
  }

  const monthEnd = new Date(0)
  monthEnd.setFullYear(year, month, 0)
  const daysInMonth = monthEnd.getDate()
  if (day < 1 || day > daysInMonth) {
    return null
  }

  return { year, month, day }
}

function toLocalDate({ year, month, day }: ParsedPostDate): Date {
  const date = new Date(0)
  date.setFullYear(year, month - 1, day)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatParsedPostDate(
  date: string,
  locale: string,
  format: DateFormat,
  allowedSegmentCounts: number[]
): string {
  const parsed = parsePostDate(date, allowedSegmentCounts)
  if (!parsed) {
    return date
  }

  const formatted = toLocalDate(parsed).toLocaleDateString(
    locale,
    format === 'full'
      ? {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      : {
          month: 'short',
          year: 'numeric',
        }
  )

  return formatted.replace(',', '')
}

function requireStringFrontMatter(
  frontMatter: Record<string, unknown>,
  field: keyof PostFrontMatter,
  slug: string
): string {
  const value = frontMatter[field]

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Post "${slug}" is missing required frontmatter field "${field}".`)
  }

  return value
}

function parsePostFrontMatter(frontMatter: Record<string, unknown>, slug: string): PostFrontMatter {
  const date = requireStringFrontMatter(frontMatter, 'date', slug)

  if (!parsePostDate(date, [3])) {
    throw new Error(`Post "${slug}" has invalid date frontmatter "${date}". Expected YYYY-MM-DD.`)
  }

  return {
    title: requireStringFrontMatter(frontMatter, 'title', slug),
    date,
    excerpt: requireStringFrontMatter(frontMatter, 'excerpt', slug),
  }
}

export function formatPostDate(date: string, locale: string = 'en-US'): string {
  return formatParsedPostDate(date, locale, 'full', [3])
}

/**
 * Formats a date string for compact card labels: abbreviated month and year (e.g. "Dec 2025").
 * Accepts YYYY-MM-DD, YYYY-MM (first of month), or YYYY (January 1). Invalid input is returned unchanged.
 */
export function formatPostDateCardGrid(date: string, locale: string = 'en-US'): string {
  return formatParsedPostDate(date, locale, 'card', [1, 2, 3])
}

/**
 * Retrieves all post slugs by reading markdown files from the posts directory.
 * Returns an empty array if the directory doesn't exist.
 *
 * @returns Array of post slugs (filenames without .md extension)
 */
export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const markdownFiles = fs.readdirSync(postsDirectory).filter((file) => file.endsWith('.md'))
  return markdownFiles.map((file) => file.replace(/\.md$/, ''))
}

/**
 * Retrieves a single post by its slug.
 * Reads the markdown file, parses front matter, and returns post data.
 * Returns null if the file doesn't exist. Invalid frontmatter throws so the static build fails.
 *
 * @param slug - Post slug (filename without extension)
 * @returns Post object or null if not found
 */
export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(postsDirectory, `${slug}.md`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)
  const frontMatter = parsePostFrontMatter(data, slug)

  return {
    slug,
    ...frontMatter,
    content,
  }
}

/**
 * Retrieves all posts, sorted by date in descending order (newest first).
 * Filters out any missing posts (null values).
 *
 * @returns Array of Post objects sorted by date
 */
export function getAllPosts(): Post[] {
  const slugs = getPostSlugs()

  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null)
    .sort((a, b) => b.date.localeCompare(a.date))

  return posts
}
