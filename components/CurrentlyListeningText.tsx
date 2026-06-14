'use client'

import 'slot-text/style.css'

import ExternalLink from '@/components/ExternalLink'
import useNowPlaying from '@/hooks/useNowPlaying'
import { NOW_PLAYING_SLOT_CLASS } from '@/lib/nowPlayingPresentation'

import '@/src/styles/now-playing-text.css'

export default function CurrentlyListeningText() {
  const { visible, label, trackUrl, titleSlotRef, artistSlotRef } = useNowPlaying()

  if (!visible || !trackUrl) {
    return null
  }

  return (
    <>
      {label}{' '}
      {/* max-w-full + flex-wrap wrap once slot-text adds inline-flex (.slot-text). */}
      <ExternalLink href={trackUrl} noUnderline className="inline">
        <span ref={titleSlotRef} className={NOW_PLAYING_SLOT_CLASS} />
      </ExternalLink>{' '}
      by <span ref={artistSlotRef} className={NOW_PLAYING_SLOT_CLASS} />.
    </>
  )
}
