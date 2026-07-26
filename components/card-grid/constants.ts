import type { CardGridFilter } from '@/lib/buildCardGridItems'

export const TAB_OPTIONS: { id: CardGridFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'projects', label: 'Projects' },
  { id: 'notes', label: 'Notes' },
  { id: 'music', label: 'Music' },
]

/** Smooth ease-out: settles quickly without the material “ease-in” hitch at the start. */
export const smoothEase = 'cubic-bezier(0.16, 1, 0.3, 1)'
export const cardStaggerMs = 56
export const cardAnimMs = 580
export const cardExitAnimMs = 280
export const cardExitStaggerMs = 24
/** Cap initial stagger so long grids finish as one composition. */
export const cardInitialStaggerCap = 12

export const cardGridDesktopQuery = '(min-width: 640px)'

export function cardEnterBatchMs(rowCount: number): number {
  const lastIndex = Math.max(rowCount - 1, 0)
  return Math.min(lastIndex, cardInitialStaggerCap) * cardStaggerMs + cardAnimMs
}
