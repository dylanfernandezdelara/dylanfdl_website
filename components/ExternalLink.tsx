import { ArrowUpRight } from 'lucide-react'

interface ExternalLinkProps {
  href: string
  children: React.ReactNode
  noUnderline?: boolean
  thinGreyUnderline?: boolean
}

export default function ExternalLink({ href, children, noUnderline = false, thinGreyUnderline = false }: ExternalLinkProps) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      style={{ 
        color: 'var(--fg1)',
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
