import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('now-playing production measure CSS', () => {
  it('does not zero out the hidden measure element width', () => {
    const nowPlayingCss = readFileSync(join(repoRoot, 'src/styles/now-playing-text.css'), 'utf8')

    expect(nowPlayingCss).not.toMatch(/\.now-playing-measure\s*\{[^}]*width:\s*0/s)
  })
})
