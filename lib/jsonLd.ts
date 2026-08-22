import {
  CONTACT_EMAIL,
  CONTACT_PATH,
  DEFAULT_DESCRIPTION,
  EMPLOYER_NAME,
  EMPLOYER_URL,
  OG_IMAGE_URL,
  PERSON_FAMILY_NAME,
  PERSON_GIVEN_NAME,
  PERSON_LOCATION,
  PERSON_NAME,
  PERSON_NAME_ALTERNATES,
  PERSON_ROLE,
  PERSON_URL,
  SAME_AS,
  SITE_URL,
  absoluteUrl,
} from '@/lib/site'

export const SCHEMA_IDS = {
  person: `${SITE_URL}/#person`,
  publisher: `${SITE_URL}/#publisher`,
  website: `${SITE_URL}/#website`,
} as const

function postalAddressJsonLd() {
  return {
    '@type': 'PostalAddress',
    addressLocality: PERSON_LOCATION.locality,
    addressRegion: PERSON_LOCATION.region,
    addressCountry: PERSON_LOCATION.country,
  }
}

function contactPointJsonLd() {
  return {
    '@type': 'ContactPoint',
    contactType: 'author',
    email: CONTACT_EMAIL,
    url: absoluteUrl(CONTACT_PATH),
    availableLanguage: ['English'],
  }
}

function personJsonLd() {
  return {
    '@type': 'Person',
    '@id': SCHEMA_IDS.person,
    name: PERSON_NAME,
    givenName: PERSON_GIVEN_NAME,
    familyName: PERSON_FAMILY_NAME,
    alternateName: [...PERSON_NAME_ALTERNATES],
    description: DEFAULT_DESCRIPTION,
    url: PERSON_URL,
    email: CONTACT_EMAIL,
    image: OG_IMAGE_URL,
    sameAs: [...SAME_AS],
    jobTitle: PERSON_ROLE,
    address: postalAddressJsonLd(),
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
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    email: CONTACT_EMAIL,
    sameAs: [...SAME_AS],
    logo: {
      '@type': 'ImageObject',
      url: OG_IMAGE_URL,
    },
    address: postalAddressJsonLd(),
    contactPoint: contactPointJsonLd(),
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

export function buildDocumentPageJsonLd(options: {
  canonicalUrl: string
  name: string
  description: string
}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...siteEntities(),
      {
        '@type': 'WebPage',
        '@id': options.canonicalUrl,
        url: options.canonicalUrl,
        name: options.name,
        description: options.description,
        isPartOf: { '@id': SCHEMA_IDS.website },
        about: { '@id': SCHEMA_IDS.person },
      },
    ],
  }
}

export function buildArticlePageJsonLd(options: {
  title: string
  description: string
  canonicalUrl: string
  datePublished: string
  dateModified?: string
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
        ...(options.dateModified ? { dateModified: options.dateModified } : {}),
        author: { '@id': SCHEMA_IDS.person },
        publisher: { '@id': SCHEMA_IDS.publisher },
        mainEntityOfPage: options.canonicalUrl,
        isPartOf: { '@id': SCHEMA_IDS.website },
      },
    ],
  }
}
