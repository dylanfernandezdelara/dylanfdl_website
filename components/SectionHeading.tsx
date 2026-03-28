import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  children: React.ReactNode
  id?: string
  marginTop?: string
  fontSize?: string
  className?: string
  style?: React.CSSProperties
}

export default function SectionHeading({
  children,
  id,
  marginTop,
  fontSize,
  className,
  style,
}: SectionHeadingProps) {
  const cssVarOverrides: React.CSSProperties = {
    ...(marginTop ? { ['--section-heading-margin-top' as any]: marginTop } : {}),
    ...(fontSize ? { ['--section-heading-font-size' as any]: fontSize } : {}),
  }

  return (
    <h2
      id={id}
      className={cn(
        'mb-[var(--section-heading-margin-bottom,1rem)] mt-[var(--section-heading-margin-top,3rem)] font-medium text-fg0',
        className
      )}
      style={{
        fontSize: 'var(--section-heading-font-size,1.75rem)',
        ...cssVarOverrides,
        ...style,
      }}
    >
      {children}
    </h2>
  )
}
