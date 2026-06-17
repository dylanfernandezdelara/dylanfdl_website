import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const componentSource = readFileSync(
  join(repoRoot, 'components/CurrentlyListeningText.tsx'),
  'utf8',
)

describe('CurrentlyListeningText presentation contract', () => {
  it('exposes layout through data-layout on the root element', () => {
    expect(componentSource).toContain('data-layout={layout}')
  })

  it('uses dedicated measure refs that do not share visible layout class names', () => {
    expect(componentSource).toContain('prefixRowRootRef')
    expect(componentSource).toContain('prefixLabelMeasureRef')
    expect(componentSource).toContain('prefixTitleMeasureRef')
    expect(componentSource).toContain('now-playing-measure-label')
  })

  it('glues the trailing period into the artist slot text via the hook', () => {
    expect(componentSource).toContain('artistSlotDisplayText')
    expect(componentSource).not.toContain('formatArtistWithTrailingPeriod')
    expect(componentSource).not.toContain('now-playing-by')
  })

  it('no longer renders a bare period text node as a sibling after the artist slot', () => {
    // The old markup placed a lone "." between the slot close tag and the
    // artist-line close tag; at narrow widths that period could wrap onto its
    // own line. The period now lives inside the slot, so this pattern must not
    // reappear.
    expect(componentSource).not.toMatch(/<\/span>\s*\.\s*<\/span>/)
  })
})
