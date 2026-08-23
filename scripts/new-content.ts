import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { slugifyTitle } from '@/lib/content/paths'
import type { ContentKind } from '@/lib/content/types'

import { writeContentRegistry } from './generate-content-registry'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

function today(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function usage(): never {
  console.error('Usage: npm run new:note -- "Title" | npm run new:project -- "Title"')
  process.exit(1)
}

const kindArg = process.argv[2]
const title = process.argv.slice(3).join(' ').trim()

if ((kindArg !== 'notes' && kindArg !== 'projects') || !title) {
  usage()
}

const kind = kindArg as ContentKind
const slug = slugifyTitle(title)
if (!slug) {
  console.error(
    'Could not derive a valid kebab-case slug from the title (a-z, 0-9, hyphens only).'
  )
  process.exit(1)
}

const entryDir = path.join(root, 'content', kind, slug)
const mediaDir = path.join(root, 'public', 'writing', kind, slug)
const indexPath = path.join(entryDir, 'index.mdx')

if (fs.existsSync(indexPath)) {
  console.error(`Already exists: ${path.relative(root, indexPath)}`)
  process.exit(1)
}

fs.mkdirSync(entryDir, { recursive: true })
fs.mkdirSync(mediaDir, { recursive: true })

const projectFields =
  kind === 'projects'
    ? `status: "active"
# liveUrl: "https://example.com"
# repositoryUrl: "https://github.com/you/repo"
`
    : ''

const starter = `---
title: "${title.replace(/"/g, '\\"')}"
date: "${today()}"
# summary: "One or two sentences that orient the reader."
draft: true
topics: []
${projectFields}---

## Context

Start with the problem or idea.

## How it works

Describe the approach.

## What I learned

Capture the takeaway.

{/*
<Figure width="wide" caption="Describe the visual.">
  <ArticleImage src="/writing/${kind}/${slug}/hero.png" alt="Describe the image." />
</Figure>
*/}
`

fs.writeFileSync(indexPath, starter)
fs.writeFileSync(path.join(mediaDir, '.gitkeep'), '')

writeContentRegistry()

console.log(`Created draft ${kind.slice(0, -1)}: ${path.relative(root, indexPath)}`)
console.log(`Media folder: ${path.relative(root, mediaDir)}`)
console.log('Set draft: false in frontmatter when you are ready to publish.')
