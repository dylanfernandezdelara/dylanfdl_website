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
 * @param date - Date string to format
 * @param locale - Locale for date formatting (default: 'en-US')
 * @returns Formatted date string or original string if invalid
 */
export function formatPostDate(date: string, locale: string = 'en-US'): string {
  const dateObject = new Date(date)
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
 * @param date - Date string to format
 * @param locale - Locale for date formatting (default: 'en-US')
 * @returns Formatted short date string or original string if invalid
 */
export function formatPostDateShort(date: string, locale: string = 'en-US'): string {
  const dateObject = new Date(date)
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
