import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { slotText, type SlotOptions, type SlotTextController } from 'slot-text'
import 'slot-text/style.css'

import {
  DEFAULT_OPTIMIST_ROLL_OPTIONS,
  FINISH_ROLL_BUFFER_MS,
} from '@/lib/optimistRollDefaults'
import { estimateSlotTextRollDuration } from '@/lib/estimateSlotTextRollDuration'
import {
  readRainbowDurationMs,
  readRainbowPhaseMs,
  syncRainbowFaces,
} from '@/lib/rainbowPhaseSync'
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'

import '@/src/styles/optimist-text.css'

interface OptimistTextProps {
  text?: string
  delayMultiplier?: number
  rollOptions?: SlotOptions
  className?: string
}

const TRIGGER_CLASS =
  'optimist-text-trigger inline align-baseline cursor-pointer border-0 bg-transparent p-0 font-inherit leading-inherit text-inherit transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2'

function StaticRainbowText({ text, delayMultiplier }: { text: string; delayMultiplier: number }) {
  return text.split('').map((letter, index) => (
    <span
      key={`${letter}-${index}`}
      className="rainbow-letter"
      style={{ animationDelay: `-${index * delayMultiplier}s` }}
    >
      {letter}
    </span>
  ))
}

export default function OptimistText({
  text = 'optimist.',
  delayMultiplier = 0.2,
  rollOptions,
  className,
}: OptimistTextProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [isBusy, setIsBusy] = useState(false)

  const slotRef = useRef<HTMLSpanElement>(null)
  const controllerRef = useRef<SlotTextController | null>(null)
  const rollingRef = useRef(false)
  const directionRef = useRef<'up' | 'down'>('up')
  const rollTimerRef = useRef<number | null>(null)
  const rollPhaseStartMsRef = useRef(0)
  const rollWallStartRef = useRef(0)
  const rainbowDurationMsRef = useRef(15_000)

  const rollPhaseNow = useCallback(() => {
    return (
      (rollPhaseStartMsRef.current + performance.now() - rollWallStartRef.current) %
      rainbowDurationMsRef.current
    )
  }, [])

  const syncRainbowFromState = useCallback(() => {
    const slot = slotRef.current
    if (!slot || prefersReducedMotion) return

    const phaseMs = rollingRef.current ? rollPhaseNow() : 0
    syncRainbowFaces(slot, delayMultiplier, phaseMs)
  }, [delayMultiplier, prefersReducedMotion, rollPhaseNow])

  const finishRoll = useCallback(
    (slot: HTMLElement) => {
      syncRainbowFaces(slot, delayMultiplier, rollPhaseNow())
      slot.classList.remove('is-rolling')
      rollingRef.current = false
      rollTimerRef.current = null
      setIsBusy(false)
    },
    [delayMultiplier, rollPhaseNow],
  )

  const roll = useCallback(() => {
    const slot = slotRef.current
    const controller = controllerRef.current
    if (!slot || !controller || rollingRef.current || prefersReducedMotion) return

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
    syncRainbowFromState()

    rollTimerRef.current = window.setTimeout(() => {
      finishRoll(slot)
    }, estimateSlotTextRollDuration(text, options) + FINISH_ROLL_BUFFER_MS)
  }, [text, rollOptions, finishRoll, syncRainbowFromState, prefersReducedMotion])

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      roll()
    }
  }

  useEffect(() => {
    if (prefersReducedMotion) return undefined

    const slot = slotRef.current
    if (!slot) return undefined

    rainbowDurationMsRef.current = readRainbowDurationMs(slot)
    controllerRef.current = slotText(slot, text)
    syncRainbowFaces(slot, delayMultiplier)

    const mutationObserver = new MutationObserver(() => {
      syncRainbowFromState()
    })
    mutationObserver.observe(slot, { childList: true, subtree: true })

    return () => {
      mutationObserver.disconnect()
      if (rollTimerRef.current !== null) {
        window.clearTimeout(rollTimerRef.current)
        rollTimerRef.current = null
      }
      rollingRef.current = false
      controllerRef.current?.destroy()
      controllerRef.current = null
    }
  }, [text, delayMultiplier, syncRainbowFromState, prefersReducedMotion])

  const staticClassName = prefersReducedMotion
    ? ' cursor-default hover:opacity-100'
    : ''

  return (
    <button
      type="button"
      className={`${TRIGGER_CLASS}${staticClassName}${className ? ` ${className}` : ''}`}
      aria-label={prefersReducedMotion ? text : `${text} — press to animate`}
      aria-disabled={prefersReducedMotion}
      aria-busy={isBusy}
      onClick={prefersReducedMotion ? undefined : roll}
      onKeyDown={prefersReducedMotion ? undefined : handleKeyDown}
    >
      <span ref={slotRef} className="optimist-text-content">
        <StaticRainbowText text={text} delayMultiplier={delayMultiplier} />
      </span>
    </button>
  )
}
