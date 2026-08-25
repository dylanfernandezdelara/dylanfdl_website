import * as stylex from '@stylexjs/stylex'

import Card from '@/components/Card'
import { cardAnimMs, cardExitAnimMs, smoothEase } from '@/components/card-grid/constants'
import { itemKey, type GridRow } from '@/components/card-grid/model'

const enter = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(0, 0.25rem, 0)',
  },
})

const exit = stylex.keyframes({
  to: {
    opacity: 0,
  },
})

const styles = stylex.create({
  stay: {
    opacity: 1,
  },
  enter: {
    animationName: enter,
    animationFillMode: 'both',
    '@media (prefers-reduced-motion: reduce)': {
      animationName: 'none',
      opacity: 1,
      transform: 'none',
    },
  },
  exit: {
    animationName: exit,
    animationFillMode: 'forwards',
    '@media (prefers-reduced-motion: reduce)': {
      animationName: 'none',
      opacity: 0,
      transform: 'none',
    },
  },
  animating: {
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
  },
  inert: {
    pointerEvents: 'none',
  },
})

type Props = {
  row: GridRow
}

export default function CardGridCard({ row }: Props) {
  const href = itemKey(row.item)
  const enterDelay = row.enterDelayMs ?? 0
  const exitDelay = row.exitDelayMs ?? 0
  const isAnimating = row.phase !== 'stay'

  const sx = stylex.props(
    row.phase === 'enter' ? styles.enter : null,
    row.phase === 'exit' ? styles.exit : null,
    row.phase === 'stay' ? styles.stay : null,
    isAnimating ? styles.animating : null,
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
      className={sx.className}
      style={{ ...sx.style, ...animationStyle }}
      aria-hidden={row.phase === 'exit'}
    >
      <div {...(row.phase === 'exit' ? stylex.props(styles.inert) : {})}>
        <Card
          title={row.item.title}
          dateLabel={row.item.dateLabel}
          href={row.item.href}
          external={row.item.kind === 'artifact'}
          videoSrc={row.item.videoSrc}
          posterSrc={row.item.posterSrc}
        />
      </div>
    </div>
  )
}
