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
      {trackUrl ? (
        <ExternalLink href={trackUrl} noUnderline className="inline">
          <span ref={titleSlotRef} />
        </ExternalLink>
      ) : (
        <span ref={titleSlotRef} />
      )}{' '}
      by <span ref={artistSlotRef} />
    </>
  )
}
