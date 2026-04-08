import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type Props = {
  className?: string
  children: ReactNode
}

/**
 * Layout-only wrapper (no filter-driven opacity — that desynced from grid reflow and read as a footer “jump”).
 */
export default function SmoothFooterSection({ className, children }: Props) {
  return <div className={cn(className)}>{children}</div>
}
