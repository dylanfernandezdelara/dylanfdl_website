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
  it('wires prefix-split spacing and wrapping in the component markup', () => {
    expect(componentSource).toContain("const isPrefixSplit = layout === 'prefix-split'")
    expect(componentSource).toContain('{isInline || isPrefixSplit ? \' \' : null}')
    expect(componentSource).toContain(
      'allowWrap={!isInline && !isSplit && !isPrefixSplit}',
    )
  })

  it('renders a hidden prefix-row measure that mirrors row-one typography', () => {
    expect(componentSource).toContain('ref={prefixRowMeasureRef}')
    expect(componentSource).toContain('now-playing-prefix-row-measure')
    expect(componentSource).toContain('<span className="now-playing-label" />')
    expect(componentSource).toContain(`<span className={NOW_PLAYING_SLOT_CLASS} />`)
  })

  it('exposes layout through data-layout on the root element', () => {
    expect(componentSource).toContain('data-layout={layout}')
  })
})
