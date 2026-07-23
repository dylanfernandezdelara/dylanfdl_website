'use client'

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import rough from 'roughjs'

import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

export type RoughCanvasApi = {
  svg: SVGSVGElement
  roughSvg: ReturnType<typeof rough.svg>
  width: number
  height: number
  progress: number
  reducedMotion: boolean
  seed: number
}

type RoughCanvasProps = {
  width?: number
  height?: number
  seed?: number
  loop?: boolean
  durationMs?: number
  restMs?: number
  className?: string
  ariaLabel: string
  children: (api: RoughCanvasApi) => ReactNode | void
}

function readThemeColor(variable: string, fallback: string): string {
  if (typeof window === 'undefined') {
    return fallback
  }
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
  return value || fallback
}

export function useRoughThemeColors() {
  const [colors, setColors] = useState({
    fg: 'var(--fg1)',
    muted: 'var(--fg3)',
    accent: 'var(--blue)',
    fill: 'var(--bg2)',
  })

  useEffect(() => {
    const update = () => {
      setColors({
        fg: readThemeColor('--fg1', '#374151'),
        muted: readThemeColor('--fg3', '#6b7280'),
        accent: readThemeColor('--blue', '#5f5faf'),
        fill: readThemeColor('--bg2', '#f5f2e8'),
      })
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  return colors
}

export default function RoughCanvas({
  width = 720,
  height = 320,
  seed = 42,
  loop = true,
  durationMs = 4800,
  restMs = 900,
  className,
  ariaLabel,
  children,
}: RoughCanvasProps) {
  const reactId = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  const [visible, setVisible] = useState(false)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [replayToken, setReplayToken] = useState(0)
  const { reduced, ready } = usePrefersReducedMotion()
  const frameRef = useRef<number | null>(null)
  const oneShotDoneRef = useRef(false)

  useEffect(() => {
    const node = svgRef.current
    if (!node) {
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.3 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!ready) {
      return
    }

    if (reduced) {
      setProgress(1)
      return
    }

    if (paused || !visible) {
      return
    }

    if (!loop && oneShotDoneRef.current) {
      setProgress(1)
      return
    }

    let start: number | null = null
    let restingUntil = 0
    setProgress(0)

    const tick = (now: number) => {
      if (loop && restingUntil && now < restingUntil) {
        frameRef.current = requestAnimationFrame(tick)
        return
      }

      if (start === null) {
        start = now
      }

      const next = Math.min(1, (now - start) / durationMs)
      setProgress(next)

      if (next >= 1) {
        if (!loop) {
          oneShotDoneRef.current = true
          setProgress(1)
          return
        }
        restingUntil = now + restMs
        start = null
        setProgress(1)
      }

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [durationMs, loop, paused, ready, reduced, restMs, replayToken, visible])

  const renderScene = useCallback(() => {
    const svg = svgRef.current
    if (!svg) {
      return
    }

    while (svg.firstChild) {
      svg.removeChild(svg.firstChild)
    }

    const roughSvg = rough.svg(svg, { options: { seed } })
    children({
      svg,
      roughSvg,
      width,
      height,
      progress: reduced ? 1 : progress,
      reducedMotion: reduced,
      seed,
    })
  }, [children, height, progress, reduced, seed, width])

  useEffect(() => {
    renderScene()
  }, [renderScene])

  return (
    <div className={cn('article-rough', className)}>
      <svg
        ref={svgRef}
        id={`rough-${reactId}`}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        className="article-rough__svg"
      />
      {!reduced && (
        <button
          type="button"
          className="article-rough__toggle"
          onClick={() => {
            if (!loop) {
              oneShotDoneRef.current = false
              setPaused(false)
              setReplayToken((token) => token + 1)
              return
            }
            setPaused((value) => !value)
          }}
          aria-pressed={loop ? paused : false}
        >
          {loop ? (paused ? 'Replay' : 'Pause') : 'Replay'}
        </button>
      )}
    </div>
  )
}
