/**
 * @vitest-environment happy-dom
 */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import CardGridCard from '@/components/card-grid/CardGridCard'
import type { GridRow } from '@/components/card-grid/model'
import type { CardGridSerializableItem } from '@/lib/buildCardGridItems'

function row(item: CardGridSerializableItem): GridRow {
  return { item, phase: 'stay' }
}

const music: CardGridSerializableItem = {
  kind: 'artifact',
  category: 'music',
  sortDate: '2023-04-01',
  title: 'Stravinsky: Le Sacre du Printemps',
  dateLabel: 'Apr 2023',
  href: 'https://youtu.be/example',
  videoSrc: '/artifacts/yale-dance-lab.mp4',
  posterSrc: '/artifacts/yale-dance-lab-poster.webp',
}

const project: CardGridSerializableItem = {
  kind: 'writing',
  category: 'projects',
  sortDate: '2025-01-01',
  slug: 'example',
  title: 'Example project',
  dateLabel: 'Jan 2025',
  href: '/projects/example',
}

describe('CardGridCard dates', () => {
  afterEach(() => {
    cleanup()
  })

  it('shows only the title on music cards', () => {
    render(<CardGridCard row={row(music)} />)

    const link = screen.getByRole('link', { name: /Stravinsky: Le Sacre du Printemps/ })
    expect(link.textContent).toContain('Stravinsky: Le Sacre du Printemps')
    expect(link.textContent).not.toContain('Apr 2023')
  })

  it('keeps the date on writing cards', () => {
    render(<CardGridCard row={row(project)} />)

    const link = screen.getByRole('link', { name: /Example project/ })
    expect(link.textContent).toContain('Jan 2025')
  })
})
