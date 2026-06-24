import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { NOW_PLAYING_SLOT_CLASS } from '@/lib/nowPlaying/trackLayout'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('nowPlayingPresentation', () => {
  it('keeps slot class names aligned with slot-text CSS', () => {
    const nowPlayingCss = readFileSync(join(repoRoot, 'src/styles/now-playing-text.css'), 'utf8')
    const sharedCss = readFileSync(join(repoRoot, 'src/styles/slot-text-cell-clip.css'), 'utf8')

    expect(NOW_PLAYING_SLOT_CLASS).toContain('now-playing-slot')
    expect(nowPlayingCss).toContain('.now-playing-slot')

    expect(NOW_PLAYING_SLOT_CLASS).toContain('slot-text-cell-clip')
    expect(sharedCss).toContain('.slot-text-cell-clip')
  })

  it('documents the italic cell height token used for Safari headroom', () => {
    const sharedCss = readFileSync(join(repoRoot, 'src/styles/slot-text-cell-clip.css'), 'utf8')
    expect(sharedCss).toContain('--slot-text-cell-line-height-italic: 1.45em')
    expect(NOW_PLAYING_SLOT_CLASS).toContain('italic')
  })
})
