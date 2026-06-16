import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('now-playing production measure CSS', () => {
  const nowPlayingCss = readFileSync(join(repoRoot, 'src/styles/now-playing-text.css'), 'utf8')

  it('sizes the hidden measure element for accurate scrollWidth reads', () => {
    expect(nowPlayingCss).not.toMatch(/\.now-playing-measure\s*\{[^}]*width:\s*0/s)
    expect(nowPlayingCss).toContain('width: max-content')
    expect(nowPlayingCss).toMatch(/\.now-playing\s*\{[^}]*position:\s*relative/s)
  })

  it('scopes layout rules to visible direct children so hidden measures stay inline', () => {
    expect(nowPlayingCss).toContain(".now-playing[data-layout='stacked'] > .now-playing-label")
    expect(nowPlayingCss).toContain('.now-playing-measure-label')
    expect(nowPlayingCss).not.toContain(
      ".now-playing[data-layout='stacked'] .now-playing-label {",
    )
  })

  it('keeps inline layouts on a single row including the label', () => {
    expect(nowPlayingCss).toContain(".now-playing[data-layout='inline']")
    expect(nowPlayingCss).toContain('white-space: nowrap')
  })

  it('splits the label onto its own row when inline no longer fits', () => {
    expect(nowPlayingCss).toContain(".now-playing[data-layout='split'] > .now-playing-label")
    expect(nowPlayingCss).toContain('display: block')
  })

  it('keeps label and title together with artist on the next row for prefix-split', () => {
    expect(nowPlayingCss).toContain(".now-playing[data-layout='prefix-split']")
    expect(nowPlayingCss).toContain(".now-playing[data-layout='prefix-split'] > .now-playing-title")
    expect(nowPlayingCss).toContain(
      ".now-playing[data-layout='prefix-split'] > .now-playing-artist-line",
    )
  })

  it('mirrors prefix-split row typography in the hidden prefix-row measure', () => {
    expect(nowPlayingCss).toContain('.now-playing-prefix-row-measure .now-playing-measure-label')
    expect(nowPlayingCss).toContain('.now-playing-prefix-row-measure .now-playing-slot')
  })

  it('forces stacked title and artist onto separate rows', () => {
    expect(nowPlayingCss).toContain(".now-playing[data-layout='stacked'] > .now-playing-track")
    expect(nowPlayingCss).toContain('flex-direction: column')
    expect(nowPlayingCss).toContain(
      ".now-playing[data-layout='stacked'] > .now-playing-artist-line",
    )
  })
})
