import {
  contentCanonicalPath,
  formatContentDateCardGrid,
  getPublishedEntries,
} from '@/lib/content'

export type CardGridFilter = 'all' | 'projects' | 'notes' | 'music'
export type CardGridThumbnail = 'editor'

export type CardGridSerializableItem =
  | {
      kind: 'writing'
      category: 'projects' | 'notes'
      sortDate: string
      slug: string
      title: string
      dateLabel: string
      href: string
      videoSrc?: string
      posterSrc?: string
      thumbnail?: CardGridThumbnail
    }
  | {
      kind: 'artifact'
      category: 'music'
      sortDate: string
      title: string
      dateLabel: string
      href: string
      videoSrc: string
      posterSrc: string
    }

interface ArtifactEntry {
  title: string
  date: string
  href: string
  videoSrc: string
  posterSrc: string
}

/** Bespoke card thumbnails keyed by content registry path. */
const WRITING_THUMBNAILS: Record<string, CardGridThumbnail> = {
  'notes/purpose-of-writing': 'editor',
}

const artifacts: ArtifactEntry[] = [
  {
    title: 'Stravinsky: Le Sacre du Printemps',
    date: '2023-04-01',
    href: 'https://youtu.be/mUGqOE6hAUA?si=QF2wAeMQhvD56yHK',
    videoSrc: '/artifacts/yale-dance-lab.mp4',
    posterSrc: '/artifacts/yale-dance-lab-poster.webp',
  },
  {
    title: 'YSO Halloween Show',
    date: '2022-10-01',
    href: 'https://youtu.be/WlSkFFIchMw?si=mGwrEpNj6yfEMmcc',
    videoSrc: '/artifacts/yso-halloween.mp4',
    posterSrc: '/artifacts/yso-halloween-poster.webp',
  },
  {
    title: 'Rimsky-Korsakov: Scheherazade',
    date: '2022-03-01',
    href: 'https://youtu.be/7DqunJ6kFoU?si=am_9A10YKeiwEUR7&t=6',
    videoSrc: '/artifacts/scheherazade.mp4',
    posterSrc: '/artifacts/scheherazade-poster.webp',
  },
  {
    title: 'R. Strauss: Eine Alpensinfonie',
    date: '2019-08-01',
    href: 'https://youtu.be/4rajIRu84Bk?si=_w1r3Vu2SEllKNsH',
    videoSrc: '/artifacts/alpensinfonie.mp4',
    posterSrc: '/artifacts/alpensinfonie-poster.webp',
  },
  {
    title: 'NYO-USA: BBC Proms',
    date: '2019-08-01',
    href: 'https://youtu.be/VrcXomyo1yI?si=yQnD_OzlZ8pKsPWH',
    videoSrc: '/artifacts/bbc-proms.mp4',
    posterSrc: '/artifacts/bbc-proms-poster.webp',
  },
  {
    title: 'Prokofiev: Symphony No. 5',
    date: '2019-08-01',
    href: 'https://youtu.be/rpyJp9MEnAE?si=yqsxIOrXO_ptMv8j&t=23',
    videoSrc: '/artifacts/prokofiev.mp4',
    posterSrc: '/artifacts/prokofiev-poster.webp',
  },
]

export function buildCardGridItems(): CardGridSerializableItem[] {
  const writingItems: CardGridSerializableItem[] = getPublishedEntries().map((entry) => {
    const registryKey = `${entry.kind}/${entry.slug}`
    return {
      kind: 'writing' as const,
      category: entry.kind,
      sortDate: entry.date,
      slug: entry.slug,
      title: entry.title,
      dateLabel: formatContentDateCardGrid(entry.date),
      href: contentCanonicalPath(entry.kind, entry.slug),
      posterSrc: entry.cardImage,
      thumbnail: WRITING_THUMBNAILS[registryKey],
    }
  })

  const artifactItems: CardGridSerializableItem[] = artifacts.map((artifact) => ({
    kind: 'artifact',
    category: 'music',
    sortDate: artifact.date,
    title: artifact.title,
    dateLabel: formatContentDateCardGrid(artifact.date),
    href: artifact.href,
    videoSrc: artifact.videoSrc,
    posterSrc: artifact.posterSrc,
  }))

  return [...writingItems, ...artifactItems].sort((a, b) =>
    b.sortDate.localeCompare(a.sortDate)
  )
}
