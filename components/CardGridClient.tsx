'use client'

import type { ReactNode } from 'react'

import CardGridColumns from '@/components/card-grid/CardGridColumns'
import CardGridTabs from '@/components/card-grid/CardGridTabs'
import { cardGridDesktopQuery } from '@/components/card-grid/constants'
import useCardGridRows from '@/components/card-grid/useCardGridRows'
import useMediaQuery from '@/hooks/useMediaQuery'
import type { CardGridSerializableItem } from '@/lib/buildCardGridItems'

type Props = {
  items: CardGridSerializableItem[]
  children?: ReactNode
}

export default function CardGridClient({ items, children }: Props) {
  const { activeRows, exitRows, filter, mediaEnabled, selectFilter } = useCardGridRows(items)
  const isDesktop = useMediaQuery(cardGridDesktopQuery)
  // Until the breakpoint is known, SSR both trees so markup matches CSS. After
  // the layout read, mount only the active tree to avoid duplicate video
  // observers and EditorThumbnail rAF loops on mobile.
  const showMobile = isDesktop !== true
  const showDesktop = isDesktop !== false

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
