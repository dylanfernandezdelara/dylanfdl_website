'use client'

import { type KeyboardEvent } from 'react'
import type { SlotOptions } from 'slot-text'
import * as stylex from '@stylexjs/stylex'
import 'slot-text/style.css'

import useOptimistSlot from '@/hooks/useOptimistSlot'
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import { withClassName } from '@/lib/sx'

import '@/src/styles/optimist-text.css'

interface OptimistTextProps {
  text?: string
  delayMultiplier?: number
  rollOptions?: SlotOptions
  className?: string
}

const styles = stylex.create({
  trigger: {
    cursor: 'pointer',
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 0,
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
    color: 'inherit',
    transitionProperty: 'opacity',
    ':hover': {
      opacity: 0.85,
    },
  },
  staticTrigger: {
    cursor: 'default',
    ':hover': {
      opacity: 1,
    },
  },
})

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

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      roll()
    }
  }

  const isInteractive = ready && !prefersReducedMotion

  return (
    <button
      type="button"
      {...withClassName(
        className ? `optimist-text-trigger ${className}` : 'optimist-text-trigger',
        stylex.props(styles.trigger, isInteractive ? null : styles.staticTrigger),
      )}
      aria-label={isInteractive ? `${text} — press to animate` : text}
      aria-disabled={!isInteractive || undefined}
      aria-busy={isBusy}
      onClick={isInteractive ? roll : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
    >
      <span ref={slotRef} className="optimist-text-content slot-text-cell-clip">
        {!isInteractive ? (
          <StaticRainbowText
            text={text}
            delayMultiplier={delayMultiplier}
            phaseMs={restPhaseMs}
          />
        ) : null}
      </span>
    </button>
  )
}
