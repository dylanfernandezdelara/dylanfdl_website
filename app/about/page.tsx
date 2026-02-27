import ExternalLink from '@/components/ExternalLink'
import RainbowText from '@/components/RainbowText'
import SectionHeading from '@/components/SectionHeading'
import VisitorCounter from '@/components/VisitorCounter'
import WritingSection from '@/components/WritingSection'
import PageSearchPalette from '@/components/PageSearchPalette'
import type { Metadata } from 'next'

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

        <SectionHeading
          className="text-fg2 [--section-heading-font-size:1.25rem] [--section-heading-margin-bottom:0.5rem] [--section-heading-margin-top:3rem] min-[481px]:[--section-heading-font-size:1.375rem] min-[481px]:[--section-heading-margin-top:4rem] md:[--section-heading-font-size:1.5rem] md:[--section-heading-margin-top:3rem]"
        >
          Artifacts
        </SectionHeading>

        <ul className="mb-6 list-[circle] pl-6 text-[0.9rem] text-gray">
          <li className="py-1 leading-[1.45] text-fg3 min-[481px]:py-0 min-[481px]:leading-[1.35]">
            <ExternalLink
              href="https://youtu.be/WlSkFFIchMw?si=mGwrEpNj6yfEMmcc"
              thinGreyUnderline
              allowWrap
              className="text-fg3"
            >
              Yale Symphony Orchestra Halloween Show
            </ExternalLink>
          </li>
          <li className="py-1 leading-[1.45] text-fg3 min-[481px]:py-0 min-[481px]:leading-[1.35]">
            <ExternalLink
              href="https://youtu.be/mUGqOE6hAUA?si=QF2wAeMQhvD56yHK"
              thinGreyUnderline
              allowWrap
              className="text-fg3"
            >
              Yale Dance Lab and Yale Symphony Orchestra perform Stravinsky's Le Sacre du Printemps
            </ExternalLink>
          </li>
          <li className="py-1 leading-[1.45] text-fg3 min-[481px]:py-0 min-[481px]:leading-[1.35]">
            <ExternalLink
              href="https://youtu.be/7DqunJ6kFoU?si=am_9A10YKeiwEUR7&t=6"
              thinGreyUnderline
              allowWrap
              className="text-fg3"
            >
              Yale Symphony Orchestra Rimsky-Korsakov Scheherazade
            </ExternalLink>
          </li>
          <li className="py-1 leading-[1.45] text-fg3 min-[481px]:py-0 min-[481px]:leading-[1.35]">
            <ExternalLink
              href="https://youtu.be/4rajIRu84Bk?si=_w1r3Vu2SEllKNsH"
              thinGreyUnderline
              allowWrap
              className="text-fg3"
            >
              NYO-USA 2019 R. Strauss's "Eine Alpensinfonie"
            </ExternalLink>
          </li>
          <li className="py-1 leading-[1.45] text-fg3 min-[481px]:py-0 min-[481px]:leading-[1.35]">
            <ExternalLink
              href="https://youtu.be/VrcXomyo1yI?si=yQnD_OzlZ8pKsPWH"
              thinGreyUnderline
              allowWrap
              className="text-fg3"
            >
              NYO-USA 2019 BBC Proms
            </ExternalLink>
          </li>
          <li className="py-1 leading-[1.45] text-fg3 min-[481px]:py-0 min-[481px]:leading-[1.35]">
            <ExternalLink
              href="https://youtu.be/rpyJp9MEnAE?si=yqsxIOrXO_ptMv8j&t=23"
              thinGreyUnderline
              allowWrap
              className="text-fg3"
            >
              NYO-USA 2019 Young Euro Classic Prokofiev Symphony No. 5
            </ExternalLink>
          </li>
        </ul>

        <hr className="mb-3 mt-6 border-0 border-t border-bg3 min-[481px]:mb-4 md:mb-6" />

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
