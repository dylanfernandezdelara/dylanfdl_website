import { describe, expect, it } from 'vitest'

import { itemMatchesFilter } from '@/components/card-grid/model'
import { buildCardGridItems } from '@/lib/buildCardGridItems'

describe('buildCardGridItems', () => {
  it('omits the retired On Writing note and draft showcase', () => {
    const items = buildCardGridItems()

    expect(items.some((item) => item.href.includes('purpose-of-writing'))).toBe(false)
    expect(items.some((item) => item.href.includes('component-showcase'))).toBe(false)
  })

  it('filters notes, projects, and music tabs correctly', () => {
    const items = buildCardGridItems()
    const notes = items.filter((item) => itemMatchesFilter(item, 'notes'))
    const projects = items.filter((item) => itemMatchesFilter(item, 'projects'))
    const music = items.filter((item) => itemMatchesFilter(item, 'music'))

    expect(notes.every((item) => item.category === 'notes')).toBe(true)
    expect(projects.every((item) => item.category === 'projects')).toBe(true)
    expect(music.every((item) => item.category === 'music')).toBe(true)
    expect(music.length).toBeGreaterThan(0)
  })
})
