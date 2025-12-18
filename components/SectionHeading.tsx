interface SectionHeadingProps {
  children: React.ReactNode
  marginTop?: string
  fontSize?: string
  className?: string
  style?: React.CSSProperties
}

export default function SectionHeading({ children, marginTop, fontSize, className, style }: SectionHeadingProps) {
  const cssVarOverrides: React.CSSProperties = {
    ...(marginTop ? { ['--section-heading-margin-top' as any]: marginTop } : {}),
    ...(fontSize ? { ['--section-heading-font-size' as any]: fontSize } : {}),
  }

  return (
    <h2 className={className} style={{
      // Use CSS variables so page-level CSS can control sizing/spacing without `!important`
      // and without fighting inline styles.
      fontSize: 'var(--section-heading-font-size, 1.75rem)',
      fontWeight: '500',
      marginTop: 'var(--section-heading-margin-top, 3rem)',
      marginBottom: 'var(--section-heading-margin-bottom, 1rem)',
      color: 'var(--fg0)',
      ...cssVarOverrides,
      ...style
    }}>
      {children}
    </h2>
  )
}
