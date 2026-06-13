import type { SlotOptions } from 'slot-text'
import 'slot-text/style.css'

import useOptimistSlot from '@/hooks/useOptimistSlot'
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'

import '@/src/styles/optimist-text.css'

interface OptimistTextProps {
  text?: string
  delayMultiplier?: number
  rollOptions?: SlotOptions
  className?: string
}

const BASE_CLASS =
  'optimist-text-trigger border-0 bg-transparent p-0 font-inherit leading-inherit text-inherit'

const INTERACTIVE_CLASS = 'cursor-pointer transition-opacity hover:opacity-85'
const STATIC_CLASS = 'cursor-default'

function StaticRainbowText({
  text,
  delayMultiplier,
  phaseMs,
}: {
  text: string
  delayMultiplier: number
  phaseMs: number
}) {
  return text.split('').map((letter, index) => (
    <span
      key={`${letter}-${index}`}
      className="rainbow-letter"
      style={{ animationDelay: `-${phaseMs + index * delayMultiplier * 1000}ms` }}
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
  const { reduced: prefersReducedMotion, ready } = usePrefersReducedMotion()
  const { slotRef, isBusy, restPhaseMs, roll } = useOptimistSlot({
    text,
    delayMultiplier,
    rollOptions,
    ready,
    prefersReducedMotion,
  })

  const isInteractive = ready && !prefersReducedMotion
  const modeClass = isInteractive ? INTERACTIVE_CLASS : STATIC_CLASS

  const content = (
    <span
      key={isInteractive ? 'interactive' : 'static'}
      ref={slotRef}
      className="optimist-text-content"
    >
      {!isInteractive ? (
        <StaticRainbowText
          text={text}
          delayMultiplier={delayMultiplier}
          phaseMs={restPhaseMs}
        />
      ) : null}
    </span>
  )

  if (!isInteractive) {
    return (
      <span className={`${BASE_CLASS} ${modeClass}${className ? ` ${className}` : ''}`}>
        {content}
      </span>
    )
  }

  return (
    <button
      type="button"
      className={`${BASE_CLASS} ${modeClass}${className ? ` ${className}` : ''}`}
      aria-label={`${text} — press to animate`}
      aria-busy={isBusy}
      onClick={roll}
    >
      {content}
    </button>
  )
}
