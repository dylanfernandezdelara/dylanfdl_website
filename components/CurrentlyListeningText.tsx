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
      {/* max-w-full + flex-wrap keep title/artist from overflowing on narrow/zoomed viewports.
          They rely on slot-text rendering each slot as inline-flex (.slot-text); if that changes, wrap won't engage.
          Each character is a non-shrinking cell, so wrapping occurs between cells (mid-word is accepted). */}
      {label}{' '}
      <ExternalLink href={trackUrl} noUnderline className="inline">
        <span ref={titleSlotRef} className="italic max-w-full flex-wrap" />
      </ExternalLink>{' '}
      by <span ref={artistSlotRef} className="italic max-w-full flex-wrap" />.
    </>
  )
}
