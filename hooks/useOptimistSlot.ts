'use client'

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { slotText, type SlotOptions, type SlotTextController } from 'slot-text'

import { estimateOptimistRollDuration } from '@/lib/estimateOptimistRollDuration'
import {
  DEFAULT_OPTIMIST_ROLL_OPTIONS,
  FINISH_ROLL_BUFFER_MS,
} from '@/lib/optimistRollDefaults'
import {
  readRainbowDurationMs,
  readRainbowPhaseMs,
  syncRainbowFaces,
} from '@/lib/rainbowPhaseSync'

export type UseOptimistSlotOptions = {
  text: string
  delayMultiplier: number
  rollOptions?: SlotOptions
  ready: boolean
  prefersReducedMotion: boolean
}

export type UseOptimistSlotResult = {
  slotRef: RefObject<HTMLSpanElement>
  isBusy: boolean
  restPhaseMs: number
  roll: () => void
}

export default function useOptimistSlot({
  text,
  delayMultiplier,
  rollOptions,
  ready,
  prefersReducedMotion,
}: UseOptimistSlotOptions): UseOptimistSlotResult {
  const [isBusy, setIsBusy] = useState(false)
  const [restPhaseMs, setRestPhaseMs] = useState(0)

  const slotRef = useRef<HTMLSpanElement>(null)
  const controllerRef = useRef<SlotTextController | null>(null)
  const rollingRef = useRef(false)
  const directionRef = useRef<'up' | 'down'>('up')
  const rollTimerRef = useRef<number | null>(null)
  const rollPhaseStartMsRef = useRef(0)
  const rollWallStartRef = useRef(0)
  const rainbowDurationMsRef = useRef(15_000)
  const restPhaseMsRef = useRef(0)

  const rollPhaseNow = useCallback(() => {
    return (
      (rollPhaseStartMsRef.current + performance.now() - rollWallStartRef.current) %
      rainbowDurationMsRef.current
    )
  }, [])

  const syncRainbowFromState = useCallback(() => {
    const slot = slotRef.current
    if (!slot || prefersReducedMotion || !ready) return

    const phaseMs = rollingRef.current ? rollPhaseNow() : restPhaseMsRef.current
    syncRainbowFaces(slot, delayMultiplier, phaseMs)
  }, [delayMultiplier, prefersReducedMotion, ready, rollPhaseNow])

  const finishRoll = useCallback(
    (slot: HTMLElement) => {
      const phase = rollPhaseNow()
      restPhaseMsRef.current = phase
      setRestPhaseMs(phase)
      rollingRef.current = false
      rollTimerRef.current = null
      setIsBusy(false)
      slot.classList.remove('is-rolling')
      syncRainbowFaces(slot, delayMultiplier, phase)
    },
    [delayMultiplier, rollPhaseNow],
  )

  const executeRoll = useCallback(
    (slot: HTMLElement) => {
      const controller = controllerRef.current
      if (!controller || rollingRef.current || prefersReducedMotion) return

      rollingRef.current = true
      setIsBusy(true)
      slot.classList.add('is-rolling')

      if (rollTimerRef.current !== null) {
        window.clearTimeout(rollTimerRef.current)
      }

      directionRef.current = directionRef.current === 'up' ? 'down' : 'up'
      const options: SlotOptions = {
        ...DEFAULT_OPTIMIST_ROLL_OPTIONS,
        ...rollOptions,
        direction: directionRef.current,
      }

      rollPhaseStartMsRef.current = readRainbowPhaseMs(slot, rainbowDurationMsRef.current)
      rollWallStartRef.current = performance.now()

      controller.set(text, options)
      syncRainbowFaces(slot, delayMultiplier, rollPhaseNow())

      rollTimerRef.current = window.setTimeout(() => {
        finishRoll(slot)
      }, estimateOptimistRollDuration(text, options) + FINISH_ROLL_BUFFER_MS)
    },
    [text, rollOptions, finishRoll, prefersReducedMotion, delayMultiplier, rollPhaseNow],
  )

  const executeRollRef = useRef(executeRoll)
  executeRollRef.current = executeRoll

  const syncRainbowFromStateRef = useRef(syncRainbowFromState)
  syncRainbowFromStateRef.current = syncRainbowFromState

  const roll = useCallback(() => {
    if (!ready || prefersReducedMotion || rollingRef.current) return

    const slot = slotRef.current
    if (!slot) return
    executeRollRef.current(slot)
  }, [ready, prefersReducedMotion])

  const captureRestPhase = useCallback((slot: HTMLElement) => {
    rainbowDurationMsRef.current = readRainbowDurationMs(slot)
    const phase = readRainbowPhaseMs(slot, rainbowDurationMsRef.current)
    restPhaseMsRef.current = phase
    setRestPhaseMs(phase)
  }, [])

  useLayoutEffect(() => {
    const slot = slotRef.current
    if (!slot) return undefined

    const hasStaticLetters = slot.querySelector('.rainbow-letter') !== null
    if ((!ready || prefersReducedMotion) && hasStaticLetters) {
      captureRestPhase(slot)
    }

    return () => {
      if (slot.querySelector('.rainbow-letter')) {
        const phase = readRainbowPhaseMs(slot, rainbowDurationMsRef.current)
        restPhaseMsRef.current = phase
        setRestPhaseMs(phase)
      }
    }
  }, [ready, prefersReducedMotion, captureRestPhase])

  useLayoutEffect(() => {
    if (!ready || prefersReducedMotion) return undefined

    const slot = slotRef.current
    if (!slot) return undefined

    if (slot.querySelector('.rainbow-letter')) {
      captureRestPhase(slot)
    }

    controllerRef.current = slotText(slot, text)
    syncRainbowFaces(slot, delayMultiplier, restPhaseMsRef.current)

    const mutationObserver = new MutationObserver(() => {
      syncRainbowFromStateRef.current()
    })
    mutationObserver.observe(slot, { childList: true, subtree: true })

    return () => {
      mutationObserver.disconnect()
      if (rollTimerRef.current !== null) {
        window.clearTimeout(rollTimerRef.current)
        rollTimerRef.current = null
      }
      rollingRef.current = false
      slot.classList.remove('is-rolling')
      if (slot.isConnected) {
        setIsBusy(false)
      }
      controllerRef.current?.destroy()
      controllerRef.current = null
    }
  }, [ready, text, delayMultiplier, prefersReducedMotion])

  return { slotRef, isBusy, restPhaseMs, roll }
}
