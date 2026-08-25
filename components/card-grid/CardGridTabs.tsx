'use client'

import { type KeyboardEvent } from 'react'
import * as stylex from '@stylexjs/stylex'

import { TAB_OPTIONS } from '@/components/card-grid/constants'
import useTabIndicator from '@/components/card-grid/useTabIndicator'
import type { CardGridFilter } from '@/lib/buildCardGridItems'

const styles = stylex.create({
  wrap: {
    marginBottom: '1rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    '@media (min-width: 640px)': {
      marginBottom: '1.25rem',
    },
  },
  list: {
    position: 'relative',
    display: 'inline-flex',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--bg3)',
    backgroundColor: 'var(--bg2)',
    padding: '0.125rem',
  },
  pill: {
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: 0,
    borderRadius: 'calc(var(--radius) - 4px)',
    backgroundColor: 'var(--bg0)',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '@media (prefers-reduced-motion: reduce)': {
      display: 'none',
    },
  },
  tab: {
    position: 'relative',
    zIndex: 10,
    borderRadius: 'calc(var(--radius) - 4px)',
    paddingInline: '0.625rem',
    paddingBlock: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1,
    transitionProperty: 'color, background-color, box-shadow',
    transitionDuration: '300ms',
    transitionTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
    ':focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineOffset: '2px',
      outlineColor: 'var(--blue)',
    },
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0s',
    },
  },
  idle: {
    color: 'var(--fg3)',
    ':hover': {
      color: 'var(--fg1)',
    },
  },
  selectedWithPill: {
    color: 'var(--fg0)',
    '@media (prefers-reduced-motion: reduce)': {
      backgroundColor: 'var(--bg0)',
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
  },
  selectedStatic: {
    backgroundColor: 'var(--bg0)',
    color: 'var(--fg0)',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  },
})

type Props = {
  filter: CardGridFilter
  onSelect: (filter: CardGridFilter) => void
}

export default function CardGridTabs({ filter, onSelect }: Props) {
  const { tablistRef, tabButtonRefs, showPill, indicatorStyle } = useTabIndicator(filter)

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = TAB_OPTIONS.length - 1
    let nextIndex: number | null = null

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = index === lastIndex ? 0 : index + 1
        break
      case 'ArrowLeft':
        nextIndex = index === 0 ? lastIndex : index - 1
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = lastIndex
        break
      default:
        return
    }

    event.preventDefault()
    const nextFilter = TAB_OPTIONS[nextIndex]?.id
    if (!nextFilter) {
      return
    }

    onSelect(nextFilter)
    tabButtonRefs.current[nextIndex]?.focus()
  }

  return (
    <div {...stylex.props(styles.wrap)}>
      <div
        ref={tablistRef}
        role="tablist"
        aria-label="Filter work"
        {...stylex.props(styles.list)}
      >
        {showPill ? (
          <span
            aria-hidden
            className={stylex.props(styles.pill).className}
            style={{ ...stylex.props(styles.pill).style, ...indicatorStyle }}
          />
        ) : null}
        {TAB_OPTIONS.map(({ id, label }, index) => {
          const selected = filter === id
          return (
            <button
              key={id}
              id={`tab-${id}`}
              ref={(element) => {
                tabButtonRefs.current[index] = element
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={selected ? 'tabpanel-work' : undefined}
              tabIndex={selected ? 0 : -1}
              {...stylex.props(
                styles.tab,
                selected
                  ? showPill
                    ? styles.selectedWithPill
                    : styles.selectedStatic
                  : styles.idle,
              )}
              onClick={() => onSelect(id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
