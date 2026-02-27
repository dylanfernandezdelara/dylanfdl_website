import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  allowWrap = false
}: ExternalLinkProps) {
  const classes = cn(
    'inline align-baseline leading-[inherit] text-fg1',
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
    >
      {children}
      <span className="whitespace-nowrap">
        {'\u00A0'}
        <ArrowUpRight
          size={8}
          className="mb-[-0.125rem] ml-0.5 inline-block align-baseline"
        />
      </span>
    </a>
  )
}
