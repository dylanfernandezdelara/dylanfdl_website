'use client'

import CardGridClient from '@/components/CardGridClient'
import SmoothFooterSection from '@/components/SmoothFooterSection'
import type { CardGridSerializableItem } from '@/lib/buildCardGridItems'
import type { ReactNode } from 'react'

type Props = {
  items: CardGridSerializableItem[]
  children: ReactNode
}

export default function AboutCardGridWithFooter({ items, children }: Props) {
  return (
    <CardGridClient
      items={items}
      footer={<SmoothFooterSection className="max-w-reading">{children}</SmoothFooterSection>}
    />
  )
}
