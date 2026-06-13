import { describe, expect, it } from 'vitest'

import {
  editorThumbnailHandoffElapsedMs,
  getVisibleLengthAt,
  type EditorThumbnailCycleTiming,
} from '../lib/editorThumbnailCycle'

const SAMPLE_TIMING: EditorThumbnailCycleTiming = {
  typeThresholds: [100, 250, 400],
  typeTotalMs: 400,
  deleteThresholds: [80, 160],
  deleteTotalMs: 160,
  cycleDurationMs: 400 + 900 + 160 + 250,
}

const TEXT_LENGTH = 3

describe('getVisibleLengthAt', () => {
  it('returns zero at the start of the typing phase', () => {
    expect(getVisibleLengthAt(0, SAMPLE_TIMING, TEXT_LENGTH)).toBe(0)
  })

  it('holds the full string during the hold-full window after typing', () => {
    const handoffElapsed = editorThumbnailHandoffElapsedMs(SAMPLE_TIMING)
    expect(getVisibleLengthAt(handoffElapsed, SAMPLE_TIMING, TEXT_LENGTH)).toBe(TEXT_LENGTH)
  })

  it('returns empty after the delete phase completes', () => {
    const afterDelete = SAMPLE_TIMING.typeTotalMs + 900 + SAMPLE_TIMING.deleteTotalMs + 1
    expect(getVisibleLengthAt(afterDelete, SAMPLE_TIMING, TEXT_LENGTH)).toBe(0)
  })
})
