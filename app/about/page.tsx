import ExternalLink from '@/components/ExternalLink'
import RainbowText from '@/components/RainbowText'
import VisitorCounter from '@/components/VisitorCounter'
import WritingSection from '@/components/WritingSection'
import ArtifactsSection from '@/components/ArtifactsSection'
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
      <div className="mx-auto max-w-2xl px-6 pb-8 pt-14 text-base leading-[1.6] min-[481px]:pb-10 min-[481px]:pt-12 md:px-8 md:pb-16 md:pt-16">
        <div className="max-w-reading">
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
        </div>

        <ArtifactsSection />

        <div className="max-w-reading">
          <hr className="mb-3 mt-8 border-0 border-t border-bg3 min-[481px]:mb-4 md:mb-6" />

          <div className="flex flex-wrap items-baseline gap-2 text-sm text-fg2">
            <a className={CONTACT_LINK_STYLES} href="https://github.com/dylanfernandezdelara">
              GitHub
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
            <a className={CONTACT_LINK_STYLES} href="https://x.com/dylan_fdl_">
              Twitter
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
      </div>
      <PageSearchPalette />
    </>
  )
}
