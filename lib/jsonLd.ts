import {
  DEFAULT_DESCRIPTION,
  EMPLOYER_NAME,
  EMPLOYER_URL,
  OG_IMAGE_URL,
  PERSON_FAMILY_NAME,
  PERSON_GIVEN_NAME,
  PERSON_NAME,
  PERSON_NAME_ALTERNATES,
  PERSON_ROLE,
  PERSON_URL,
  SAME_AS,
  SITE_URL,
} from '@/lib/site'

export const SCHEMA_IDS = {
  person: `${SITE_URL}/#person`,
  publisher: `${SITE_URL}/#publisher`,
  website: `${SITE_URL}/#website`,
} as const

function personJsonLd() {
  return {
    '@type': 'Person',
    '@id': SCHEMA_IDS.person,
    name: PERSON_NAME,
    givenName: PERSON_GIVEN_NAME,
    familyName: PERSON_FAMILY_NAME,
    alternateName: [...PERSON_NAME_ALTERNATES],
    url: PERSON_URL,
    sameAs: [...SAME_AS],
    jobTitle: PERSON_ROLE,
    worksFor: {
      '@type': 'Organization',
      name: EMPLOYER_NAME,
      url: EMPLOYER_URL,
    },
  }
}

function publisherJsonLd() {
  return {
    '@type': 'Organization',
    '@id': SCHEMA_IDS.publisher,
    name: PERSON_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: OG_IMAGE_URL,
    },
  }
}

function websiteJsonLd() {
  return {
    '@type': 'WebSite',
    '@id': SCHEMA_IDS.website,
    name: PERSON_NAME,
    alternateName: [...PERSON_NAME_ALTERNATES],
    url: SITE_URL,
    publisher: { '@id': SCHEMA_IDS.publisher },
  }
}

function siteEntities() {
  return [websiteJsonLd(), publisherJsonLd(), personJsonLd()]
}

/** Home ProfilePage graph including shared site entities (matches former BaseLayout). */
export function buildHomePageJsonLd(options: {
  canonicalUrl: string
  description?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...siteEntities(),
      {
        '@type': 'ProfilePage',
        '@id': options.canonicalUrl,
        url: options.canonicalUrl,
        name: PERSON_NAME,
        description: options.description ?? DEFAULT_DESCRIPTION,
        mainEntity: { '@id': SCHEMA_IDS.person },
        isPartOf: { '@id': SCHEMA_IDS.website },
      },
    ],
  }
}

/** Essay Article graph including shared site entities (matches former BaseLayout). */
export function buildEssayPageJsonLd(options: {
  title: string
  description: string
  canonicalUrl: string
  datePublished: string
}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...siteEntities(),
      {
        '@type': 'Article',
        headline: options.title,
        description: options.description,
        datePublished: options.datePublished,
        author: { '@id': SCHEMA_IDS.person },
        publisher: { '@id': SCHEMA_IDS.publisher },
        mainEntityOfPage: options.canonicalUrl,
        isPartOf: { '@id': SCHEMA_IDS.website },
      },
    ],
  }
}
