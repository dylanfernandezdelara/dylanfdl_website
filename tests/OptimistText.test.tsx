/**
 * @vitest-environment happy-dom
 */
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import OptimistText from '../components/OptimistText'

type MediaListener = (event: MediaQueryListEvent) => void

function stubMatchMedia(initialMatches: boolean) {
  let matches = initialMatches
  let changeHandler: MediaListener | null = null

  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      get matches() {
        return matches
      },
      media: query,
      addEventListener: (type: string, listener: MediaListener) => {
        if (type === 'change') {
          changeHandler = listener
        }
      },
      removeEventListener: vi.fn(),
    })),
  )

  return {
    setMatches(nextMatches: boolean) {
      matches = nextMatches
      changeHandler?.({ matches: nextMatches } as MediaQueryListEvent)
    },
  }
}

describe('OptimistText', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
    HTMLElement.prototype.getAnimations = () => []
  })

  afterEach(() => {
    cleanup()
  })

  it('renders a native button when interactive', async () => {
    stubMatchMedia(false)
    const { container } = render(<OptimistText />)

    await waitFor(() => {
      expect(container.querySelector('.optimist-text-content.slot-text')).not.toBeNull()
    })

    const trigger = container.querySelector('button.optimist-text-trigger')
    expect(trigger).not.toBeNull()
    expect(trigger?.getAttribute('type')).toBe('button')
  })

  it('is not tab-focusable when reduced motion is preferred', async () => {
    stubMatchMedia(true)
    const { container } = render(<OptimistText />)

    await waitFor(() => {
      expect(container.querySelector('.optimist-text-content .rainbow-letter')).not.toBeNull()
    })

    expect(container.querySelector('button')).toBeNull()
    const trigger = container.querySelector('span.optimist-text-trigger')
    expect(trigger?.hasAttribute('tabindex')).toBe(false)
  })

  it('exposes an accessible label when ready and motion is allowed', async () => {
    stubMatchMedia(false)
    const { container } = render(<OptimistText />)

    await waitFor(() => {
      expect(container.querySelector('.optimist-text-content.slot-text')).not.toBeNull()
    })

    const trigger = container.querySelector('button.optimist-text-trigger')
    expect(trigger?.getAttribute('aria-label')).toBe('optimist. — press to animate')
  })

  it('drops slot-text DOM when switching from interactive to reduced-motion static mode', async () => {
    const media = stubMatchMedia(false)
    const { container } = render(<OptimistText />)

    await waitFor(() => {
      expect(container.querySelector('.optimist-text-content .char-slot')).not.toBeNull()
    })

    media.setMatches(true)

    await waitFor(() => {
      expect(container.querySelector('button')).toBeNull()
      expect(container.querySelector('.optimist-text-content .char-slot')).toBeNull()
      expect(container.querySelector('.optimist-text-content .rainbow-letter')).not.toBeNull()
    })

    expect(container.querySelectorAll('.optimist-text-content .rainbow-letter')).toHaveLength(
      'optimist.'.length,
    )
  })

  it('starts a roll on click when interactive', async () => {
    stubMatchMedia(false)
    const { container } = render(<OptimistText />)

    await waitFor(() => {
      expect(container.querySelector('.optimist-text-content.slot-text')).not.toBeNull()
    })

    const trigger = container.querySelector('button.optimist-text-trigger') as HTMLElement
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(trigger.getAttribute('aria-busy')).toBe('true')
    })
    expect(container.querySelector('.optimist-text-content.is-rolling')).not.toBeNull()
  })
})
