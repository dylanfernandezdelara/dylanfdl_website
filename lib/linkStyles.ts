const secondaryLinkDecoration =
  'hover:decoration-[color:color-mix(in_oklab,var(--fg2),transparent_35%)]'

const secondaryLinkFocus =
  'focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-3'

export const SECONDARY_LINK_BASE = [
  'text-fg2 no-underline transition-colors duration-150 hover:text-fg1 hover:underline',
  secondaryLinkDecoration,
  secondaryLinkFocus,
].join(' ')

export const CONTACT_LINK_STYLES = SECONDARY_LINK_BASE

export const SECONDARY_LINK_SEPARATOR =
  'select-none text-[color:color-mix(in_oklab,var(--fg2),transparent_35%)]'

export const BACK_LINK_CLASSES = [
  'inline-flex items-center gap-[0.4rem] text-[0.9375rem] font-semibold tracking-[0.01em]',
  SECONDARY_LINK_BASE,
  'focus-visible:no-underline',
].join(' ')
