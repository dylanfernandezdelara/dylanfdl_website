import { useEffect, useRef } from 'react'

import { itemKey, type GridRow, type RowPhase } from '@/components/card-grid/model'

export type PhaseBatch = {
  signature: string
  maxEndMs: number
}

export function batchForPhase(
  rows: GridRow[],
  phase: Exclude<RowPhase, 'stay'>,
  durationMs: number,
  delayOf: (row: GridRow) => number,
): PhaseBatch | null {
  const matched = rows.filter((row) => row.phase === phase)
  if (matched.length === 0) {
    return null
  }

  return {
    signature: matched
      .map((row) => itemKey(row.item))
      .sort()
      .join('\0'),
    maxEndMs: Math.max(
      ...matched.map((row) => delayOf(row) + durationMs),
      durationMs,
    ),
  }
}

/**
 * Fires once the phase batch's wall-clock budget elapses.
 * Keeps a stable origin across signature updates that still overlap
 * (e.g. filter mid-enter) so the timeout is not reset to a full new duration.
 */
export function usePhaseBatchTimeout(
  batch: PhaseBatch | null,
  onFire: () => void,
): void {
  const onFireRef = useRef(onFire)
  onFireRef.current = onFire

  const originRef = useRef<number | null>(null)
  const prevSignatureRef = useRef('')

  const signature = batch?.signature ?? ''
  const maxEndMs = batch?.maxEndMs ?? 0

  useEffect(() => {
    if (!signature) {
      originRef.current = null
      prevSignatureRef.current = ''
      return
    }

    const prevKeys = prevSignatureRef.current
      ? prevSignatureRef.current.split('\0')
      : []
    const nextKeys = signature.split('\0')
    const hasOverlap =
      prevKeys.length > 0 && nextKeys.some((key) => prevKeys.includes(key))

    if (originRef.current == null || !hasOverlap) {
      originRef.current = performance.now()
    }
    prevSignatureRef.current = signature

    const remainingMs = Math.max(0, originRef.current + maxEndMs - performance.now())
    const timeoutId = window.setTimeout(() => {
      originRef.current = null
      prevSignatureRef.current = ''
      onFireRef.current()
    }, remainingMs)

    return () => window.clearTimeout(timeoutId)
  }, [signature, maxEndMs])
}
