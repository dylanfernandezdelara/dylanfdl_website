'use client'

import 'slot-text/style.css'

import ExternalLink from '@/components/ExternalLink'
import useNowPlaying from '@/hooks/useNowPlaying'

export default function CurrentlyListeningText() {
  const { visible, label, trackUrl, titleSlotRef, artistSlotRef } = useNowPlaying()

  if (!visible) {
    return null
  }

  return (
    <>
      {label}{' '}
      <ExternalLink
        href={trackUrl ?? '#'}
        noUnderline
        className="inline"
        onClick={trackUrl ? undefined : (event) => event.preventDefault()}
      >
        <span ref={titleSlotRef} />
      </ExternalLink>{' '}
      by <span ref={artistSlotRef} />.
    </>
  )
}
