/**
 * @vitest-environment happy-dom
 */
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import ExternalLink from '@/components/ExternalLink'
import { formatArtistWithTrailingPeriod } from '@/lib/nowPlaying/trackLayout'
import { NOW_PLAYING_SLOT_CLASS } from '@/lib/nowPlaying/trackLayout'
import { NOW_PLAYING_LAYOUT_SCENARIOS } from '@/tests/fixtures/nowPlayingLayoutScenarios'

const stackedPeriodScenario = NOW_PLAYING_LAYOUT_SCENARIOS.find(
  (scenario) => scenario.id === 'mobile-artist-period-boundary',
)!
const stackedLongArtistScenario = NOW_PLAYING_LAYOUT_SCENARIOS.find(
  (scenario) => scenario.id === 'mobile-ariana-long-title',
)!

function assertArtistPeriodGluedInSlot(root: HTMLElement): void {
  const artistLine = root.querySelector('.now-playing-artist-line')
  expect(artistLine).not.toBeNull()

  const artistSlot = artistLine!.querySelector('.now-playing-slot')
  expect(artistSlot).not.toBeNull()
  expect(artistSlot!.textContent).toMatch(/\.$/)

  for (const node of artistLine!.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      expect(node.textContent?.trim()).not.toBe('.')
    }
  }
}

type StackedArtistLineProbeProps = {
  label: string
  title: string
  artistSlotDisplayText: string
  trackUrl: string
}

/** Mirrors CurrentlyListeningText stacked markup without CSS side-effect imports. */
function StackedArtistLineProbe({
  label,
  title,
  artistSlotDisplayText,
  trackUrl,
}: StackedArtistLineProbeProps) {
  return (
    <span className="now-playing" data-layout="stacked">
      <span className="now-playing-label">{label}</span>
      <span className="now-playing-track">
        <ExternalLink href={trackUrl} noUnderline allowWrap className="now-playing-title">
          <span className={NOW_PLAYING_SLOT_CLASS}>{title}</span>
        </ExternalLink>
        <span className="now-playing-artist-line">
          <span className="now-playing-by">by </span>
          <span className={NOW_PLAYING_SLOT_CLASS}>{artistSlotDisplayText}</span>
        </span>
      </span>
    </span>
  )
}

describe('CurrentlyListeningText stacked layout DOM', () => {
  afterEach(() => {
    cleanup()
  })

  it.each([
    {
      scenario: stackedPeriodScenario,
      reason: 'artist row including trailing period exceeds mobile width',
    },
    {
      scenario: stackedLongArtistScenario,
      reason: 'long mobile title forces title and artist onto separate rows',
    },
  ])('keeps the trailing period inside the artist slot ($scenario.id)', ({ scenario }) => {
    const artistSlotDisplayText = formatArtistWithTrailingPeriod(scenario.artist)

    const { container } = render(
      <StackedArtistLineProbe
        label={scenario.label}
        title={scenario.title}
        artistSlotDisplayText={artistSlotDisplayText}
        trackUrl="https://open.spotify.com/track/test"
      />,
    )
    const root = container.querySelector<HTMLElement>('.now-playing')

    expect(root?.getAttribute('data-layout')).toBe('stacked')
    assertArtistPeriodGluedInSlot(root!)
    expect(container.querySelector('.now-playing-artist-line .now-playing-slot')?.textContent).toBe(
      artistSlotDisplayText,
    )
  })
})
