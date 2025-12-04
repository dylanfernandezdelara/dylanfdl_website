import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/writing')

export interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }
  return fs.readdirSync(postsDirectory)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''))
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    if (!fs.existsSync(fullPath)) {
      return null
    }
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      slug,
      title: data.title || '',
      date: data.date || '',
      excerpt: data.excerpt || '',
      content,
    }
  } catch (error) {
    return null
  }
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs()
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null)
    .sort((a, b) => {
      if (a.date < b.date) {
        return 1
      } else {
        return -1
      }
    })

  return posts
}

export function getPostsByYear(): Record<string, Post[]> {
  const posts = getAllPosts()
  const postsByYear: Record<string, Post[]> = {}

  posts.forEach((post) => {
    const year = post.date.substring(0, 4)
    if (!postsByYear[year]) {
      postsByYear[year] = []
    }
    postsByYear[year].push(post)
  })

  return postsByYear
}

