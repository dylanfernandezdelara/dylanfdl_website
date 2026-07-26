import CardGridCard from '@/components/card-grid/CardGridCard'
import { itemKey, type GridRow } from '@/components/card-grid/model'

type Props = {
  rows: GridRow[]
  columnOffset?: number
  mediaEnabled: boolean
  showDesktop?: boolean
  showMobile?: boolean
}

export default function CardGridColumns({
  rows,
  columnOffset = 0,
  mediaEnabled,
  showDesktop = true,
  showMobile = true,
}: Props) {
  return (
    <>
      {showMobile ? (
        <div className="flex flex-col gap-3 md:gap-4 min-[640px]:hidden">
          {rows.map((row) => (
            <CardGridCard
              key={itemKey(row.item)}
              row={row}
              mediaEnabled={mediaEnabled}
            />
          ))}
        </div>
      ) : null}

      {showDesktop ? (
        <div className="hidden min-[640px]:grid min-[640px]:grid-cols-2 min-[640px]:gap-3 md:gap-4">
          <div className="flex min-w-0 flex-col gap-3 md:gap-4">
            {rows.map((row, index) =>
              (columnOffset + index) % 2 === 0 ? (
                <CardGridCard
                  key={itemKey(row.item)}
                  row={row}
                  mediaEnabled={mediaEnabled}
                />
              ) : null,
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-3 md:gap-4">
            {rows.map((row, index) =>
              (columnOffset + index) % 2 === 1 ? (
                <CardGridCard
                  key={itemKey(row.item)}
                  row={row}
                  mediaEnabled={mediaEnabled}
                />
              ) : null,
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
