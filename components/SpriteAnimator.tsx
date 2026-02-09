'use client'

import { useEffect, useRef, useCallback } from 'react'

export interface SpriteAnimatorProps {
  /** Path to a single static sprite image */
  src: string
  /** Native width of the sprite (px) */
  width: number
  /** Native height of the sprite (px) */
  height: number
  /** Whether to horizontally flip the sprite (for west direction) */
  flip?: boolean
  /** Whether the walk animation is playing */
  playing: boolean
  /** Display scale factor (e.g. 1 = native, 2 = double size) */
  scale?: number
  /** Interval between walk frames in ms (default 150). Controls walk cadence. */
  stepInterval?: number
}

/**
 * Canvas-based sprite renderer with Pokemon Gen 1-2 style walk animation.
 *
 * Displays a single static sprite image. When `playing` is true, alternates
 * between two discrete frames (neutral and mid-step) at a fixed interval,
 * producing the crisp, stepped walk cycle of classic pixel-art games.
 * No smooth interpolation — hard frame snaps only.
 */
export default function SpriteAnimator({
  src,
  width,
  height,
  flip = false,
  playing,
  scale = 1,
  stepInterval = 150,
}: SpriteAnimatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const canvasW = width * scale
  const canvasH = height * scale

  // Padding to accommodate the vertical bob without clipping
  const padY = Math.ceil(2 * scale)
  const totalW = canvasW
  const totalH = canvasH + padY

  /**
   * Draw the sprite at a discrete frame index.
   *   frame 0 = neutral (no offset)
   *   frame 1 = mid-step (small pixel-snapped vertical bob downward)
   */
  const draw = useCallback(
    (frame: number) => {
      const canvas = canvasRef.current
      const img = imgRef.current
      if (!canvas || !img || !img.complete) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, totalW, totalH)

      ctx.save()

      // Frame 0: no offset. Frame 1: bob down by a pixel-snapped amount.
      const bobY = frame === 1 ? Math.round(2 * scale) : 0

      if (flip) {
        // Flip horizontally around the center of the draw area
        ctx.translate(canvasW, bobY)
        ctx.scale(-1, 1)
      } else {
        ctx.translate(0, bobY)
      }

      ctx.drawImage(img, 0, 0, canvasW, canvasH)
      ctx.restore()
    },
    [canvasW, canvasH, totalW, totalH, flip, scale],
  )

  // Load the sprite image
  useEffect(() => {
    const img = new Image()
    img.src = src
    img.onload = () => {
      imgRef.current = img
      draw(0)
    }
    imgRef.current = img
  }, [src, draw])

  // Stepped walk animation — alternates between frame 0 and frame 1
  useEffect(() => {
    if (!playing) {
      // Snap to neutral idle pose
      draw(0)
      return
    }

    let frame = 0
    draw(frame)

    const id = setInterval(() => {
      frame = frame === 0 ? 1 : 0
      draw(frame)
    }, stepInterval)

    return () => clearInterval(id)
  }, [playing, draw, stepInterval])

  // Redraw when flip changes (direction switch while idle)
  useEffect(() => {
    if (!playing) {
      draw(0)
    }
  }, [flip, playing, draw])

  return (
    <canvas
      ref={canvasRef}
      width={totalW}
      height={totalH}
      style={{
        imageRendering: 'pixelated',
        display: 'block',
        // Offset the bottom padding so the character position stays stable
        marginBottom: `-${padY}px`,
      }}
    />
  )
}
