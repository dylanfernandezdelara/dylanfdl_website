'use client'

import type { ReactNode } from 'react'

import CardGridColumns from '@/components/card-grid/CardGridColumns'
import CardGridTabs from '@/components/card-grid/CardGridTabs'
import useCardGridRows from '@/components/card-grid/useCardGridRows'
import type { CardGridSerializableItem } from '@/lib/buildCardGridItems'

type Props = {
  items: CardGridSerializableItem[]
  children?: ReactNode
}

export default function CardGridClient({ items, children }: Props) {
  const { activeRows, exitRows, filter, selectFilter } = useCardGridRows(items)

  return (
    <div className="mt-8">
      <CardGridTabs filter={filter} onSelect={selectFilter} />

      <div
        className="relative"
        role="tabpanel"
        id="tabpanel-work"
        aria-labelledby={`tab-${filter}`}
      >
        <div className="relative z-20">
          <CardGridColumns rows={activeRows} />
        </div>
        {children != null ? <div className="relative z-20">{children}</div> : null}
        {exitRows.length > 0 ? (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-10"
            >
              <CardGridColumns rows={exitRows} showDesktop={false} />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-10"
            >
              <CardGridColumns
                rows={exitRows}
                columnOffset={activeRows.length}
                showMobile={false}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
