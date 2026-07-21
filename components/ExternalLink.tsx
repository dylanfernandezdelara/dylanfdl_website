import { cn } from '@/lib/utils'
import { INLINE_LINK_STYLES } from '@/lib/linkStyles'

interface ExternalLinkProps {
  href: string
  children: React.ReactNode
  noUnderline?: boolean
  thinGreyUnderline?: boolean
  className?: string
  allowWrap?: boolean
}

export default function ExternalLink({
  href,
  children,
  noUnderline = false,
  thinGreyUnderline = false,
  className,
  allowWrap = false,
}: ExternalLinkProps) {
  const classes = cn(
    'inline leading-[inherit]',
    allowWrap ? 'whitespace-normal' : 'whitespace-nowrap',
    noUnderline ? 'text-fg1 no-underline' : INLINE_LINK_STYLES,
    thinGreyUnderline && 'decoration-gray decoration-[1px]',
    className
  )

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
    >
      {children}
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  )
}
