import type { ReactNode } from 'react'

type MaybeLayoutGridHostProps = {
  children: ReactNode
}

/**
 * Production renders children only. The `NODE_ENV` check is inlined so the
 * testing host is not pulled into the production client graph.
 */
export default async function MaybeLayoutGridHost({
  children,
}: MaybeLayoutGridHostProps) {
  if (process.env.NODE_ENV === 'production') {
    return children
  }

  const { default: LayoutGridHost } = await import('./LayoutGridHost')
  return <LayoutGridHost>{children}</LayoutGridHost>
}
