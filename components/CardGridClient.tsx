'use client'

import type { ReactNode } from 'react'
import * as stylex from '@stylexjs/stylex'

import CardGridColumns from '@/components/card-grid/CardGridColumns'
import CardGridTabs from '@/components/card-grid/CardGridTabs'
import useCardGridRows from '@/components/card-grid/useCardGridRows'
import type { CardGridSerializableItem } from '@/lib/buildCardGridItems'

const styles = stylex.create({
  root: {
    marginTop: '2rem',
  },
  panel: {
    position: 'relative',
  },
  layer: {
    position: 'relative',
    zIndex: 20,
  },
  exitLayer: {
    pointerEvents: 'none',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
  },
})

type Props = {
  items: CardGridSerializableItem[]
  children?: ReactNode
}

export default function CardGridClient({ items, children }: Props) {
  const { activeRows, exitRows, filter, selectFilter } = useCardGridRows(items)

  return (
    <div {...stylex.props(styles.root)}>
      <CardGridTabs filter={filter} onSelect={selectFilter} />

      <div
        {...stylex.props(styles.panel)}
        role="tabpanel"
        id="tabpanel-work"
        aria-labelledby={`tab-${filter}`}
      >
        <div {...stylex.props(styles.layer)}>
          <CardGridColumns rows={activeRows} />
        </div>
        {children != null ? <div {...stylex.props(styles.layer)}>{children}</div> : null}
        {exitRows.length > 0 ? (
          <>
            <div aria-hidden {...stylex.props(styles.exitLayer)}>
              <CardGridColumns rows={exitRows} showDesktop={false} />
            </div>
            <div aria-hidden {...stylex.props(styles.exitLayer)}>
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
