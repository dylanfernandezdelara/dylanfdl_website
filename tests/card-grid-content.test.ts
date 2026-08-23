import { describe, expect, it } from 'vitest'

import { itemMatchesFilter } from '@/components/card-grid/model'
import { buildCardGridItems, partitionCardGridItems } from '@/lib/buildCardGridItems'

describe('buildCardGridItems writing migration', () => {
  it('maps published notes to /notes hrefs and notes category', () => {
    const items = buildCardGridItems()
    const onWriting = items.find(
      (item) => item.kind === 'writing' && item.slug === 'purpose-of-writing'
    )

    expect(onWriting).toMatchObject({
      kind: 'writing',
      category: 'notes',
      href: '/notes/purpose-of-writing',
      title: 'On Writing',
      thumbnail: 'editor',
    })
  })

  it('excludes draft showcase from homepage cards', () => {
    const items = buildCardGridItems()
    expect(
      items.some(
        (item) =>
          item.kind === 'writing' &&
          (item.slug === 'component-showcase' || item.href.includes('component-showcase'))
      )
    ).toBe(false)
  })

  it('filters notes, projects, and music tabs correctly', () => {
    const items = buildCardGridItems()
    const notes = items.filter((item) => itemMatchesFilter(item, 'notes'))
    const projects = items.filter((item) => itemMatchesFilter(item, 'projects'))
    const music = items.filter((item) => itemMatchesFilter(item, 'music'))

    expect(notes.every((item) => item.category === 'notes')).toBe(true)
    expect(projects.every((item) => item.category === 'projects')).toBe(true)
    expect(music.every((item) => item.category === 'music')).toBe(true)
    expect(notes.some((item) => item.kind === 'writing' && item.slug === 'purpose-of-writing')).toBe(
      true
    )
    expect(music.length).toBeGreaterThan(0)
  })

  it('partitions homepage items by category', () => {
    const items = buildCardGridItems()
    const partitioned = partitionCardGridItems(items)

    expect(partitioned.notes.some((item) => item.kind === 'writing' && item.slug === 'purpose-of-writing')).toBe(
      true,
    )
    expect(partitioned.music.every((item) => item.category === 'music')).toBe(true)
    expect(partitioned.projects.every((item) => item.category === 'projects')).toBe(true)
  })
})
