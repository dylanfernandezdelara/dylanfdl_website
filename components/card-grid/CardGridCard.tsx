import Card from '@/components/Card'
import EditorThumbnail from '@/components/EditorThumbnail'
import { cardAnimMs, cardExitAnimMs, smoothEase } from '@/components/card-grid/constants'
import { itemKey, type GridRow } from '@/components/card-grid/model'
import { cn } from '@/lib/utils'

type Props = {
  row: GridRow
}

function thumbnailFor(row: GridRow) {
  return row.item.kind === 'writing' && row.item.thumbnail === 'editor' ? (
    <EditorThumbnail />
  ) : undefined
}

export default function CardGridCard({ row }: Props) {
  const href = itemKey(row.item)
  const enterDelay = row.enterDelayMs ?? 0
  const exitDelay = row.exitDelayMs ?? 0
  const isAnimating = row.phase !== 'stay'

  const wrapperClass = cn(
    row.phase === 'enter' &&
      'animate-in fade-in slide-in-from-bottom-1 fill-mode-both motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none',
    row.phase === 'exit' &&
      'animate-out fade-out fill-mode-forwards motion-reduce:animate-none motion-reduce:opacity-0 motion-reduce:transform-none',
    row.phase === 'stay' && 'opacity-100',
    isAnimating && 'will-change-[transform,opacity] [backface-visibility:hidden] [transform:translateZ(0)]',
  )

  const animationStyle =
    row.phase === 'enter'
      ? {
          animationDelay: `${enterDelay}ms`,
          animationDuration: `${cardAnimMs}ms`,
          animationTimingFunction: smoothEase,
        }
      : row.phase === 'exit'
        ? {
            animationDelay: `${exitDelay}ms`,
            animationDuration: `${cardExitAnimMs}ms`,
            animationTimingFunction: smoothEase,
          }
        : undefined

  return (
    <div
      key={href}
      className={wrapperClass}
      style={animationStyle}
      aria-hidden={row.phase === 'exit'}
    >
      <div className={row.phase === 'exit' ? 'pointer-events-none' : undefined}>
        <Card
          title={row.item.title}
          dateLabel={row.item.dateLabel}
          href={row.item.href}
          external={row.item.kind === 'artifact'}
          videoSrc={row.item.videoSrc}
          posterSrc={row.item.posterSrc}
          thumbnail={thumbnailFor(row)}
        />
      </div>
    </div>
  )
}
