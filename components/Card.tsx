import Link from 'next/link'
import * as stylex from '@stylexjs/stylex'

import CardVideo from '@/components/CardVideo'

const styles = stylex.create({
  card: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--bg3)',
    backgroundColor: 'var(--bg1)',
    textDecorationLine: 'none',
    color: 'inherit',
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '0.75rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '0.875rem',
    paddingBottom: '0.875rem',
  },
  title: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.375,
    color: 'var(--fg0)',
  },
  date: {
    flexShrink: 0,
    fontSize: '0.75rem',
    lineHeight: '1rem',
    fontWeight: 400,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--fg1)',
  },
  media: {
    position: 'relative',
    aspectRatio: '16 / 9',
    width: '100%',
    flexShrink: 0,
    overflow: 'hidden',
    backgroundColor: 'var(--bg2)',
  },
  mediaFill: {
    position: 'absolute',
    inset: 0,
    height: '100%',
    width: '100%',
    objectFit: 'cover',
  },
})

export type CardProps = {
  title: string
  dateLabel: string
  href: string
  external?: boolean
  videoSrc?: string
  posterSrc?: string
}

export default function Card({
  title,
  dateLabel,
  href,
  external = false,
  videoSrc,
  posterSrc,
}: CardProps) {
  const mediaSx = stylex.props(styles.mediaFill)
  const media = videoSrc ? (
    <CardVideo src={videoSrc} poster={posterSrc} className={mediaSx.className} />
  ) : posterSrc ? (
    <img src={posterSrc} alt="" decoding="async" {...mediaSx} />
  ) : null

  const inner = (
    <>
      <div {...stylex.props(styles.header)}>
        <span {...stylex.props(styles.title)}>{title}</span>
        <span {...stylex.props(styles.date)}>{dateLabel}</span>
      </div>
      {media ? <div {...stylex.props(styles.media)}>{media}</div> : null}
    </>
  )

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...stylex.props(styles.card)}>
        {inner}
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    )
  }

  return (
    <Link href={href} prefetch {...stylex.props(styles.card)}>
      {inner}
    </Link>
  )
}
