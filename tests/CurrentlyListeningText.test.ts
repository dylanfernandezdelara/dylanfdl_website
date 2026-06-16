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
})
