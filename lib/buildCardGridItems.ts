import { formatPostDateCardGrid, getAllPosts } from '@/lib/posts'

export type CardGridFilter = 'all' | 'projects' | 'music'

export type CardGridSerializableItem =
  | {
      kind: 'essay'
      category: 'projects'
      sortDate: string
      slug: string
      title: string
      dateLabel: string
      href: string
      videoSrc?: string
      posterSrc?: string
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

const artifacts: ArtifactEntry[] = [
  {
    title: 'Stravinsky: Le Sacre du Printemps',
    date: '2023',
    href: 'https://youtu.be/mUGqOE6hAUA?si=QF2wAeMQhvD56yHK',
    videoSrc: '/artifacts/yale-dance-lab.mp4',
    posterSrc: '/artifacts/yale-dance-lab-poster.jpg',
  },
  {
    title: 'YSO Halloween Show',
    date: '2022',
    href: 'https://youtu.be/WlSkFFIchMw?si=mGwrEpNj6yfEMmcc',
    videoSrc: '/artifacts/yso-halloween.mp4',
    posterSrc: '/artifacts/yso-halloween-poster.jpg',
  },
  {
    title: 'Rimsky-Korsakov: Scheherazade',
    date: '2022',
    href: 'https://youtu.be/7DqunJ6kFoU?si=am_9A10YKeiwEUR7&t=6',
    videoSrc: '/artifacts/scheherazade.mp4',
    posterSrc: '/artifacts/scheherazade-poster.jpg',
  },
  {
    title: 'R. Strauss: Eine Alpensinfonie',
    date: '2019',
    href: 'https://youtu.be/4rajIRu84Bk?si=_w1r3Vu2SEllKNsH',
    videoSrc: '/artifacts/alpensinfonie.mp4',
    posterSrc: '/artifacts/alpensinfonie-poster.jpg',
  },
  {
    title: 'NYO-USA: BBC Proms',
    date: '2019',
    href: 'https://youtu.be/VrcXomyo1yI?si=yQnD_OzlZ8pKsPWH',
    videoSrc: '/artifacts/bbc-proms.mp4',
    posterSrc: '/artifacts/bbc-proms-poster.jpg',
  },
  {
    title: 'Prokofiev: Symphony No. 5',
    date: '2019',
    href: 'https://youtu.be/rpyJp9MEnAE?si=yqsxIOrXO_ptMv8j&t=23',
    videoSrc: '/artifacts/prokofiev.mp4',
    posterSrc: '/artifacts/prokofiev-poster.jpg',
  },
]

function artifactSortDate(date: string): string {
  if (/^\d{4}$/.test(date)) {
    return `${date}-01-01`
  }
  return date
}

export function buildCardGridItems(): CardGridSerializableItem[] {
  const posts = getAllPosts()
  const essayItems: CardGridSerializableItem[] = posts.map((post) => ({
    kind: 'essay' as const,
    category: 'projects' as const,
    sortDate: post.date,
    slug: post.slug,
    title: post.title,
    dateLabel: formatPostDateCardGrid(post.date),
    href: `/essays/${post.slug}`,
  }))

  const artifactItems: CardGridSerializableItem[] = artifacts.map((a) => ({
    kind: 'artifact',
    category: 'music',
    sortDate: artifactSortDate(a.date),
    title: a.title,
    dateLabel: a.date,
    href: a.href,
    videoSrc: a.videoSrc,
    posterSrc: a.posterSrc,
  }))

  return [...essayItems, ...artifactItems].sort((a, b) => b.sortDate.localeCompare(a.sortDate))
}
