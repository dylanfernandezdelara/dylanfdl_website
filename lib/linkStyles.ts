import * as stylex from '@stylexjs/stylex'

export const linkStyles = stylex.create({
  inline: {
    color: 'var(--fg1)',
    textDecorationLine: 'underline',
    textUnderlineOffset: '2px',
    transitionProperty: 'color',
    transitionDuration: '150ms',
    textDecorationColor: 'color-mix(in oklab, var(--fg1), transparent 78%)',
    ':hover': {
      color: 'var(--fg0)',
      textDecorationColor: 'var(--fg0)',
    },
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: 'var(--blue)',
      outlineOffset: '3px',
    },
  },
  contact: {
    color: 'var(--fg1)',
    textDecorationLine: 'none',
    transitionProperty: 'color',
    transitionDuration: '150ms',
    ':hover': {
      color: 'var(--fg0)',
    },
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: 'var(--blue)',
      outlineOffset: '3px',
    },
  },
  secondarySeparator: {
    userSelect: 'none',
    color: 'color-mix(in oklab, var(--fg2), transparent 35%)',
  },
})
