import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('now-playing production measure CSS', () => {
  it('does not use zero-width overflow-hidden sizing for the measure element', () => {
    const nowPlayingCss = readFileSync(join(repoRoot, 'src/styles/now-playing-text.css'), 'utf8')

    expect(nowPlayingCss).not.toMatch(/\.now-playing-measure\s*\{[^}]*width:\s*0/s)
    expect(nowPlayingCss).not.toMatch(/\.now-playing-measure\s*\{[^}]*overflow:\s*hidden/s)
  })

  it('anchors the measure element inside a positioned container', () => {
    const nowPlayingCss = readFileSync(join(repoRoot, 'src/styles/now-playing-text.css'), 'utf8')

    expect(nowPlayingCss).toContain('.now-playing-measure')
    expect(nowPlayingCss).toContain('width: max-content')
    expect(nowPlayingCss).toMatch(/\.now-playing\s*\{[^}]*position:\s*relative/s)
  })
})
