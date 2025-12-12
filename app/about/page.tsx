import Header from '@/components/Header'
import ExternalLink from '@/components/ExternalLink'
import RainbowText from '@/components/RainbowText'
import PageHeader from '@/components/PageHeader'
import SectionHeading from '@/components/SectionHeading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About me',
}

const CONTENT_STYLES = {
  fontSize: '1rem',
  lineHeight: '1.6'
}

const PARAGRAPH_STYLES = {
  marginBottom: '1.5rem',
  color: 'var(--fg1)'
}

const LIST_STYLES = {
  marginBottom: '1.5rem',
  paddingLeft: '1.5rem',
  color: 'var(--gray)',
  listStyleType: 'disc' as const
}

const LIST_ITEM_STYLES = {
  marginBottom: '0.25rem'
}

const HR_STYLES = {
  border: 'none',
  borderTop: '1px solid var(--bg3)',
  marginTop: '3rem',
  marginBottom: '1.5rem'
}

const CONTACT_SECTION_STYLES = {
  fontSize: '1rem',
  color: 'var(--fg2)'
}

export default function About() {
  return (
    <>
      <Header />

      <div className="content-wrapper" style={{
        paddingTop: '2rem',
        paddingBottom: '4rem'
      }}>
        <div style={CONTENT_STYLES}>
          <PageHeader title="About me" />

          <p style={PARAGRAPH_STYLES}>
            I'm Dylan.
          </p>

          <p style={PARAGRAPH_STYLES}>
            I am an{' '}
            <RainbowText text="optimist" />
            {' '}and believe that technology can be used for good.
          </p>

          <p style={PARAGRAPH_STYLES}>
            I am a Yale graduate and based in New York.
            <br />
            I am an engineer on the Core OS team in{' '}
            <ExternalLink href="https://www.meta.com/ai-glasses/meta-ray-ban-display/">
              Wearables
            </ExternalLink>
            {' '}at Meta Reality Labs.
          </p>

          <p style={PARAGRAPH_STYLES}>
            My recent work involves training ML models to reduce crashes in our lab, building out an Android crash reporting 
            service and scaling server infrastructure to support an increasing number of devices.
          </p>

          <SectionHeading>Fun artifacts</SectionHeading>

          <ul style={LIST_STYLES}>
            <li style={LIST_ITEM_STYLES}>
              <ExternalLink href="https://youtu.be/WlSkFFIchMw?si=A3N296fd7kTbMch1">
                Yale Symphony Orchestra Halloween Show (me acting ?!)
              </ExternalLink>
            </li>
            <li style={LIST_ITEM_STYLES}>
              <ExternalLink href="https://youtu.be/4rajIRu84Bk?si=_w1r3Vu2SEllKNsH">
                NYO-USA 2019 R. Strauss's "Eine Alpensinfonie"
              </ExternalLink>
            </li>
          </ul>

          <hr style={HR_STYLES} />

          <div className="contactMeta" style={CONTACT_SECTION_STYLES}>
            <span className="contactMeta__label">Let&apos;s chat</span>
            <span className="contactMeta__dot" aria-hidden="true">·</span>
            <a className="contactMeta__link" href="#">Email</a>
            <span className="contactMeta__dot" aria-hidden="true">·</span>
            <a className="contactMeta__link" href="#">Threads</a>
          </div>
        </div>
      </div>
    </>
  )
}
