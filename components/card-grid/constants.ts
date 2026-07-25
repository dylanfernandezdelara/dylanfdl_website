import type { CardGridFilter } from '@/lib/buildCardGridItems'

export const TAB_OPTIONS: { id: CardGridFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'projects', label: 'Projects' },
  { id: 'notes', label: 'Notes' },
  { id: 'music', label: 'Music' },
]

export const smoothEase = 'cubic-bezier(0.4, 0, 0.2, 1)'
export const cardStaggerMs = 64
export const cardAnimMs = 520
export const cardExitAnimMs = 300
export const cardExitStaggerMs = 24
