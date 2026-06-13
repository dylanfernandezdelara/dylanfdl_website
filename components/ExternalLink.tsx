import { cn } from '@/lib/utils'

interface ExternalLinkProps {
  href: string
  children: React.ReactNode
  noUnderline?: boolean
  thinGreyUnderline?: boolean
  className?: string
  allowWrap?: boolean
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}

export default function ExternalLink({
  href,
  children,
  noUnderline = false,
  thinGreyUnderline = false,
  className,
  allowWrap = false,
  onClick,
}: ExternalLinkProps) {
  const classes = cn(
    'inline leading-[inherit] text-fg1',
    allowWrap ? 'whitespace-normal' : 'whitespace-nowrap',
    noUnderline ? 'no-underline' : 'underline',
    thinGreyUnderline && 'decoration-gray decoration-[1px]',
    className
  )

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
      onClick={onClick}
    >
      {children}
    </a>
  )
}
