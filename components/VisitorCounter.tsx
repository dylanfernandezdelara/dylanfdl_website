'use client'

import { useEffect, useState } from 'react'

const COUNTER_STYLES: React.CSSProperties = {
  opacity: 0,
  transition: 'opacity 0.6s ease-in-out',
}

const COUNTER_VISIBLE_STYLES: React.CSSProperties = {
  ...COUNTER_STYLES,
  opacity: 1,
}

function formatNumber(num: number): string {
  return num.toLocaleString()
}

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    async function fetchCount() {
      try {
        const response = await fetch('/api/visitor-count', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error(`Failed to fetch visitor count (${response.status})`)
        }
        const data = await response.json()
        setCount(typeof data?.count === 'number' ? data.count : 0)
        // Trigger fade-in after a small delay
        setTimeout(() => setIsVisible(true), 100)
      } catch (error) {
        console.error('Failed to fetch visitor count:', error)
      }
    }

    fetchCount()
  }, [])

  if (count === null) {
    return null
  }

  return (
    <span style={isVisible ? COUNTER_VISIBLE_STYLES : COUNTER_STYLES}>
      {formatNumber(count)} visits
    </span>
  )
}

