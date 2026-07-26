import { describe, expect, it } from 'vitest'

import { cardGridBreakpointVisibility } from '../components/card-grid/constants'

describe('cardGridBreakpointVisibility', () => {
  it('keeps both trees while the breakpoint is unknown', () => {
    expect(cardGridBreakpointVisibility(null, false)).toEqual({
      showMobile: true,
      showDesktop: true,
    })
  })

  it('keeps both trees while layout is locked (enter/exit in flight)', () => {
    expect(cardGridBreakpointVisibility(false, true)).toEqual({
      showMobile: true,
      showDesktop: true,
    })
    expect(cardGridBreakpointVisibility(true, true)).toEqual({
      showMobile: true,
      showDesktop: true,
    })
  })

  it('mounts only the active tree once known and unlocked', () => {
    expect(cardGridBreakpointVisibility(false, false)).toEqual({
      showMobile: true,
      showDesktop: false,
    })
    expect(cardGridBreakpointVisibility(true, false)).toEqual({
      showMobile: false,
      showDesktop: true,
    })
  })
})
