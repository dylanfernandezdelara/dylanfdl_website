import { describe, expect, it } from 'vitest'

import { itemMatchesFilter, visibleTabOptions } from '@/components/card-grid/model'
import { buildCardGridItems, type CardGridSerializableItem } from '@/lib/buildCardGridItems'

function musicCard(href: string, title: string): CardGridSerializableItem {
  return {
    kind: 'artifact',
    category: 'music',
    sortDate: '2023-01-01',
    title,
    dateLabel: 'Jan 2023',
    href,
    videoSrc: '/artifacts/demo.mp4',
    posterSrc: '/artifacts/demo.webp',
  }
}

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

  it('hides category tabs that currently have no cards', () => {
    expect(visibleTabOptions([musicCard('/music/a', 'A')]).map((tab) => tab.id)).toEqual([
      'all',
      'music',
    ])
  })
})
