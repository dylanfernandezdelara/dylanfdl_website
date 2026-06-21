'use client'

import { useCallback, useLayoutEffect, useRef, useState, type Ref } from 'react'
import { slotText, type SlotOptions, type SlotTextController } from 'slot-text'

import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import { seedEmptyBaseline } from '@/lib/slotTextSeed'

export type UseSlotTextRollOptions = {
  direction: 'up' | 'down'
  slotOptions?: Omit<SlotOptions, 'direction'>
  /** Identifies the slot for tests and debugging. */
  name?: 'label' | 'title' | 'artist'
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
  rollTo: (text: string) => void
  /** Rolls from an explicit source string; use when React fallback will clear before animate. */
  rollFromTo: (from: string, to: string) => void
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
  const [slotMounted, setSlotMounted] = useState(false)

  const active = motionReady && slotMounted && !prefersReducedMotion

  const animateFromTo = useCallback(
    (from: string, to: string) => {
      const slot = slotRef.current
      if (!slot) return

      if (to === from) {
        displayedTextRef.current = to
        slot.textContent = to
        return
      }

      controllerRef.current?.destroy()
      controllerRef.current = null

      if (from.length > 0) {
        displayedTextRef.current = from
        controllerRef.current = slotText(slot, from)
      } else {
        displayedTextRef.current = seedEmptyBaseline(slot, to.length)
        controllerRef.current = slotText(slot, displayedTextRef.current)
      }

      controllerRef.current.set(to, {
        direction,
        ...slotOptions,
      })
      displayedTextRef.current = to
    },
    [direction, slotOptions],
  )

  const animateFromToRef = useRef(animateFromTo)
  animateFromToRef.current = animateFromTo

  const animateTo = useCallback(
    (text: string) => {
      const slot = slotRef.current
      if (!slot) return

      if (text === displayedTextRef.current && slot.querySelector('.char-slot')) {
        return
      }

      if (!slot.querySelector('.char-slot') && text.length > 0) {
        const existing = (slot.textContent ?? '').replace(/\u00A0/g, ' ')
        if (existing.length > 0) {
          displayedTextRef.current = existing
          if (!controllerRef.current) {
            controllerRef.current = slotText(slot, existing)
          }
        } else {
          displayedTextRef.current = seedEmptyBaseline(slot, text.length)
        }
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
    (text: string) => {
      desiredTextRef.current = text
      if (!active) return
      animateToRef.current(text)
    },
    [active],
  )

  const rollFromTo = useCallback(
    (from: string, to: string) => {
      desiredTextRef.current = to
      if (!active) return
      animateFromToRef.current(from, to)
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
      animateToRef.current(text)
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
    rollFromTo,
  }
}
