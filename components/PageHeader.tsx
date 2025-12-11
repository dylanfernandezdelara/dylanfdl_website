interface PageHeaderProps {
  title: string
}

export default function PageHeader({ title }: PageHeaderProps) {
  return (
    <h1 style={{
      fontSize: '2rem',
      fontWeight: '500',
      marginBottom: '1rem',
      color: 'var(--fg0)'
    }}>
      {title}
    </h1>
  )
}
