'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'

import CardGridClient from '@/components/CardGridClient'
import SmoothFooterSection from '@/components/SmoothFooterSection'
import type { CardGridSerializableItem } from '@/lib/buildCardGridItems'
import { cn } from '@/lib/utils'

type Props = {
  items: CardGridSerializableItem[]
  children: ReactNode
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return reduced
}

export default function AboutCardGridWithFooter({ items, children }: Props) {
  const reducedMotion = usePrefersReducedMotion()
  const [footerOpaque, setFooterOpaque] = useState(true)

  const onExitBatchPrune = useCallback(() => {
    if (reducedMotion) {
      return
    }
    setFooterOpaque(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setFooterOpaque(true))
    })
  }, [reducedMotion])

  return (
    <>
      <CardGridClient items={items} onExitBatchPrune={onExitBatchPrune} />
      <SmoothFooterSection
        className={cn(
          'max-w-reading',
          footerOpaque
            ? 'opacity-100 transition-opacity duration-300 ease-out motion-reduce:transition-none'
            : 'opacity-0 motion-reduce:opacity-100',
        )}
      >
        {children}
      </SmoothFooterSection>
    </>
  )
}
