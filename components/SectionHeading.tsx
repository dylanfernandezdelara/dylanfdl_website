interface SectionHeadingProps {
  children: React.ReactNode
  marginTop?: string
}

export default function SectionHeading({ children, marginTop = '3rem' }: SectionHeadingProps) {
  return (
    <h2 style={{
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
