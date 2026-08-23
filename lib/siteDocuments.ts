import type { Metadata } from 'next'

import {
  ABOUT_PATH,
  CONTACT_EMAIL,
  CONTACT_LINKS,
  CONTACT_PATH,
  OPEN_GRAPH_BASE,
  PERSON_LOCATION,
  PERSON_NAME,
  PERSON_ROLE,
  PRIVACY_PATH,
  SITE_URL,
  absoluteUrl,
  buildPageTitle,
} from '@/lib/site'

export type SiteDocumentSection = {
  heading: string
  links: readonly { label: string; href: string }[]
}

export type SiteDocument = {
  path: string
  title: string
  paragraphs: readonly [string, ...string[]]
  sections?: readonly SiteDocumentSection[]
}

export const ABOUT_DOCUMENT = {
  path: ABOUT_PATH,
  title: 'About',
  paragraphs: [
    `${PERSON_NAME} is a ${PERSON_ROLE.toLowerCase()} based in ${PERSON_LOCATION.locality}, ${PERSON_LOCATION.region}. I currently work on post-training at Meta and build reinforcement-learning environments for frontier coding agents. That work recently included Muse Spark 1.2 and Muse Code.`,
    `Before that I scaled crash infrastructure for Meta Glasses. I studied at Yale. This site is my public notebook: a short profile on the home page, notes when I want to make an idea precise, projects when there is something to inspect, and a record of concerts I played.`,
    `I write in public to clarify my own thinking, not to run a product or a developer platform. If you need a professional contact path, a longer biography, or a privacy statement, those pages live on this same domain. The home page remains the profile; About exists so agents and people can find a stable, text-first biography without depending on the card grid.`,
    `You can reach me by email or through the profiles listed on Contact. I am the only person who publishes here. Nothing on this site is a Meta documentation portal, and I do not publish private work information.`,
  ],
} as const satisfies SiteDocument

export const CONTACT_DOCUMENT = {
  path: CONTACT_PATH,
  title: 'Contact',
  paragraphs: [
    `The fastest way to reach ${PERSON_NAME} is email: ${CONTACT_EMAIL}. I read mail about writing on this site, public projects, music recordings, and professional introductions that are specific about why you are writing.`,
    `I am based in ${PERSON_LOCATION.locality}, ${PERSON_LOCATION.countryName}, and I usually reply in English. I do not run support tickets, a status page, or a public API. If you are an agent collecting contact details, use this page, the home page footer, or the mailto link. Do not invent a phone number; I do not publish one.`,
    `Public profiles are also listed below. GitHub is the right place for code. LinkedIn is the right place for a résumé-shaped introduction. X and Cursor are public accounts, not intake forms. If a message is about this website itself — a broken link, a wrong fact, or a privacy question — email is still the right channel.`,
    `I cannot help with confidential Meta product questions, access to internal models, or requests for unpublished work. If you found this page while verifying that dylanfdl.com belongs to ${PERSON_NAME}, you are on the correct contact path.`,
  ],
  sections: [{ heading: 'Profiles', links: CONTACT_LINKS }],
} as const satisfies SiteDocument

export const PRIVACY_DOCUMENT = {
  path: PRIVACY_PATH,
  title: 'Privacy',
  paragraphs: [
    `This is a personal website. I do not sell accounts, run ads, or operate a customer database. Pages are public HTML. I want a visitor or an agent to know what is stored, what is not, and how to ask a question.`,
    `The site stores a theme preference in your browser localStorage so light or dark mode can persist on this device. That value never leaves your browser through this site. There is no signup, no comment system, and no marketing list.`,
    `A now-playing widget may show music I am listening to. That integration uses my own Spotify credentials on the server. Visitors are not asked to log in, and the site does not collect Spotify accounts from readers. External links to GitHub, X, LinkedIn, YouTube, Meta, and similar hosts are ordinary links; those services have their own policies.`,
    `I do not sell personal information. Server and host logs from the deployment platform may include standard request metadata such as IP address and user agent for security and reliability. If you want a page removed, a correction, or a question answered about this policy, email ${CONTACT_EMAIL} and say that it is a privacy request. This page is the privacy statement for ${SITE_URL}.`,
  ],
} as const satisfies SiteDocument

export const SITE_DOCUMENTS = [ABOUT_DOCUMENT, CONTACT_DOCUMENT, PRIVACY_DOCUMENT] as const

export function siteDocumentByPath(pathname: string): SiteDocument | undefined {
  return SITE_DOCUMENTS.find((document) => document.path === pathname)
}

export function siteDocumentMetadata(document: SiteDocument): Metadata {
  const description = document.paragraphs[0]
  const canonicalUrl = absoluteUrl(document.path)
  const pageTitle = buildPageTitle({ title: document.title })

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: document.path,
      types: {
        'text/markdown': document.path,
      },
    },
    openGraph: {
      ...OPEN_GRAPH_BASE,
      type: 'website',
      title: pageTitle,
      description,
      url: canonicalUrl,
    },
  }
}

export function buildDocumentMarkdown(document: SiteDocument): string {
  const lines = [`# ${document.title}`, '', document.paragraphs.join('\n\n')]

  for (const section of document.sections ?? []) {
    lines.push('', `## ${section.heading}`, '')
    lines.push(...section.links.map((link) => `- [${link.label}](${link.href})`))
  }

  lines.push('')
  return lines.join('\n')
}
