/**
 * @vitest-environment happy-dom
 */
import { beforeEach, describe, expect, it } from 'vitest'

import {
  RAINBOW_ANIMATION_NAME,
  readRainbowPhaseMs,
  syncRainbowFaces,
} from '../lib/rainbowPhaseSync'

function mountRainbowLetter(phaseMs: number): HTMLElement {
  const container = document.createElement('span')
  const letter = document.createElement('span')
  letter.className = 'rainbow-letter'
  letter.style.animation = `${RAINBOW_ANIMATION_NAME} 15s linear infinite`
  letter.style.animationDelay = `-${phaseMs}ms`
  container.appendChild(letter)
  document.body.appendChild(container)
  return container
}

function mountCharSlot(delayMs: number): HTMLElement {
  const container = document.createElement('span')
  const slot = document.createElement('span')
  slot.className = 'char-slot'

  for (const faceIndex of [0, 1]) {
    const face = document.createElement('span')
    face.className = 'char-face'
    face.style.animation = `${RAINBOW_ANIMATION_NAME} 15s linear infinite`
    face.style.animationDelay = `-${delayMs + faceIndex}ms`
    slot.appendChild(face)
  }

  container.appendChild(slot)
  document.body.appendChild(container)
  return container
}

describe('readRainbowPhaseMs', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('reads phase from static rainbow letters', () => {
    const container = mountRainbowLetter(1200)
    const letter = container.querySelector('.rainbow-letter') as HTMLElement
    letter.getAnimations = () => [
      { animationName: RAINBOW_ANIMATION_NAME, currentTime: 1200 },
    ] as unknown as Animation[]

    expect(readRainbowPhaseMs(container, 15_000)).toBe(1200)
  })

  it('derives phase from negative animation delay when currentTime is zero', () => {
    const container = document.createElement('span')
    const letter = document.createElement('span')
    letter.className = 'rainbow-letter'
    letter.style.animation = `${RAINBOW_ANIMATION_NAME} 15s linear infinite`
    letter.style.animationDelay = '-4200ms'
    letter.getAnimations = () => [
      { animationName: RAINBOW_ANIMATION_NAME, currentTime: 0 },
    ] as unknown as Animation[]
    container.appendChild(letter)
    document.body.appendChild(container)

    expect(readRainbowPhaseMs(container, 15_000)).toBe(4200)
  })

  it('reads phase from slot-text char faces', () => {
    const container = mountCharSlot(800)
    const face = container.querySelector('.char-face') as HTMLElement
    face.getAnimations = () => [
      { animationName: RAINBOW_ANIMATION_NAME, currentTime: 800 },
    ] as unknown as Animation[]

    expect(readRainbowPhaseMs(container, 15_000)).toBe(800)
  })
})

describe('syncRainbowFaces', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('applies staggered negative delays to each char face', () => {
    const container = document.createElement('span')
    const slot = document.createElement('span')
    slot.className = 'char-slot'

    const faceA = document.createElement('span')
    faceA.className = 'char-face'
    const faceB = document.createElement('span')
    faceB.className = 'char-face'
    slot.append(faceA, faceB)
    container.appendChild(slot)
    document.body.appendChild(container)

    syncRainbowFaces(container, 0.2, 500)

    expect(faceA.style.animationDelay).toBe('-500ms')
    expect(faceB.style.animationDelay).toBe('-500ms')
  })
})
