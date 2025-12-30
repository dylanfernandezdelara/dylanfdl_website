import ExternalLink from '@/components/ExternalLink'
import RainbowText from '@/components/RainbowText'
import SectionHeading from '@/components/SectionHeading'
import VisitorCounter from '@/components/VisitorCounter'
import WritingSection from '@/components/WritingSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About me',
}

const CONTENT_STYLES = {
  fontSize: '1rem',
  lineHeight: '1.6'
}

const PARAGRAPH_STYLES = {
  color: 'var(--fg1)'
}

const LIST_STYLES = {
  paddingLeft: '1.5rem',
  color: 'var(--gray)',
  listStyleType: 'disc' as const,
  fontSize: '1rem'
}

const LIST_ITEM_STYLES = {
  marginBlock: '0.125rem'
}

const ARTIFACTS_LIST_STYLES = {
  paddingLeft: '1.5rem',
  color: 'var(--gray)',
  listStyleType: 'circle' as const,
  fontSize: '0.9rem'
}

const ARTIFACTS_LIST_ITEM_STYLES = {
  marginBlock: '0.3rem'
}

const CONTACT_SECTION_STYLES = {
  fontSize: '0.875rem',
  color: 'var(--fg2)'
}

export default function About() {
  return (
    <>
      <div className="content-wrapper about-content-wrapper">
        <div style={CONTENT_STYLES}>
          <p className="about-paragraph" style={PARAGRAPH_STYLES}>
            I'm Dylan. I am an{' '}
            <RainbowText text="optimist." />
          </p>

          <p className="about-paragraph" style={PARAGRAPH_STYLES}>
            I am a Yale graduate and an engineer on the{' '}
            <ExternalLink href="https://www.meta.com/ai-glasses/meta-ray-ban-display/">
              Wearables
            </ExternalLink>
            {' '}Core OS team at Meta in New York.
          </p>

          <p className="about-paragraph" style={PARAGRAPH_STYLES}>
            I've been using ML to improve stability across our hardware fleet and scaling infrastructure to support a growing number of{' '}
            <ExternalLink href="https://www.meta.com/ai-glasses/">
              devices.
            </ExternalLink>
          </p>

          <WritingSection />

          <SectionHeading
            className="about-section-heading fun-artifacts-heading fun-artifacts-section-heading"
            style={{ color: 'var(--fg2)' }}
          >
            Artifacts
          </SectionHeading>

          <ul className="about-list" style={ARTIFACTS_LIST_STYLES}>
            <li style={ARTIFACTS_LIST_ITEM_STYLES}>
              <ExternalLink href="https://youtu.be/WlSkFFIchMw?si=A3N296fd7kTbMch1" thinGreyUnderline allowWrap>
                Yale Symphony Orchestra Halloween Show
              </ExternalLink>
            </li>
            <li style={ARTIFACTS_LIST_ITEM_STYLES}>
              <ExternalLink href="https://youtu.be/mUGqOE6hAUA?si=QF2wAeMQhvD56yHK" thinGreyUnderline allowWrap>
                Yale Dance Lab and Yale Symphony Orchestra perform Stravinsky's Le Sacre du Printemps
              </ExternalLink>
            </li>
            <li style={ARTIFACTS_LIST_ITEM_STYLES}>
              <ExternalLink href="https://youtu.be/4rajIRu84Bk?si=_w1r3Vu2SEllKNsH" thinGreyUnderline allowWrap>
                NYO-USA 2019 R. Strauss's "Eine Alpensinfonie"
              </ExternalLink>
            </li>
          </ul>

          <hr className="about-hr" />

          <div className="contactMeta" style={CONTACT_SECTION_STYLES}>
            <a
              className="contactMeta__link"
              href="https://www.threads.com/@dylan.fernandezdelara"
            >
              Threads
            </a>
            <span className="contactMeta__dot" aria-hidden="true">·</span>
            <a className="contactMeta__link" href="https://x.com/dylan_fdl_">
              Twitter
            </a>
            <span className="contactMeta__dot" aria-hidden="true">·</span>
            <a className="contactMeta__link" href="mailto:fernandezdelaradylan@gmail.com">Email</a>
            <span className="contactMeta__dot" aria-hidden="true">·</span>
            <VisitorCounter />
          </div>
        </div>
      </div>
    </>
  )
}
