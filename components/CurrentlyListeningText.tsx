'use client'

import { useRef } from 'react'

import 'slot-text/style.css'

import ExternalLink from '@/components/ExternalLink'
import useNowPlaying from '@/hooks/useNowPlaying'
import useNowPlayingTrackLayout from '@/hooks/useNowPlayingTrackLayout'
import { NOW_PLAYING_SLOT_CLASS } from '@/lib/nowPlayingPresentation'
import type { NowPlayingResponse } from '@/lib/spotify/types'

import '@/src/styles/now-playing-text.css'

type Props = {
  initialPayload?: NowPlayingResponse | null
}

export default function CurrentlyListeningText({ initialPayload = null }: Props) {
  const {
    visible,
    label,
    trackUrl,
    title,
    artist,
    artistSlotDisplayText,
    slotTextActive,
    titleSlotRef,
    artistSlotRef,
  } = useNowPlaying({
    initialPayload,
  })
  const containerRef = useRef<HTMLSpanElement>(null)
  const {
    layout,
    labelMeasureRef,
    trackMeasureRef,
    prefixRowRootRef,
    prefixLabelMeasureRef,
    prefixTitleMeasureRef,
  } = useNowPlayingTrackLayout(label, title, artist, containerRef)

  if (!visible || !trackUrl || title.length === 0) {
    return null
  }

  const isInline = layout === 'inline'
  const isSplit = layout === 'split'
  const isPrefixSplit = layout === 'prefix-split'

  return (
    <span ref={containerRef} className="now-playing" data-layout={layout}>
      <span className="now-playing-label">{label}</span>
      {isInline || isPrefixSplit ? ' ' : null}
      <span className="now-playing-track">
        <ExternalLink
          href={trackUrl}
          noUnderline
          allowWrap={!isInline && !isSplit && !isPrefixSplit}
          className="now-playing-title"
        >
          <span ref={titleSlotRef} className={NOW_PLAYING_SLOT_CLASS}>
            {slotTextActive ? null : title}
          </span>
        </ExternalLink>
        {isInline || isSplit ? ' ' : null}
        <span className="now-playing-artist-line">
          <span className="now-playing-by">by </span>
          <span ref={artistSlotRef} className={NOW_PLAYING_SLOT_CLASS}>
            {slotTextActive ? null : artistSlotDisplayText}
          </span>
        </span>
      </span>
      <span
        ref={labelMeasureRef}
        className="now-playing-measure now-playing-measure-label"
        aria-hidden="true"
      />
      <span
        ref={trackMeasureRef}
        className={`now-playing-measure ${NOW_PLAYING_SLOT_CLASS}`}
        aria-hidden="true"
      />
      <span
        ref={prefixRowRootRef}
        className="now-playing-measure now-playing-prefix-row-measure"
        aria-hidden="true"
      >
        <span ref={prefixLabelMeasureRef} className="now-playing-measure-label" />
        {' '}
        <span ref={prefixTitleMeasureRef} className={NOW_PLAYING_SLOT_CLASS} />
      </span>
    </span>
  )
}
