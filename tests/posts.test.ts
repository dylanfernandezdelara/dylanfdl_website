import { describe, expect, it } from 'vitest'

import {
  getAllPosts,
  getPostBySlug,
  getPostSlugs,
  parsePostFrontMatter,
} from '@/lib/posts'

describe('parsePostFrontMatter', () => {
  it('accepts valid title, date, and excerpt', () => {
    expect(
      parsePostFrontMatter(
        {
          title: 'On Writing',
          date: '2025-12-20',
          excerpt: 'A short excerpt',
        },
        'purpose-of-writing',
      ),
    ).toEqual({
      title: 'On Writing',
      date: '2025-12-20',
      excerpt: 'A short excerpt',
    })
  })

  it('rejects missing or blank required fields', () => {
    expect(() =>
      parsePostFrontMatter({ date: '2025-12-20', excerpt: 'excerpt' }, 'slug'),
    ).toThrow('missing required frontmatter field "title"')

    expect(() =>
      parsePostFrontMatter({ title: '  ', date: '2025-12-20', excerpt: 'excerpt' }, 'slug'),
    ).toThrow('missing required frontmatter field "title"')

    expect(() =>
      parsePostFrontMatter({ title: 'Title', excerpt: 'excerpt' }, 'slug'),
    ).toThrow('missing required frontmatter field "date"')

    expect(() =>
      parsePostFrontMatter({ title: 'Title', date: '2025-12-20' }, 'slug'),
    ).toThrow('missing required frontmatter field "excerpt"')
  })

  it('rejects invalid date formats', () => {
    expect(() =>
      parsePostFrontMatter(
        { title: 'Title', date: '2025-12', excerpt: 'excerpt' },
        'slug',
      ),
    ).toThrow('invalid date frontmatter "2025-12"')

    expect(() =>
      parsePostFrontMatter(
        { title: 'Title', date: '2025-02-31', excerpt: 'excerpt' },
        'slug',
      ),
    ).toThrow('invalid date frontmatter "2025-02-31"')
  })
})

describe('essay content loading', () => {
  it('lists markdown essay slugs', () => {
    expect(getPostSlugs()).toContain('purpose-of-writing')
  })

  it('loads a known essay by slug', () => {
    const post = getPostBySlug('purpose-of-writing')

    expect(post).not.toBeNull()
    expect(post?.slug).toBe('purpose-of-writing')
    expect(post?.title).toBe('On Writing')
    expect(post?.date).toBe('2025-12-20')
    expect(post?.excerpt.length).toBeGreaterThan(0)
    expect(post?.content.length).toBeGreaterThan(0)
  })

  it('returns null for unknown slugs', () => {
    expect(getPostBySlug('does-not-exist')).toBeNull()
  })

  it('returns all posts sorted by date descending with required fields', () => {
    const posts = getAllPosts()

    expect(posts.length).toBeGreaterThan(0)
    for (const post of posts) {
      expect(post.title.trim().length).toBeGreaterThan(0)
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(post.excerpt.trim().length).toBeGreaterThan(0)
      expect(post.content.trim().length).toBeGreaterThan(0)
    }

    const dates = posts.map((post) => post.date)
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)))
  })
})
