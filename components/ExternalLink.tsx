import { ArrowUpRight } from 'lucide-react'

interface ExternalLinkProps {
  href: string
  children: React.ReactNode
}

export default function ExternalLink({ href, children }: ExternalLinkProps) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      style={{ 
        color: 'var(--fg1)',
        textDecoration: 'underline',
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
