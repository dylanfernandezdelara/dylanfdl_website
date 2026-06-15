import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('now-playing production measure CSS', () => {
  // Contract tests: guard layout-critical CSS that layout measurement depends on.
  const nowPlayingCss = readFileSync(join(repoRoot, 'src/styles/now-playing-text.css'), 'utf8')

  it('sizes the hidden measure element for accurate scrollWidth reads', () => {
    expect(nowPlayingCss).not.toMatch(/\.now-playing-measure\s*\{[^}]*width:\s*0/s)
    expect(nowPlayingCss).toContain('width: max-content')
    expect(nowPlayingCss).toMatch(/\.now-playing\s*\{[^}]*position:\s*relative/s)
  })

  it('keeps inline layouts on a single row including the label', () => {
    expect(nowPlayingCss).toContain(".now-playing[data-layout='inline']")
    expect(nowPlayingCss).toContain('white-space: nowrap')
  })

  it('splits the label onto its own row when inline no longer fits', () => {
    expect(nowPlayingCss).toContain(".now-playing[data-layout='split'] .now-playing-label")
    expect(nowPlayingCss).toContain('display: block')
  })

  it('keeps label and title together with artist on the next row for prefix-split', () => {
    expect(nowPlayingCss).toContain(".now-playing[data-layout='prefix-split']")
    expect(nowPlayingCss).toContain(".now-playing[data-layout='prefix-split'] {")
    expect(nowPlayingCss).toMatch(/\.now-playing\[data-layout='prefix-split'\][^{]*\{[^}]*white-space:\s*nowrap/s)
    expect(nowPlayingCss).toContain(".now-playing[data-layout='prefix-split'] .now-playing-title")
    expect(nowPlayingCss).toMatch(
      /\.now-playing\[data-layout='prefix-split'\] \.now-playing-title[^{]*\{[^}]*white-space:\s*nowrap/s,
    )
    expect(nowPlayingCss).toContain(".now-playing[data-layout='prefix-split'] .now-playing-artist-line")
    expect(nowPlayingCss).toContain('display: block')
  })

  it('mirrors prefix-split row typography in the hidden prefix-row measure', () => {
    expect(nowPlayingCss).toContain('.now-playing-prefix-row-measure .now-playing-label')
    expect(nowPlayingCss).toContain('.now-playing-prefix-row-measure .now-playing-slot')
  })

  it('forces stacked title and artist onto separate rows', () => {
    expect(nowPlayingCss).toContain(".now-playing[data-layout='stacked']")
    expect(nowPlayingCss).toContain('flex-direction: column')
    expect(nowPlayingCss).toContain(".now-playing[data-layout='stacked'] .now-playing-artist-line")
  })
})
