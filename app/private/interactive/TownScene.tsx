'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import SpriteAnimator from '@/components/SpriteAnimator'

// Static sprite paths
const SPRITE_SOUTH = '/private-town/sprites/walk/character1-south.png'
const SPRITE_NORTH = '/private-town/sprites/walk/character1-north.png'

// Sprite native dimensions (character1.png is 256×256)
const SPRITE_W = 256
const SPRITE_H = 256

type Direction = 'south' | 'north' | 'east' | 'west'

/** Map a direction to the sprite src and whether to flip horizontally. */
function directionToSprite(dir: Direction): { src: string; flip: boolean } {
  switch (dir) {
    case 'south':
      return { src: SPRITE_SOUTH, flip: false }
    case 'north':
      return { src: SPRITE_NORTH, flip: false }
    case 'east':
      return { src: SPRITE_SOUTH, flip: true }
    case 'west':
      return { src: SPRITE_SOUTH, flip: false }
  }
}

/** Map held keys to a direction. */
function keysToDirection(keys: Set<string>): Direction | null {
  const up = keys.has('ArrowUp') || keys.has('w') || keys.has('W')
  const down = keys.has('ArrowDown') || keys.has('s') || keys.has('S')
  const left = keys.has('ArrowLeft') || keys.has('a') || keys.has('A')
  const right = keys.has('ArrowRight') || keys.has('d') || keys.has('D')

  // Cardinal directions take priority
  if (up && !down && !left && !right) return 'north'
  if (down && !up && !left && !right) return 'south'
  if (left && !right && !up && !down) return 'west'
  if (right && !left && !up && !down) return 'east'

  // Diagonals: pick the horizontal direction
  if (up && left) return 'west'
  if (up && right) return 'east'
  if (down && left) return 'west'
  if (down && right) return 'east'

  // Fallback for any remaining combos
  if (up) return 'north'
  if (down) return 'south'
  if (left) return 'west'
  if (right) return 'east'

  return null
}

export default function TownScene() {
  const [direction, setDirection] = useState<Direction>('south')
  const [walking, setWalking] = useState(false)

  const keysRef = useRef<Set<string>>(new Set())

  const updateMovement = useCallback(() => {
    const dir = keysToDirection(keysRef.current)
    if (dir) {
      setDirection(dir)
      setWalking(true)
    } else {
      setWalking(false)
    }
  }, [])

  useEffect(() => {
    const MOVEMENT_KEYS = new Set([
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'w', 'a', 's', 'd', 'W', 'A', 'S', 'D',
    ])

    function onKeyDown(e: KeyboardEvent) {
      if (MOVEMENT_KEYS.has(e.key)) {
        e.preventDefault()
        keysRef.current.add(e.key)
        updateMovement()
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      keysRef.current.delete(e.key)
      updateMovement()
    }

    function onBlur() {
      keysRef.current.clear()
      updateMovement()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [updateMovement])

  const { src, flip } = directionToSprite(direction)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        gap: 24,
        userSelect: 'none',
      }}
    >
      <SpriteAnimator
        src={src}
        width={SPRITE_W}
        height={SPRITE_H}
        flip={flip}
        playing={walking}
        scale={1}
      />

      <p
        style={{
          fontFamily: 'monospace',
          fontSize: 14,
          color: '#666',
          textAlign: 'center',
          margin: 0,
        }}
      >
        Use <strong>WASD</strong> or <strong>Arrow keys</strong> to walk
      </p>
    </div>
  )
}
