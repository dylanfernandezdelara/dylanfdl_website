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
  const { layout, measureRef } = useNowPlayingTrackLayout(label, title, artist, containerRef)

  if (!visible || !trackUrl || title.length === 0) {
    return null
  }

  const isInline = layout === 'inline'
  const isSplit = layout === 'split'

  return (
    <span ref={containerRef} className="now-playing" data-layout={layout}>
      <span className="now-playing-label">{label}</span>
      {isInline ? ' ' : null}
      <span className="now-playing-track">
        <ExternalLink
          href={trackUrl}
          noUnderline
          allowWrap={!isInline && !isSplit}
          className="now-playing-title"
        >
          <span ref={titleSlotRef} className={NOW_PLAYING_SLOT_CLASS} />
        </ExternalLink>
        {isInline || isSplit ? ' ' : null}
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
