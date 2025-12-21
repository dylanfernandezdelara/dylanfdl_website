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
        display: 'inline',
        verticalAlign: 'baseline',
        lineHeight: 'inherit',
        whiteSpace: 'nowrap'
      }}
    >
      {children}
      <ArrowUpRight size={8} style={{ verticalAlign: 'baseline', display: 'inline-block', marginLeft: '0.125rem', marginBottom: '-0.125rem' }} />
    </a>
  )
}
