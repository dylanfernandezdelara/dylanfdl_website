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

/**
 * Formats a date string into a full date format (e.g., "January 15, 2025").
 * If the date is invalid, returns the original string unchanged.
 *
 * @param date - Date string to format (expected format: YYYY-MM-DD)
 * @param locale - Locale for date formatting (default: 'en-US')
 * @returns Formatted date string or original string if invalid
 */
export function formatPostDate(date: string, locale: string = 'en-US'): string {
  // Parse date string as local date to avoid timezone issues
  // Date strings in YYYY-MM-DD format are parsed as UTC, which can cause off-by-one errors
  const segments = date.split('-')
  if (segments.length !== 3 || segments.some((segment) => segment.length === 0)) {
    return date
  }

  const parts = segments.map(Number)
  if (parts.some((n) => !Number.isFinite(n))) {
    return date
  }

  const dateObject = new Date(parts[0], parts[1] - 1, parts[2]) // month is 0-indexed
  if (Number.isNaN(dateObject.getTime())) {
    return date
  }

  return dateObject.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Formats a date string into a short format without year (e.g., "Jan 15").
 * Removes the comma that toLocaleDateString adds between month and day.
 * If the date is invalid, returns the original string unchanged.
 *
 * @param date - Date string to format (expected format: YYYY-MM-DD)
 * @param locale - Locale for date formatting (default: 'en-US')
 * @returns Formatted short date string or original string if invalid
 */
export function formatPostDateShort(date: string, locale: string = 'en-US'): string {
  // Parse date string as local date to avoid timezone issues
  // Date strings in YYYY-MM-DD format are parsed as UTC, which can cause off-by-one errors
  const segments = date.split('-')
  if (segments.length !== 3 || segments.some((segment) => segment.length === 0)) {
    return date
  }

  const parts = segments.map(Number)
  if (parts.some((n) => !Number.isFinite(n))) {
    return date
  }

  const dateObject = new Date(parts[0], parts[1] - 1, parts[2]) // month is 0-indexed
  if (Number.isNaN(dateObject.getTime())) {
    return date
  }

  const formattedDate = dateObject.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  })

  // Remove comma between month and day (e.g., "Jan, 15" -> "Jan 15")
  return formattedDate.replace(',', '')
}

/**
 * Formats a date string for compact card labels: abbreviated month and year (e.g. "Dec 2025").
 * Accepts YYYY-MM-DD, YYYY-MM (first of month), or YYYY (January 1). Invalid input is returned unchanged.
 */
export function formatPostDateCardGrid(date: string, locale: string = 'en-US'): string {
  const segments = date.split('-')
  if (segments.length < 1 || segments.length > 3) {
    return date
  }

  if (segments.some((segment) => segment.length === 0)) {
    return date
  }

  const nums = segments.map(Number)
  if (nums.some((n) => !Number.isFinite(n))) {
    return date
  }

  let year: number
  let month: number
  let day: number
  if (nums.length === 1) {
    ;[year] = nums
    month = 1
    day = 1
  } else if (nums.length === 2) {
    ;[year, month] = nums
    day = 1
  } else {
    ;[year, month, day] = nums
  }

  if (month < 1 || month > 12) {
    return date
  }

  // Reject days that don't exist in the given month (e.g. Feb 31) instead of
  // silently letting new Date() roll them into the next month.
  const daysInMonth = new Date(year, month, 0).getDate()
  if (day < 1 || day > daysInMonth) {
    return date
  }

  const dateObject = new Date(year, month - 1, day)
  if (Number.isNaN(dateObject.getTime())) {
    return date
  }

  const formatted = dateObject.toLocaleDateString(locale, {
    month: 'short',
    year: 'numeric',
  })
  return formatted.replace(',', '')
}

/**
 * Extracts the year from a date string (assumes YYYY-MM-DD format).
 * Returns 'Unknown' if the date string is too short.
 *
 * @param dateString - Date string to extract year from
 * @returns Four-digit year string or 'Unknown'
 */
function extractYearFromDate(dateString: string): string {
  if (dateString.length < 4) {
    return 'Unknown'
  }
  return dateString.slice(0, 4)
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
 * Returns null if the file doesn't exist or if there's an error reading it.
 *
 * @param slug - Post slug (filename without extension)
 * @returns Post object or null if not found or error occurs
 */
export function getPostBySlug(slug: string): Post | null {
  try {
    const filePath = path.join(postsDirectory, `${slug}.md`)

    if (!fs.existsSync(filePath)) {
      return null
    }

    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data: frontMatter, content } = matter(fileContents)

    return {
      slug,
      title: frontMatter.title || '',
      date: frontMatter.date || '',
      excerpt: frontMatter.excerpt || '',
      content,
    }
  } catch (error) {
    // Silently return null on any file reading or parsing errors
    return null
  }
}

/**
 * Retrieves all posts, sorted by date in descending order (newest first).
 * Filters out any posts that failed to load (null values).
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

/**
 * Groups all posts by year.
 * Posts are organized into a record where keys are years (as strings)
 * and values are arrays of posts from that year.
 *
 * @returns Record mapping year strings to arrays of Post objects
 */
export function getPostsByYear(): Record<string, Post[]> {
  const posts = getAllPosts()
  const postsByYear: Record<string, Post[]> = {}

  for (const post of posts) {
    const year = extractYearFromDate(post.date)

    if (!postsByYear[year]) {
      postsByYear[year] = []
    }

    postsByYear[year].push(post)
  }

  return postsByYear
}
