interface SectionHeadingProps {
  children: React.ReactNode
  marginTop?: string
  className?: string
}

export default function SectionHeading({ children, marginTop = '3rem', className }: SectionHeadingProps) {
  return (
    <h2 className={className} style={{
      fontSize: '1.75rem',
      fontWeight: '500',
      marginTop,
      marginBottom: '1rem',
      color: 'var(--fg0)'
    }}>
      {children}
    </h2>
  )
}
