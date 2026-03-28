import ArtifactsCarousel from '@/components/ArtifactsCarousel'
import ExternalLink from '@/components/ExternalLink'
import RainbowText from '@/components/RainbowText'
import SectionHeading from '@/components/SectionHeading'
import VisitorCounter from '@/components/VisitorCounter'
import WritingSection from '@/components/WritingSection'
import PageSearchPalette from '@/components/PageSearchPalette'
import type { Metadata } from 'next'

const ARTIFACT_VIDEOS = [
  {
    href: 'https://youtu.be/WlSkFFIchMw?si=mGwrEpNj6yfEMmcc',
    videoId: 'WlSkFFIchMw',
  },
  {
    href: 'https://youtu.be/mUGqOE6hAUA?si=QF2wAeMQhvD56yHK',
    videoId: 'mUGqOE6hAUA',
  },
  {
    href: 'https://youtu.be/7DqunJ6kFoU?si=am_9A10YKeiwEUR7&t=6',
    videoId: '7DqunJ6kFoU',
  },
  {
    href: 'https://youtu.be/4rajIRu84Bk?si=_w1r3Vu2SEllKNsH',
    videoId: '4rajIRu84Bk',
  },
  {
    href: 'https://youtu.be/VrcXomyo1yI?si=yQnD_OzlZ8pKsPWH',
    videoId: 'VrcXomyo1yI',
  },
  {
    href: 'https://youtu.be/rpyJp9MEnAE?si=yqsxIOrXO_ptMv8j&t=23',
    videoId: 'rpyJp9MEnAE',
  },
] as const

export const metadata: Metadata = {
  title: 'About me',
}

const CONTACT_LINK_STYLES =
  'text-fg2 no-underline transition-colors duration-150 hover:text-fg1 hover:underline hover:decoration-[color:color-mix(in_oklab,var(--fg2),transparent_35%)] focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-3'

export default function About() {
  return (
    <>
      <div className="mx-auto max-w-reading px-6 pb-8 pt-14 text-base leading-[1.6] min-[481px]:pb-10 min-[481px]:pt-12 md:px-8 md:pb-16 md:pt-16">
        <p className="mb-3 text-fg1 min-[481px]:mb-4 md:mb-6">
          I'm Dylan. I am an{' '}
          <RainbowText text="optimist." />
        </p>

        <p className="mb-3 text-fg1 min-[481px]:mb-4 md:mb-6">
          I am a Yale graduate and an engineer on the{' '}
          <ExternalLink href="https://www.meta.com/ai-glasses/meta-ray-ban-display/">
            Wearables
          </ExternalLink>
          {' '}Core OS team at Meta.
        </p>

        <p className="mb-3 text-fg1 min-[481px]:mb-4 md:mb-6">
          I've been using ML to improve stability across our hardware fleet and scaling infrastructure to support a growing number of{' '}
          <ExternalLink href="https://www.meta.com/ai-glasses/">
            devices.
          </ExternalLink>
        </p>

        <WritingSection />

        <section
          className="mt-[var(--section-heading-margin-top,3rem)] min-[481px]:mt-[4rem] md:mt-[3rem]"
          aria-labelledby="artifacts-heading"
        >
          <SectionHeading
            id="artifacts-heading"
            className="mt-0 text-fg2 [--section-heading-font-size:1.0625rem] [--section-heading-margin-bottom:1rem] [--section-heading-margin-top:0] min-[481px]:[--section-heading-font-size:1.125rem] md:[--section-heading-font-size:1.125rem]"
          >
            Artifacts
          </SectionHeading>

          <div className="flex w-full flex-col items-center pb-2 pt-1 md:pb-4 md:pt-2">
            <ArtifactsCarousel items={[...ARTIFACT_VIDEOS]} />
          </div>
        </section>

        <hr className="mb-3 mt-8 border-0 border-t border-bg3 min-[481px]:mb-4 min-[481px]:mt-10 md:mb-6 md:mt-12" />

        <div className="flex flex-wrap items-baseline gap-2 text-sm text-fg2">
          <a className={CONTACT_LINK_STYLES} href="https://www.threads.com/@dylan.fernandezdelara">
            Threads
          </a>
          <span
            className="select-none text-[color:color-mix(in_oklab,var(--fg2),transparent_35%)]"
            aria-hidden="true"
          >
            ·
          </span>
          <a className={CONTACT_LINK_STYLES} href="https://x.com/dylan_fdl_">
            Twitter
          </a>
          <span
            className="select-none text-[color:color-mix(in_oklab,var(--fg2),transparent_35%)]"
            aria-hidden="true"
          >
            ·
          </span>
          <a className={CONTACT_LINK_STYLES} href="mailto:fernandezdelaradylan@gmail.com">
            Email
          </a>
          <span
            className="select-none text-[color:color-mix(in_oklab,var(--fg2),transparent_35%)]"
            aria-hidden="true"
          >
            ·
          </span>
          <VisitorCounter />
        </div>
      </div>
      <PageSearchPalette />
    </>
  )
}
