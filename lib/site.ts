import { APEX_HOST, SITE_URL } from '../site.config.mjs'

export { APEX_HOST, SITE_URL }

export const SITE_NAME = 'dylanfdl'

export const PERSON_NAME = 'Dylan Fernandez de Lara'

export const PERSON_GIVEN_NAME = 'Dylan'

export const PERSON_FAMILY_NAME = 'Fernandez de Lara'

export const PERSON_ROLE = 'Generalist Software Engineer'

export const PERSON_PAGE_PATH = '/'

export const OG_IMAGE_PATH = '/og-image.png'

export const OG_IMAGE_WIDTH = 1200

export const OG_IMAGE_HEIGHT = 630

export const OG_IMAGE_ALT = PERSON_NAME

export const EMPLOYER_NAME = 'Meta'

export const EMPLOYER_URL = 'https://www.meta.com'

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

export const CONTACT_EMAIL = 'fernandezdelaradylan@gmail.com'

export const PERSON_LOCATION = {
  locality: 'New York',
  region: 'NY',
  country: 'US',
  countryName: 'United States',
} as const

export const DEFAULT_DESCRIPTION =
  `${PERSON_NAME}. Portfolio, projects, music.`

export const NOT_FOUND_DESCRIPTION = 'Page not found on dylanfdl.com.'

export const HOME_PAGE_TITLE = PERSON_NAME

export const ABOUT_PATH = '/about'

export const CONTACT_PATH = '/contact'

export const PRIVACY_PATH = '/privacy'

export const LLMS_TXT_PATH = '/llms.txt'

type ContactLink = {
  label: string
  href: string
  sameAs?: true
  relMe?: true
  twitterHandle?: true
}

export const CONTACT_LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com/dylanfernandezdelara',
    sameAs: true,
    relMe: true,
  },
  { label: 'Email', href: `mailto:${CONTACT_EMAIL}` },
  {
    label: 'X',
    href: 'https://x.com/dylan_fdl_',
    sameAs: true,
    relMe: true,
    twitterHandle: true,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/dylan-fernandez-de-lara-219b821a6',
    sameAs: true,
  },
  {
    label: 'Cursor',
    href: 'https://cursor.com/@dylanf',
    sameAs: true,
    relMe: true,
  },
] as const satisfies readonly ContactLink[]

export const SAME_AS = CONTACT_LINKS.filter(
  (link): link is (typeof CONTACT_LINKS)[number] & { sameAs: true } => 'sameAs' in link && link.sameAs === true
).map((link) => link.href)

export const REL_ME_URLS = CONTACT_LINKS.filter(
  (link): link is (typeof CONTACT_LINKS)[number] & { relMe: true } => 'relMe' in link && link.relMe === true
).map((link) => link.href)

const twitterProfile = CONTACT_LINKS.find(
  (link): link is (typeof CONTACT_LINKS)[number] & { twitterHandle: true } =>
    'twitterHandle' in link && link.twitterHandle === true
)

export const TWITTER_CREATOR = twitterProfile
  ? `@${new URL(twitterProfile.href).pathname.replace(/^\//, '').replace(/\/$/, '')}`
  : undefined

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href
}

export const PERSON_URL = absoluteUrl(PERSON_PAGE_PATH)

export const OG_IMAGE_URL = absoluteUrl(OG_IMAGE_PATH)

export const SITEMAP_INDEX_URL = absoluteUrl('/sitemap.xml')

export const SITE_DOCUMENT_LINKS = [
  { label: 'About', href: ABOUT_PATH },
  { label: 'Contact', href: CONTACT_PATH },
  { label: 'Privacy', href: PRIVACY_PATH },
] as const

/**
 * Shared Open Graph fields. Next.js replaces (not deep-merges) the nested
 * `openGraph` object when a page defines its own, so pages must spread this.
 */
export const OPEN_GRAPH_BASE = {
  siteName: PERSON_NAME,
  locale: 'en_US' as const,
  images: [
    {
      url: OG_IMAGE_URL,
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      alt: OG_IMAGE_ALT,
    },
  ],
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function toIsoDateTime(date: string): string {
  if (date.includes('T')) {
    return date
  }

  return `${date}T00:00:00.000Z`
}

export function buildPageTitle(options: { title?: string; profilePage?: boolean }): string {
  if (options.profilePage || !options.title) {
    return HOME_PAGE_TITLE
  }

  return `${options.title} — ${PERSON_NAME}`
}
