'use client'

import 'slot-text/style.css'

import ExternalLink from '@/components/ExternalLink'
import useNowPlaying from '@/hooks/useNowPlaying'

export default function CurrentlyListeningText() {
  const { visible, label, trackUrl, titleSlotRef, artistSlotRef } = useNowPlaying()

  if (!visible || !trackUrl) {
    return null
  }

  return (
    <>
      {label}{' '}
      <ExternalLink href={trackUrl} noUnderline className="inline">
        <span ref={titleSlotRef} className="italic max-w-full [flex-wrap:wrap]" />
      </ExternalLink>{' '}
      by <span ref={artistSlotRef} className="italic max-w-full [flex-wrap:wrap]" />.
    </>
  )
}
