import * as stylex from '@stylexjs/stylex'

import { linkStyles } from '@/lib/linkStyles'
import { withClassName } from '@/lib/sx'

interface ExternalLinkProps {
  href: string
  children: React.ReactNode
  noUnderline?: boolean
  thinGreyUnderline?: boolean
  className?: string
  allowWrap?: boolean
}

const styles = stylex.create({
  base: {
    display: 'inline',
    lineHeight: 'inherit',
  },
  wrap: {
    whiteSpace: 'normal',
  },
  nowrap: {
    whiteSpace: 'nowrap',
  },
  plain: {
    color: 'var(--fg1)',
    textDecorationLine: 'none',
  },
  thinGrey: {
    textDecorationColor: 'var(--gray)',
    textDecorationThickness: '1px',
  },
})

export default function ExternalLink({
  href,
  children,
  noUnderline = false,
  thinGreyUnderline = false,
  className,
  allowWrap = false,
}: ExternalLinkProps) {
  const sx = withClassName(
    className,
    stylex.props(
      styles.base,
      allowWrap ? styles.wrap : styles.nowrap,
      noUnderline ? styles.plain : linkStyles.inline,
      thinGreyUnderline ? styles.thinGrey : null,
    ),
  )

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...sx}>
      {children}
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  )
}
