export const SITE_URL = 'https://dylanfdl.com'

export const SITE_NAME = 'dylanfdl'

export const PERSON_NAME = 'Dylan Fernandez de Lara'

export const DEFAULT_DESCRIPTION =
  'Dylan Fernandez de Lara (dylanfdl) — engineer at Meta working on Applied AI. Portfolio, projects, essays, and music.'

/** Public profile URLs used for identity signals (JSON-LD sameAs, rel=me). */
export const SAME_AS = [
  'https://github.com/dylanfernandezdelara',
  'https://x.com/dylan_fdl_',
  'https://www.linkedin.com/in/dylan-fernandez-de-lara-219b821a6',
] as const

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href
}
