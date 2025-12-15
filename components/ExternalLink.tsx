import { ArrowUpRight } from 'lucide-react'

interface ExternalLinkProps {
  href: string
  children: React.ReactNode
  noUnderline?: boolean
  thinGreyUnderline?: boolean
  className?: string
}

export default function ExternalLink({
  href,
  children,
  noUnderline = false,
  thinGreyUnderline = false,
  className
}: ExternalLinkProps) {
  const classes = ['external-link', className].filter(Boolean).join(' ')

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className={classes}
      style={{ 
        textDecoration: noUnderline ? 'none' : thinGreyUnderline ? 'underline' : 'underline',
        textDecorationColor: thinGreyUnderline ? 'color-mix(in oklab, var(--gray), transparent 50%)' : undefined,
        textDecorationThickness: thinGreyUnderline ? '1px' : undefined,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.125rem'
      }}
    >
      {children}
      <ArrowUpRight size={10} style={{ flexShrink: 0 }} />
    </a>
  )
}
