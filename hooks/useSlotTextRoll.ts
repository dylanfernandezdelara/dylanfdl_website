'use client'

import { useCallback, useLayoutEffect, useRef, useState, type Ref } from 'react'
import { slotText, type SlotOptions, type SlotTextController } from 'slot-text'

import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import { seedEmptyBaseline } from '@/lib/slotTextSeed'

export type UseSlotTextRollOptions = {
  direction: 'up' | 'down'
  slotOptions?: Omit<SlotOptions, 'direction'>
}

export type UseSlotTextRollResult = {
  slotRef: Ref<HTMLSpanElement>
  slotMounted: boolean
  rollTo: (text: string) => void
  setInstant: (text: string) => void
}

export default function useSlotTextRoll({
  direction,
  slotOptions,
}: UseSlotTextRollOptions): UseSlotTextRollResult {
  const { reduced: prefersReducedMotion, ready: motionReady } = usePrefersReducedMotion()
  const slotRef = useRef<HTMLSpanElement>(null)
  const controllerRef = useRef<SlotTextController | null>(null)
  const currentTextRef = useRef('')
  const pendingTextRef = useRef<string | null>(null)
  const [slotMounted, setSlotMounted] = useState(false)

  const canAnimate = motionReady && slotMounted && !prefersReducedMotion

  const setInstant = useCallback((text: string) => {
    const slot = slotRef.current
    if (!slot) return

    pendingTextRef.current = null
    currentTextRef.current = text
    controllerRef.current?.destroy()
    controllerRef.current = null
    slot.textContent = text
  }, [])

  const animateTo = useCallback(
    (text: string) => {
      const slot = slotRef.current
      if (!slot) return

      if (text === currentTextRef.current) {
        pendingTextRef.current = null
        return
      }

      if (prefersReducedMotion) {
        setInstant(text)
        return
      }

      if (!slot.querySelector('.char-slot') && text.length > 0) {
        currentTextRef.current = seedEmptyBaseline(slot, text.length)
      }

      if (!controllerRef.current) {
        controllerRef.current = slotText(slot, currentTextRef.current)
      }

      controllerRef.current.set(text, {
        direction,
        ...slotOptions,
      })
      currentTextRef.current = text
      pendingTextRef.current = null
    },
    [direction, prefersReducedMotion, setInstant, slotOptions],
  )

  const rollTo = useCallback(
    (text: string) => {
      if (!motionReady || !slotMounted) {
        pendingTextRef.current = text
        return
      }

      animateTo(text)
    },
    [animateTo, motionReady, slotMounted],
  )

  const assignSlotRef = useCallback((node: HTMLSpanElement | null) => {
    slotRef.current = node
    setSlotMounted(node !== null)
  }, [])

  const animateToRef = useRef(animateTo)
  animateToRef.current = animateTo

  useLayoutEffect(() => {
    if (!motionReady || !slotMounted) return undefined

    const pending = pendingTextRef.current
    if (pending === null) return undefined

    if (prefersReducedMotion) {
      setInstant(pending)
      return undefined
    }

    if (!canAnimate) return undefined

    animateToRef.current(pending)

    return () => {
      controllerRef.current?.destroy()
      controllerRef.current = null
    }
  }, [canAnimate, motionReady, prefersReducedMotion, setInstant, slotMounted])

  return {
    slotRef: assignSlotRef,
    slotMounted,
    rollTo,
    setInstant,
  }
}
