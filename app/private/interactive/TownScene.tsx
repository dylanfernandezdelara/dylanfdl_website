'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import styles from './TownScene.module.css'

const CHARACTER_SIZE = 32
const SPEED = 220

const KEY_VECTORS: Record<string, { x: number; y: number }> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  a: { x: -1, y: 0 },
  s: { x: 0, y: 1 },
  d: { x: 1, y: 0 },
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

type Position = {
  x: number
  y: number
}

export default function TownScene() {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const pressedKeys = useRef<Set<string>>(new Set())
  const positionRef = useRef<Position>({ x: 0, y: 0 })
  const [position, setPosition] = useState<Position>(positionRef.current)
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 })
  const [backVisible, setBackVisible] = useState(false)
  const hasInitialized = useRef(false)

  const setPositionState = (next: Position) => {
    positionRef.current = next
    setPosition(next)
  }

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const updateSize = () => {
      const rect = stage.getBoundingClientRect()
      setStageSize({ width: rect.width, height: rect.height })
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!stageSize.width || !stageSize.height) return

    const maxX = Math.max(0, stageSize.width - CHARACTER_SIZE)
    const maxY = Math.max(0, stageSize.height - CHARACTER_SIZE)

    if (!hasInitialized.current) {
      hasInitialized.current = true
      setPositionState({
        x: clamp(stageSize.width / 2 - CHARACTER_SIZE / 2, 0, maxX),
        y: clamp(stageSize.height / 2 - CHARACTER_SIZE / 2, 0, maxY),
      })
      return
    }

    const current = positionRef.current
    const clamped = {
      x: clamp(current.x, 0, maxX),
      y: clamp(current.y, 0, maxY),
    }
    if (clamped.x !== current.x || clamped.y !== current.y) {
      setPositionState(clamped)
    }
  }, [stageSize.width, stageSize.height])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setBackVisible((prev) => !prev)
        return
      }

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      if (key in KEY_VECTORS) {
        pressedKeys.current.add(key)
        event.preventDefault()
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      if (key in KEY_VECTORS) {
        pressedKeys.current.delete(key)
        event.preventDefault()
      }
    }

    const handleBlur = () => {
      pressedKeys.current.clear()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  useEffect(() => {
    let frameId = 0
    let lastTime = performance.now()

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000
      lastTime = now

      if (stageSize.width && stageSize.height) {
        const maxX = Math.max(0, stageSize.width - CHARACTER_SIZE)
        const maxY = Math.max(0, stageSize.height - CHARACTER_SIZE)

        let dirX = 0
        let dirY = 0
        pressedKeys.current.forEach((key) => {
          const vector = KEY_VECTORS[key]
          if (vector) {
            dirX += vector.x
            dirY += vector.y
          }
        })

        if (dirX !== 0 || dirY !== 0) {
          const length = Math.hypot(dirX, dirY) || 1
          const speed = SPEED * delta
          const current = positionRef.current
          const next = {
            x: clamp(current.x + (dirX / length) * speed, 0, maxX),
            y: clamp(current.y + (dirY / length) * speed, 0, maxY),
          }

          if (next.x !== current.x || next.y !== current.y) {
            setPositionState(next)
          }
        }
      }

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [stageSize.height, stageSize.width])

  return (
    <div className={styles.scene} ref={stageRef} aria-label="Town scene">
      <div className={styles.background} aria-hidden="true" />
      <div className={styles.overlay}>
        {backVisible ? (
          <Link href="/" className={styles.backButton}>
            Back to home
          </Link>
        ) : null}
      </div>
      <div
        className={styles.character}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        aria-hidden="true"
      />
    </div>
  )
}
