import ArtifactCard from '@/components/ArtifactCard'
import SectionHeading from '@/components/SectionHeading'

interface Artifact {
  title: string
  date: string
  href: string
  videoSrc: string
  posterSrc: string
}

const artifacts: Artifact[] = [
  {
    title: 'Stravinsky — Le Sacre du Printemps',
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
    title: 'Rimsky-Korsakov — Scheherazade',
    date: '2022',
    href: 'https://youtu.be/7DqunJ6kFoU?si=am_9A10YKeiwEUR7&t=6',
    videoSrc: '/artifacts/scheherazade.mp4',
    posterSrc: '/artifacts/scheherazade-poster.jpg',
  },
  {
    title: 'R. Strauss — Eine Alpensinfonie',
    date: '2019',
    href: 'https://youtu.be/4rajIRu84Bk?si=_w1r3Vu2SEllKNsH',
    videoSrc: '/artifacts/alpensinfonie.mp4',
    posterSrc: '/artifacts/alpensinfonie-poster.jpg',
  },
  {
    title: 'NYO-USA — BBC Proms',
    date: '2019',
    href: 'https://youtu.be/VrcXomyo1yI?si=yQnD_OzlZ8pKsPWH',
    videoSrc: '/artifacts/bbc-proms.mp4',
    posterSrc: '/artifacts/bbc-proms-poster.jpg',
  },
  {
    title: 'Prokofiev — Symphony No. 5',
    date: '2019',
    href: 'https://youtu.be/rpyJp9MEnAE?si=yqsxIOrXO_ptMv8j&t=23',
    videoSrc: '/artifacts/prokofiev.mp4',
    posterSrc: '/artifacts/prokofiev-poster.jpg',
  },
]

export default function ArtifactsSection() {
  return (
    <>
      <SectionHeading
        className="text-fg2 [--section-heading-font-size:1.0625rem] [--section-heading-margin-bottom:0.75rem] [--section-heading-margin-top:3rem] min-[481px]:[--section-heading-font-size:1.125rem] min-[481px]:[--section-heading-margin-top:4rem] md:[--section-heading-font-size:1.125rem] md:[--section-heading-margin-top:3rem]"
      >
        Artifacts
      </SectionHeading>

      <div className="grid grid-cols-1 gap-3 min-[481px]:grid-cols-2 md:gap-4">
        {artifacts.map((artifact) => (
          <ArtifactCard key={artifact.href} {...artifact} />
        ))}
      </div>
    </>
  )
}
