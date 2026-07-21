const linkFocus =
  'focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-3'

export const INLINE_LINK_STYLES = [
  'text-fg1 underline underline-offset-2 transition-colors duration-150',
  /* Light underline (rajan.sh decoration-border); text stays fg1. */
  'decoration-[color:color-mix(in_oklab,var(--fg1),transparent_78%)]',
  'hover:text-fg0 hover:decoration-[color:var(--fg0)]',
  linkFocus,
].join(' ')

/** Footer / contact row — same color as inline links, no underline. */
export const CONTACT_LINK_STYLES = [
  'text-fg1 no-underline transition-colors duration-150 hover:text-fg0',
  linkFocus,
].join(' ')

export const SECONDARY_LINK_SEPARATOR =
  'select-none text-[color:color-mix(in_oklab,var(--fg2),transparent_35%)]'
