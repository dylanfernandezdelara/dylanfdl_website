export const EDITOR_THUMBNAIL_HOLD_FULL_MS = 900
export const EDITOR_THUMBNAIL_HOLD_EMPTY_MS = 250

export const EDITOR_THUMBNAIL_FULL_TEXT = 'I hope to clarify my own ideas and'

export type EditorThumbnailCycleTiming = {
  typeThresholds: number[]
  typeTotalMs: number
  deleteThresholds: number[]
  deleteTotalMs: number
  cycleDurationMs: number
}

export function getTypingLength(
  elapsedMs: number,
  typeThresholds: number[],
  textLength: number,
): number {
  for (let index = 0; index < typeThresholds.length; index += 1) {
    if (elapsedMs < typeThresholds[index]) {
      return index
    }
  }

  return textLength
}

export function getDeletingLength(
  elapsedMs: number,
  deleteThresholds: number[],
  textLength: number,
): number {
  for (let index = 0; index < deleteThresholds.length; index += 1) {
    if (elapsedMs < deleteThresholds[index]) {
      return textLength - index
    }
  }

  return 0
}

export function getVisibleLengthAt(
  cycleElapsedMs: number,
  timing: EditorThumbnailCycleTiming,
  textLength: number,
): number {
  if (cycleElapsedMs < timing.typeTotalMs) {
    return getTypingLength(cycleElapsedMs, timing.typeThresholds, textLength)
  }

  if (cycleElapsedMs < timing.typeTotalMs + EDITOR_THUMBNAIL_HOLD_FULL_MS) {
    return textLength
  }

  const deleteElapsedMs = cycleElapsedMs - timing.typeTotalMs - EDITOR_THUMBNAIL_HOLD_FULL_MS

  if (deleteElapsedMs < timing.deleteTotalMs) {
    return getDeletingLength(deleteElapsedMs, timing.deleteThresholds, textLength)
  }

  return 0
}

/** Elapsed ms that lands in hold-full so a handoff from the placeholder stays full. */
export function editorThumbnailHandoffElapsedMs(timing: EditorThumbnailCycleTiming): number {
  return timing.typeTotalMs + EDITOR_THUMBNAIL_HOLD_FULL_MS / 2
}

/** Uniform float in [min, max] */
function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export function buildEditorThumbnailTypeThresholds(): Pick<
  EditorThumbnailCycleTiming,
  'typeThresholds' | 'typeTotalMs'
> {
  const textLength = EDITOR_THUMBNAIL_FULL_TEXT.length
  const thresholds: number[] = []
  let total = 0

  for (let nextVisibleLength = 1; nextVisibleLength <= textLength; nextVisibleLength += 1) {
    const char = EDITOR_THUMBNAIL_FULL_TEXT[nextVisibleLength - 1]
    let delay = randomBetween(95, 340)

    if (char === ' ') {
      delay *= randomBetween(0.72, 0.95)
    }

    if (nextVisibleLength >= 2 && EDITOR_THUMBNAIL_FULL_TEXT[nextVisibleLength - 2] === ' ') {
      delay += randomBetween(35, 220)
    }

    if (Math.random() < 0.07) {
      delay += randomBetween(100, 420)
    }

    delay *= randomBetween(0.88, 1.12)

    total += Math.round(delay)
    thresholds.push(total)
  }

  return { typeThresholds: thresholds, typeTotalMs: total }
}

export function buildEditorThumbnailDeleteThresholds(): Pick<
  EditorThumbnailCycleTiming,
  'deleteThresholds' | 'deleteTotalMs'
> {
  const textLength = EDITOR_THUMBNAIL_FULL_TEXT.length
  const thresholds: number[] = []
  let total = 0
  let burstLeft = 0

  for (let visibleLength = textLength; visibleLength > 0; visibleLength -= 1) {
    const charRemoved = EDITOR_THUMBNAIL_FULL_TEXT[visibleLength - 1]
    let delay: number

    if (burstLeft > 0) {
      burstLeft -= 1
      delay = randomBetween(24, 78)
    } else {
      const progress = visibleLength / textLength
      delay =
        randomBetween(68, 175) + progress * randomBetween(25, 110) + randomBetween(-18, 38)
      if (Math.random() < 0.44) {
        burstLeft = Math.floor(randomBetween(1, 3))
      }
    }

    if (charRemoved === ' ') {
      burstLeft = 0
      delay += randomBetween(65, 240)
    }

    if (visibleLength >= 3 && EDITOR_THUMBNAIL_FULL_TEXT[visibleLength - 2] === ' ') {
      burstLeft = 0
      delay += randomBetween(40, 130)
    }

    if (Math.random() < 0.095) {
      burstLeft = 0
      delay += randomBetween(130, 420)
    }

    delay *= randomBetween(0.8, 1.22)
    delay = Math.max(18, delay)

    total += Math.round(delay)
    thresholds.push(total)
  }

  return { deleteThresholds: thresholds, deleteTotalMs: total }
}

export function rollEditorThumbnailCycleTiming(): EditorThumbnailCycleTiming {
  const typing = buildEditorThumbnailTypeThresholds()
  const deleting = buildEditorThumbnailDeleteThresholds()

  return {
    typeThresholds: typing.typeThresholds,
    typeTotalMs: typing.typeTotalMs,
    deleteThresholds: deleting.deleteThresholds,
    deleteTotalMs: deleting.deleteTotalMs,
    cycleDurationMs:
      typing.typeTotalMs + EDITOR_THUMBNAIL_HOLD_FULL_MS + deleting.deleteTotalMs + EDITOR_THUMBNAIL_HOLD_EMPTY_MS,
  }
}
