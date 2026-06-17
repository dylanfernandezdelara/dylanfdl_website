'use client'

import { useCallback, useLayoutEffect, useRef, useState, type Ref } from 'react'
import { buildSlotText, slotText, type SlotOptions, type SlotTextController } from 'slot-text'

import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import { seedEmptyBaseline } from '@/lib/slotTextSeed'

export type UseSlotTextRollOptions = {
  direction: 'up' | 'down'
  slotOptions?: Omit<SlotOptions, 'direction'>
}

export type UseSlotTextRollResult = {
  slotRef: Ref<HTMLSpanElement>
  slotMounted: boolean
  /**
   * True once slot-text controls the slot DOM. Until then the caller must keep
   * rendering the React text fallback so SSR markup hydrates cleanly and reduced
   * motion users still see the text.
   */
  active: boolean
  rollTo: (text: string, options?: { instant?: boolean }) => void
}

export default function useSlotTextRoll({
  direction,
  slotOptions,
}: UseSlotTextRollOptions): UseSlotTextRollResult {
  const { reduced: prefersReducedMotion, ready: motionReady } = usePrefersReducedMotion()
  const slotRef = useRef<HTMLSpanElement>(null)
  const controllerRef = useRef<SlotTextController | null>(null)
  const displayedTextRef = useRef('')
  const desiredTextRef = useRef('')
  const desiredInstantRef = useRef(false)
  const [slotMounted, setSlotMounted] = useState(false)

  const active = motionReady && slotMounted && !prefersReducedMotion

  const animateTo = useCallback(
    (text: string, instant = false) => {
      const slot = slotRef.current
      if (!slot) return

      if (text === displayedTextRef.current && slot.querySelector('.char-slot')) {
        return
      }

      if (instant) {
        buildSlotText(slot, text)
        displayedTextRef.current = text
        if (!controllerRef.current) {
          controllerRef.current = slotText(slot, text)
        }
        return
      }

      if (!slot.querySelector('.char-slot') && text.length > 0) {
        displayedTextRef.current = seedEmptyBaseline(slot, text.length)
      }

      if (!controllerRef.current) {
        controllerRef.current = slotText(slot, displayedTextRef.current)
      }

      controllerRef.current.set(text, {
        direction,
        ...slotOptions,
      })
      displayedTextRef.current = text
    },
    [direction, slotOptions],
  )

  const animateToRef = useRef(animateTo)
  animateToRef.current = animateTo

  const rollTo = useCallback(
    (text: string, options?: { instant?: boolean }) => {
      desiredTextRef.current = text
      desiredInstantRef.current = options?.instant ?? false
      if (!active) return
      animateToRef.current(text, desiredInstantRef.current)
    },
    [active],
  )

  const assignSlotRef = useCallback((node: HTMLSpanElement | null) => {
    slotRef.current = node
    setSlotMounted(node !== null)
  }, [])

  /*
   * When slot-text becomes active, React has just cleared its fallback text from
   * the slot (the caller renders `null` children once `active` is true). Take over
   * the now-empty slot and roll the desired text in from a blank baseline.
   */
  useLayoutEffect(() => {
    if (!active) return undefined

    const text = desiredTextRef.current
    if (text.length > 0) {
      animateToRef.current(text, desiredInstantRef.current)
    }

    return () => {
      controllerRef.current?.destroy()
      controllerRef.current = null
      displayedTextRef.current = ''
    }
  }, [active])

  return {
    slotRef: assignSlotRef,
    slotMounted,
    active,
    rollTo,
  }
}
