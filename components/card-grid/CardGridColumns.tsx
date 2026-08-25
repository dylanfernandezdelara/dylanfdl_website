import * as stylex from '@stylexjs/stylex'

import CardGridCard from '@/components/card-grid/CardGridCard'
import { itemKey, type GridRow } from '@/components/card-grid/model'

const styles = stylex.create({
  mobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    '@media (min-width: 640px)': {
      display: 'none',
    },
  },
  desktop: {
    display: 'none',
    '@media (min-width: 640px) and (max-width: 767px)': {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '0.75rem',
    },
    '@media (min-width: 768px)': {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '1rem',
    },
  },
  column: {
    display: 'flex',
    minWidth: 0,
    flexDirection: 'column',
    gap: '0.75rem',
    '@media (min-width: 768px)': {
      gap: '1rem',
    },
  },
})

type Props = {
  rows: GridRow[]
  columnOffset?: number
  showDesktop?: boolean
  showMobile?: boolean
}

export default function CardGridColumns({
  rows,
  columnOffset = 0,
  showDesktop = true,
  showMobile = true,
}: Props) {
  return (
    <>
      {showMobile ? (
        <div {...stylex.props(styles.mobile)}>
          {rows.map((row) => (
            <CardGridCard key={itemKey(row.item)} row={row} />
          ))}
        </div>
      ) : null}

      {showDesktop ? (
        <div {...stylex.props(styles.desktop)}>
          <div {...stylex.props(styles.column)}>
            {rows.map((row, index) =>
              (columnOffset + index) % 2 === 0 ? (
                <CardGridCard key={itemKey(row.item)} row={row} />
              ) : null,
            )}
          </div>
          <div {...stylex.props(styles.column)}>
            {rows.map((row, index) =>
              (columnOffset + index) % 2 === 1 ? (
                <CardGridCard key={itemKey(row.item)} row={row} />
              ) : null,
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
