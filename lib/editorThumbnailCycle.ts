export const EDITOR_THUMBNAIL_HOLD_FULL_MS = 900
export const EDITOR_THUMBNAIL_HOLD_EMPTY_MS = 250

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
