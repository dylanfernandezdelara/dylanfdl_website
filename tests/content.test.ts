import { describe, expect, it } from 'vitest'

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  extractContentHeadings,
  getAllEntries,
  getContentSlugs,
  getEntryBySlug,
  getPublishedEntries,
  isValidContentSlug,
  parseContentFrontMatter,
} from '@/lib/content'

describe('parseContentFrontMatter', () => {
  it('accepts valid title and date without summary', () => {
    expect(
      parseContentFrontMatter(
        {
          title: 'On Writing',
          date: '2025-12-20',
        },
        'notes',
        'purpose-of-writing'
      )
    ).toMatchObject({
      kind: 'notes',
      title: 'On Writing',
      date: '2025-12-20',
      draft: false,
    })
  })

  it('accepts an optional summary when provided', () => {
    expect(
      parseContentFrontMatter(
        {
          title: 'On Writing',
          date: '2025-12-20',
          summary: 'A short summary',
        },
        'notes',
        'purpose-of-writing'
      ).summary
    ).toBe('A short summary')
  })

  it('coerces unquoted YAML Date objects to YYYY-MM-DD', () => {
    expect(
      parseContentFrontMatter(
        {
          title: 'On Writing',
          date: new Date(Date.UTC(2025, 11, 20)),
        },
        'notes',
        'slug'
      ).date
    ).toBe('2025-12-20')
  })

  it('rejects non-boolean draft values', () => {
    expect(() =>
      parseContentFrontMatter(
        {
          title: 'Title',
          date: '2025-12-20',
          draft: 'true',
        },
        'notes',
        'slug'
      )
    ).toThrow('draft" must be a boolean')

    expect(() =>
      parseContentFrontMatter(
        {
          title: 'Title',
          date: '2025-12-20',
          draft: 'yes',
        },
        'notes',
        'slug'
      )
    ).toThrow('draft" must be a boolean')
  })

  it('rejects missing required fields and invalid dates', () => {
    expect(() =>
      parseContentFrontMatter({ date: '2025-12-20' }, 'notes', 'slug')
    ).toThrow('missing required frontmatter field "title"')

    expect(() =>
      parseContentFrontMatter({ title: 'Title', date: '2025-12' }, 'notes', 'slug')
    ).toThrow('invalid date frontmatter "2025-12"')
  })

  it('rejects project-only fields on notes', () => {
    expect(() =>
      parseContentFrontMatter(
        {
          title: 'Title',
          date: '2025-12-20',
          liveUrl: 'https://example.com',
        },
        'notes',
        'slug'
      )
    ).toThrow('cannot define project-only fields')
  })

  it('returns a project discriminant for projects', () => {
    const entry = parseContentFrontMatter(
      {
        title: 'Tool',
        date: '2025-12-20',
        status: 'active',
        liveUrl: 'https://example.com',
      },
      'projects',
      'tool'
    )

    expect(entry.kind).toBe('projects')
    if (entry.kind === 'projects') {
      expect(entry.status).toBe('active')
      expect(entry.liveUrl).toBe('https://example.com')
    }
  })
})

describe('extractContentHeadings', () => {
  it('extracts unique h2/h3 ids and ignores fenced code', () => {
    const headings = extractContentHeadings(`
## One
### Nested
\`\`\`
## Not a heading
\`\`\`
## One
`)

    expect(headings).toEqual([
      { id: 'one', text: 'One', level: 2 },
      { id: 'nested', text: 'Nested', level: 3 },
      { id: 'one-1', text: 'One', level: 2 },
    ])
  })

  it('matches github-slugger / rehype-slug for punctuation and non-ascii', () => {
    const headings = extractContentHeadings(`
## foo & bar
## Emoji 🎉 Party
## déjà vu
`)

    expect(headings.map((heading) => heading.id)).toEqual([
      'foo--bar',
      'emoji--party',
      'déjà-vu',
    ])
  })

  it('strips markdown links so TOC ids match rendered text', () => {
    const headings = extractContentHeadings(`
## [Linked heading](https://example.com)
`)

    expect(headings).toEqual([{ id: 'linked-heading', text: 'Linked heading', level: 2 }])
  })
})

describe('content loading', () => {
  it('does not load the retired On Writing note', () => {
    expect(getEntryBySlug('notes', 'purpose-of-writing', { allowDrafts: true })).toBeNull()
    expect(getPublishedEntries().some((entry) => entry.slug === 'purpose-of-writing')).toBe(false)
  })

  it('keeps draft showcase available locally but out of published lists', () => {
    expect(getContentSlugs('notes')).toContain('component-showcase')
    expect(
      getEntryBySlug('notes', 'component-showcase', { allowDrafts: true })?.draft
    ).toBe(true)
    expect(getPublishedEntries().some((entry) => entry.slug === 'component-showcase')).toBe(
      false
    )
  })

  it('returns entries sorted by date descending', () => {
    const entries = getAllEntries({ allowDrafts: true })
    const dates = entries.map((entry) => entry.date)
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)))
  })

  it('rejects path-traversal and invalid slugs', () => {
    expect(isValidContentSlug('purpose-of-writing')).toBe(true)
    expect(isValidContentSlug('hello_world')).toBe(false)
    expect(isValidContentSlug('-leading')).toBe(false)
    expect(isValidContentSlug('..')).toBe(false)
    expect(isValidContentSlug('../secrets')).toBe(false)
    expect(getEntryBySlug('notes', '..')).toBeNull()
    expect(getEntryBySlug('notes', '../secrets')).toBeNull()
  })

  it('does not let a broken draft abort published aggregation', () => {
    const draftDir = path.join(process.cwd(), 'content/notes/broken-draft-audit')
    const draftFile = path.join(draftDir, 'index.mdx')
    fs.mkdirSync(draftDir, { recursive: true })
    fs.writeFileSync(
      draftFile,
      `---
title: "Broken draft"
date: "2025-12"
summary: "Invalid date should not crash published lists"
draft: true
---

Body
`
    )

    try {
      expect(getContentSlugs('notes')).toContain('broken-draft-audit')
      expect(() => getPublishedEntries()).not.toThrow()
      expect(getPublishedEntries().some((entry) => entry.slug === 'broken-draft-audit')).toBe(
        false
      )
      expect(getEntryBySlug('notes', 'broken-draft-audit', { allowDrafts: false })).toBeNull()
    } finally {
      fs.rmSync(draftDir, { recursive: true, force: true })
    }
  })
})

