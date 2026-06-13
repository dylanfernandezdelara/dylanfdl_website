'use client'

import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react'
import { chromatic, slotText, type SlotTextController } from 'slot-text'

import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'

const CHROMATIC_ROLL = { color: chromatic({ from: 190 }) }

export type UseSlotTextRollOptions = {
  direction: 'up' | 'down'
}

export type UseSlotTextRollResult = {
  slotRef: RefObject<HTMLSpanElement>
  rollTo: (text: string) => void
  setInstant: (text: string) => void
}

export default function useSlotTextRoll({
  direction,
}: UseSlotTextRollOptions): UseSlotTextRollResult {
  const { reduced: prefersReducedMotion, ready } = usePrefersReducedMotion()
  const slotRef = useRef<HTMLSpanElement>(null)
  const controllerRef = useRef<SlotTextController | null>(null)
  const currentTextRef = useRef('')

  const setInstant = useCallback((text: string) => {
    const slot = slotRef.current
    if (!slot) return

    currentTextRef.current = text
    controllerRef.current?.destroy()
    controllerRef.current = null
    slot.textContent = text
  }, [])

  const rollTo = useCallback(
    (text: string) => {
      const slot = slotRef.current
      if (!slot || !ready) return

      if (text === currentTextRef.current) return

      if (prefersReducedMotion) {
        setInstant(text)
        return
      }

      if (!controllerRef.current) {
        controllerRef.current = slotText(slot, currentTextRef.current)
      }

      controllerRef.current.set(text, {
        direction,
        ...CHROMATIC_ROLL,
      })
      currentTextRef.current = text
    },
    [direction, prefersReducedMotion, ready, setInstant],
  )

  useLayoutEffect(() => {
    if (!ready) return undefined

    const slot = slotRef.current
    if (!slot) return undefined

    if (prefersReducedMotion) {
      return () => {
        controllerRef.current?.destroy()
        controllerRef.current = null
      }
    }

    controllerRef.current = slotText(slot, currentTextRef.current)

    return () => {
      controllerRef.current?.destroy()
      controllerRef.current = null
    }
  }, [ready, prefersReducedMotion])

  return { slotRef, rollTo, setInstant }
}
