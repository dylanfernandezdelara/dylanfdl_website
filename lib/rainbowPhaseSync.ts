export const RAINBOW_ANIMATION_NAME = 'rainbow'

const FALLBACK_RAINBOW_DURATION_MS = 15_000

export function readRainbowDurationMs(element: HTMLElement): number {
  const raw = getComputedStyle(element).getPropertyValue('--rainbow-duration').trim()
  if (!raw) return FALLBACK_RAINBOW_DURATION_MS

  if (raw.endsWith('ms')) {
    const parsed = Number.parseFloat(raw)
    return Number.isFinite(parsed) ? parsed : FALLBACK_RAINBOW_DURATION_MS
  }

  if (raw.endsWith('s')) {
    const parsed = Number.parseFloat(raw)
    return Number.isFinite(parsed) ? parsed * 1000 : FALLBACK_RAINBOW_DURATION_MS
  }

  return FALLBACK_RAINBOW_DURATION_MS
}

export function readRainbowPhaseMs(container: HTMLElement, durationMs: number): number {
  const face = container.querySelector('.char-face, .rainbow-letter')
  if (!(face instanceof HTMLElement)) return 0

  const rainbow = face
    .getAnimations()
    .find((animation) => animation.animationName === RAINBOW_ANIMATION_NAME)
  const currentTime = rainbow?.currentTime
  if (typeof currentTime === 'number' && Number.isFinite(currentTime) && currentTime > 0) {
    return currentTime % durationMs
  }

  const delayRaw = face.style.animationDelay.trim()
  const delayMatch = delayRaw.match(/^-([\d.]+)ms$/)
  if (delayMatch) {
    const parsed = Number.parseFloat(delayMatch[1])
    if (Number.isFinite(parsed)) {
      return parsed % durationMs
    }
  }

  return 0
}

export function syncRainbowFaces(
  container: HTMLElement,
  delayMultiplierSeconds: number,
  phaseMs = 0,
): void {
  container.querySelectorAll('.char-slot').forEach((slot, index) => {
    const delayMs = phaseMs + index * delayMultiplierSeconds * 1000

    slot.querySelectorAll('.char-face').forEach((face) => {
      if (!(face instanceof HTMLElement)) return
      face.style.animationDelay = `-${delayMs}ms`
      face.style.removeProperty('color')
    })
  })
}