describe('content registry generation', () => {
  function runRegistry(env: Record<string, string>) {
    return spawnSync('npx', ['tsx', 'scripts/generate-content-registry.ts'], {
      cwd: process.cwd(),
      env: { ...process.env, ...env },
      encoding: 'utf8',
    })
  }

  it('omits drafts when CONTENT_INCLUDE_DRAFTS=0', () => {
    const outFile = path.join(os.tmpdir(), `registry-prod-${process.pid}.ts`)
    const result = runRegistry({
      CONTENT_INCLUDE_DRAFTS: '0',
      CONTENT_REGISTRY_OUT: outFile,
    })

    try {
      expect(result.status, result.stderr || result.stdout).toBe(0)
      const source = fs.readFileSync(outFile, 'utf8')
      expect(source).not.toContain('purpose-of-writing')
      expect(source).not.toContain('component-showcase')
      expect(source).not.toContain('frontmatter?')
    } finally {
      fs.rmSync(outFile, { force: true })
    }
  })

  it('rejects non-boolean draft values instead of bundling them', () => {
    const draftDir = path.join(process.cwd(), 'content/notes/string-draft-audit')
    const draftFile = path.join(draftDir, 'index.mdx')
    fs.mkdirSync(draftDir, { recursive: true })
    fs.writeFileSync(
      draftFile,
      `---
title: "String draft"
date: "2025-12-20"
summary: "Should not enter the registry"
draft: "true"
---

Body
`
    )

    const outFile = path.join(os.tmpdir(), `registry-string-draft-${process.pid}.ts`)
    const result = runRegistry({
      CONTENT_INCLUDE_DRAFTS: '1',
      CONTENT_REGISTRY_OUT: outFile,
    })

    try {
      expect(result.status).not.toBe(0)
      expect(result.stderr + result.stdout).toMatch(/draft.*boolean/i)
    } finally {
      fs.rmSync(draftDir, { recursive: true, force: true })
      fs.rmSync(outFile, { force: true })
    }
  })

  it('skips broken boolean drafts when CONTENT_INCLUDE_DRAFTS=0', () => {
    const draftDir = path.join(process.cwd(), 'content/notes/broken-draft-registry-audit')
    const draftFile = path.join(draftDir, 'index.mdx')
    fs.mkdirSync(draftDir, { recursive: true })
    fs.writeFileSync(
      draftFile,
      `---
title: "Broken draft"
date: "2025-12"
summary: "Invalid date must not fail production registry"
draft: true
---

Body
`
    )

    const outFile = path.join(os.tmpdir(), `registry-broken-draft-${process.pid}.ts`)
    const result = runRegistry({
      CONTENT_INCLUDE_DRAFTS: '0',
      CONTENT_REGISTRY_OUT: outFile,
    })

    try {
      expect(result.status, result.stderr || result.stdout).toBe(0)
      const source = fs.readFileSync(outFile, 'utf8')
      expect(source).not.toContain('purpose-of-writing')
      expect(source).not.toContain('broken-draft-registry-audit')
    } finally {
      fs.rmSync(draftDir, { recursive: true, force: true })
      fs.rmSync(outFile, { force: true })
    }
  })

  it('rejects invalid topics/status with the same parser as runtime', () => {
    const draftDir = path.join(process.cwd(), 'content/projects/bad-status-audit')
    const draftFile = path.join(draftDir, 'index.mdx')
    fs.mkdirSync(draftDir, { recursive: true })
    fs.writeFileSync(
      draftFile,
      `---
title: "Bad status"
date: "2025-12-20"
summary: "Should fail registry generation"
draft: false
status: "done"
---

Body
`
    )

    const outFile = path.join(os.tmpdir(), `registry-bad-status-${process.pid}.ts`)
    const result = runRegistry({
      CONTENT_INCLUDE_DRAFTS: '0',
      CONTENT_REGISTRY_OUT: outFile,
    })

    try {
      expect(result.status).not.toBe(0)
      expect(result.stderr + result.stdout).toMatch(/invalid status/i)
    } finally {
      fs.rmSync(draftDir, { recursive: true, force: true })
      fs.rmSync(outFile, { force: true })
    }
  })
})

describe('slugifyTitle', () => {
  it('matches isValidContentSlug for derived slugs', async () => {
    const { slugifyTitle } = await import('@/lib/content/paths')

    expect(slugifyTitle('Hello World')).toBe('hello-world')
    expect(slugifyTitle('Hello_World')).toBe('helloworld')
    expect(slugifyTitle('-Leading')).toBe('leading')
    expect(slugifyTitle('Trailing-')).toBe('trailing')
    expect(isValidContentSlug(slugifyTitle('Hello World')!)).toBe(true)
  })
})
