'use client'

import { useCallback, useLayoutEffect, useRef, useState, type Ref } from 'react'
import { slotText, type SlotOptions, type SlotTextController } from 'slot-text'

import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import { seedEmptyBaseline } from '@/lib/slotTextSeed'

export type UseSlotTextRollOptions = {
  direction: 'up' | 'down'
  slotOptions?: Omit<SlotOptions, 'direction'>
  twoPhaseFromToRoll?: boolean
}

export type UseSlotTextRollResult = {
  slotRef: Ref<HTMLSpanElement>
  slotMounted: boolean
  active: boolean
  slotTextActive: boolean
  rollTo: (text: string) => void
  rollFromTo: (from: string, to: string) => void
  queueRollFromTo: (from: string, to: string) => void
}

function readFallbackBaseline(slot: HTMLSpanElement): string {
  if (slot.querySelector('.char-slot')) {
    return ''
  }
  return (slot.textContent ?? '').replace(/\u00A0/g, ' ')
}

function rollTextIntoEmptySlot(animate: (text: string) => void, text: string): void {
  if (text.length > 0) {
    animate(text)
  }
}

export default function useSlotTextRoll({
  direction,
  slotOptions,
  twoPhaseFromToRoll = false,
}: UseSlotTextRollOptions): UseSlotTextRollResult {
  const { reduced: prefersReducedMotion, ready: motionReady } = usePrefersReducedMotion()
  const slotRef = useRef<HTMLSpanElement>(null)
  const controllerRef = useRef<SlotTextController | null>(null)
  const displayedTextRef = useRef('')
  const desiredTextRef = useRef('')
  const pendingFromToRollRef = useRef<{ from: string; to: string } | null>(null)
  const [slotMounted, setSlotMounted] = useState(false)
  const [slotOwnsDom, setSlotOwnsDom] = useState(false)
  const [pendingRollVersion, setPendingRollVersion] = useState(0)

  const active = motionReady && slotMounted && !prefersReducedMotion
  const slotTextActive = twoPhaseFromToRoll ? active && slotOwnsDom : active

  const animate = useCallback(
    (to: string, explicitFrom?: string) => {
      const slot = slotRef.current
      if (!slot) return

      if (
        explicitFrom === undefined &&
        to === displayedTextRef.current &&
        slot.querySelector('.char-slot')
      ) {
        return
      }

      if (explicitFrom === undefined && controllerRef.current && slot.querySelector('.char-slot')) {
        controllerRef.current.set(to, {
          direction,
          ...slotOptions,
        })
        displayedTextRef.current = to
        desiredTextRef.current = to
        return
      }

      const baseline = readFallbackBaseline(slot)
      const from = explicitFrom ?? (baseline.length > 0 ? baseline : '')

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

  const animateRef = useRef(animate)
  animateRef.current = animate

  const rollTo = useCallback(
    (text: string) => {
      desiredTextRef.current = text
      if (!active) return
      animateRef.current(text)
    },
    [active],
  )

  const rollFromTo = useCallback(
    (from: string, to: string) => {
      desiredTextRef.current = to
      if (!active) return
      animateRef.current(to, from)
    },
    [active],
  )

  const queueRollFromTo = useCallback((from: string, to: string) => {
    if (from === to) return
    desiredTextRef.current = to
    pendingFromToRollRef.current = { from, to }
    setPendingRollVersion((version) => version + 1)
  }, [])

  const assignSlotRef = useCallback((node: HTMLSpanElement | null) => {
    slotRef.current = node
    setSlotMounted(node !== null)
  }, [])

  useLayoutEffect(() => {
    if (active) return undefined

    pendingFromToRollRef.current = null
    return undefined
  }, [active])

  useLayoutEffect(() => {
    if (!twoPhaseFromToRoll) return undefined

    const pending = pendingFromToRollRef.current
    if (!pending || !active) {
      return undefined
    }

    if (!slotOwnsDom) {
      setSlotOwnsDom(true)
      return undefined
    }

    pendingFromToRollRef.current = null
    animateRef.current(pending.to, pending.from)
    return undefined
  }, [active, pendingRollVersion, slotOwnsDom, twoPhaseFromToRoll])

  useLayoutEffect(() => {
    if (!active) return undefined

    const pendingFromToRoll = pendingFromToRollRef.current
    if (twoPhaseFromToRoll && pendingFromToRoll) {
      return undefined
    }

    rollTextIntoEmptySlot(animateRef.current, desiredTextRef.current)

    return () => {
      controllerRef.current?.destroy()
      controllerRef.current = null
      displayedTextRef.current = ''
      if (twoPhaseFromToRoll) {
        setSlotOwnsDom(false)
      }
    }
  }, [active, twoPhaseFromToRoll])

  return {
    slotRef: assignSlotRef,
    slotMounted,
    active,
    slotTextActive,
    rollTo,
    rollFromTo,
    queueRollFromTo,
  }
}
