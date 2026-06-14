'use client'

import { useRef } from 'react'

import 'slot-text/style.css'

import ExternalLink from '@/components/ExternalLink'
import useNowPlaying from '@/hooks/useNowPlaying'
import useNowPlayingTrackLayout from '@/hooks/useNowPlayingTrackLayout'
import { NOW_PLAYING_SLOT_CLASS } from '@/lib/nowPlayingPresentation'

import '@/src/styles/now-playing-text.css'

export default function CurrentlyListeningText() {
  const { visible, label, trackUrl, title, artist, titleSlotRef, artistSlotRef } = useNowPlaying()
  const containerRef = useRef<HTMLSpanElement>(null)
  const { layout, measureRef } = useNowPlayingTrackLayout(title, artist, containerRef)

  if (!visible || !trackUrl || title.length === 0) {
    return null
  }

  const isCompact = layout === 'compact'

  return (
    <span ref={containerRef} className="now-playing">
      <span className="now-playing-label">{label}</span>
      <span className="now-playing-track" data-layout={layout}>
        <ExternalLink
          href={trackUrl}
          noUnderline
          allowWrap={!isCompact}
          className="now-playing-title"
        >
          <span ref={titleSlotRef} className={NOW_PLAYING_SLOT_CLASS} />
        </ExternalLink>
        {isCompact ? ' ' : null}
        <span className="now-playing-artist-line">
          <span className="now-playing-by">by </span>
          <span ref={artistSlotRef} className={NOW_PLAYING_SLOT_CLASS} />
        </span>
      </span>
      <span
        ref={measureRef}
        className={`now-playing-measure ${NOW_PLAYING_SLOT_CLASS}`}
        aria-hidden="true"
      />
    </span>
  )
}
