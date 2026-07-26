'use client'

import type { ReactNode } from 'react'

import CardGridColumns from '@/components/card-grid/CardGridColumns'
import CardGridTabs from '@/components/card-grid/CardGridTabs'
import {
  cardGridBreakpointVisibility,
  cardGridDesktopQuery,
} from '@/components/card-grid/constants'
import useCardGridRows from '@/components/card-grid/useCardGridRows'
import useMediaQuery from '@/hooks/useMediaQuery'
import type { CardGridSerializableItem } from '@/lib/buildCardGridItems'

type Props = {
  items: CardGridSerializableItem[]
  children?: ReactNode
}

export default function CardGridClient({ items, children }: Props) {
  const { activeRows, exitRows, filter, layoutLocked, mediaEnabled, selectFilter } =
    useCardGridRows(items)
  const isDesktop = useMediaQuery(cardGridDesktopQuery)
  const { showMobile, showDesktop } = cardGridBreakpointVisibility(isDesktop, layoutLocked)

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
          <CardGridColumns
            rows={activeRows}
            mediaEnabled={mediaEnabled}
            showDesktop={showDesktop}
            showMobile={showMobile}
          />
        </div>
        {children != null ? <div className="relative z-20">{children}</div> : null}
        {exitRows.length > 0 ? (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-10"
            >
              <CardGridColumns
                rows={exitRows}
                mediaEnabled={mediaEnabled}
                showDesktop={false}
                showMobile={showMobile}
              />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-10"
            >
              <CardGridColumns
                rows={exitRows}
                columnOffset={activeRows.length}
                mediaEnabled={mediaEnabled}
                showDesktop={showDesktop}
                showMobile={false}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
