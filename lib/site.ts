export const SITE_URL = 'https://dylanfdl.com'

export const SITE_NAME = 'dylanfdl'

export const PERSON_NAME = 'Dylan Fernandez de Lara'

export const PERSON_GIVEN_NAME = 'Dylan'

export const PERSON_FAMILY_NAME = 'Fernandez de Lara'

export const PERSON_TAGLINE = 'Engineer at Meta · Applied AI'

/**
 * Common name and handle spellings for structured data (schema.org alternateName).
 * Canonical display name remains PERSON_NAME everywhere user-facing.
 */
export const PERSON_NAME_ALTERNATES = [
  'Dylan Fernandez',
  'Dylan Fernandez de lara',
  'Dylan Lara',
  'Dylan fernandezdelara',
  'Dylan F',
  SITE_NAME,
  'dylan_fdl_',
  'dylanfernandezdelara',
] as const

export const DEFAULT_DESCRIPTION =
  'Dylan Fernandez de Lara (Dylan Fernandez, Dylan Lara, dylanfdl) is an engineer at Meta working on Applied AI. Portfolio, projects, essays, and music.'

/** Title for the main profile page — full name first for name-based searches. */
export const HOME_PAGE_TITLE = `${PERSON_NAME} — ${PERSON_TAGLINE}`

/** Public profile URLs used for identity signals (JSON-LD sameAs, rel=me). */
export const SAME_AS = [
  'https://github.com/dylanfernandezdelara',
  'https://x.com/dylan_fdl_',
  'https://www.linkedin.com/in/dylan-fernandez-de-lara-219b821a6',
] as const

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href
}

/** Document title: profile pages lead with the full name; inner pages lead with content. */
export function buildPageTitle(options: { title?: string; profilePage?: boolean }): string {
  if (options.profilePage || !options.title) {
    return `${HOME_PAGE_TITLE} (${SITE_NAME})`
  }

  return `${options.title} — ${PERSON_NAME}`
}
