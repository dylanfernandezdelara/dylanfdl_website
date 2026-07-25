'use client'

import { useRef, type ReactNode } from 'react'

import CardGridColumns from '@/components/card-grid/CardGridColumns'
import CardGridTabs from '@/components/card-grid/CardGridTabs'
import useCardGridRows from '@/components/card-grid/useCardGridRows'
import type { CardGridSerializableItem } from '@/lib/buildCardGridItems'

type Props = {
  items: CardGridSerializableItem[]
  children?: ReactNode
}

export default function CardGridClient({ items, children }: Props) {
  const { activeRows, exitRows, filter, markRowEntered, selectFilter } = useCardGridRows(items)
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([])

  return (
    <div className="mt-8">
      <CardGridTabs filter={filter} tabButtonRefs={tabButtonRefs} onSelect={selectFilter} />

      <div
        className="relative"
        role="tabpanel"
        id="tabpanel-work"
        aria-labelledby={`tab-${filter}`}
      >
        <div className="relative z-20">
          <CardGridColumns rows={activeRows} onRowEntered={markRowEntered} />
        </div>
        {children != null ? <div className="relative z-20">{children}</div> : null}
        {exitRows.length > 0 ? (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-10"
            >
              <CardGridColumns rows={exitRows} onRowEntered={markRowEntered} showDesktop={false} />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-10"
            >
              <CardGridColumns
                rows={exitRows}
                columnOffset={activeRows.length}
                onRowEntered={markRowEntered}
                showMobile={false}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
