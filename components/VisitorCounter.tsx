'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

function formatNumber(num: number): string {
  return num.toLocaleString()
}

type VisitorCountResponse = { count?: unknown }

let inflightCountPromise: Promise<number> | null = null
let cachedCount: number | null = null

async function getVisitorCount(): Promise<number> {
  if (cachedCount !== null) return cachedCount

  if (!inflightCountPromise) {
    inflightCountPromise = fetch('/api/visitor-count', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch visitor count (${response.status})`)
        }
        return (await response.json()) as VisitorCountResponse
      })
      .then((data) => {
        const count = typeof data?.count === 'number' ? data.count : 0
        cachedCount = count
        return count
      })
      .finally(() => {
        inflightCountPromise = null
      })
  }

  return inflightCountPromise
}

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    getVisitorCount()
      .then((value) => {
        if (cancelled) return
        setCount(value)
        timer = setTimeout(() => {
          if (!cancelled) setIsVisible(true)
        }, 100)
      })
      .catch((error) => {
        if (cancelled) return
        console.error('Failed to fetch visitor count:', error)
      })

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [])

  if (count === null) {
    return null
  }

  return (
    <span
      className={cn(
        'transition-opacity duration-700 ease-in-out',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      {formatNumber(count)} visits
    </span>
  )
}
