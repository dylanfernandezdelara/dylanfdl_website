import { Grid3x3 } from 'lucide-react'

import { LAYOUT_GRID_HOTKEY } from '@/lib/layoutGrid'
import { cn } from '@/lib/utils'

const ICON_SIZE_CLASSES = 'h-4 w-4 shrink-0'

type LayoutGridToggleProps = {
  enabled: boolean
  ready: boolean
  onToggle: () => void
}

export default function LayoutGridToggle({
  enabled,
  ready,
  onToggle,
}: LayoutGridToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-sm border border-bg3 bg-bg0 p-1.5 shadow-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2',
        enabled ? 'text-fg0' : 'text-fg2 hover:text-fg1',
      )}
      aria-label={
        !ready ? 'Toggle layout grid' : enabled ? 'Hide layout grid' : 'Show layout grid'
      }
      aria-pressed={ready ? enabled : undefined}
      aria-keyshortcuts={LAYOUT_GRID_HOTKEY}
    >
      <Grid3x3 className={ICON_SIZE_CLASSES} strokeWidth={2} aria-hidden />
    </button>
  )
}
