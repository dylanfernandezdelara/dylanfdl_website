interface RainbowTextProps {
  text: string
  delayMultiplier?: number
}

// Animation duration in seconds (matches CSS)
const ANIMATION_DURATION = 15

// Color keyframes from the CSS animation
const COLOR_KEYFRAMES: Array<{ percent: number; color: string }> = [
  { percent: 0, color: '#FF6B7A' },
  { percent: 5, color: '#FF7268' },
  { percent: 10, color: '#FF7A5C' },
  { percent: 15, color: '#FF8350' },
  { percent: 20, color: '#FF8C42' },
  { percent: 25, color: '#FF9536' },
  { percent: 30, color: '#FF9F3A' },
  { percent: 35, color: '#FFA850' },
  { percent: 40, color: '#FFB366' },
  { percent: 45, color: '#FFBE5C' },
  { percent: 50, color: '#FFC653' },
  { percent: 55, color: '#FFCE5F' },
  { percent: 60, color: '#CC9900' },
  { percent: 65, color: '#B8860B' },
  { percent: 70, color: '#A67C00' },
  { percent: 75, color: '#996600' },
  { percent: 80, color: '#B8860B' },
  { percent: 85, color: '#FFD199' },
  { percent: 90, color: '#FFC653' },
  { percent: 95, color: '#FFB366' },
  { percent: 100, color: '#FF6B7A' },
]

// Get the color at a specific percentage through the animation cycle
function getColorAtPercent(percent: number): string {
  // Normalize percent to 0-100 range (handles looping)
  percent = percent % 100
  if (percent < 0) percent += 100

  // Find the two keyframes to interpolate between
  for (let i = 0; i < COLOR_KEYFRAMES.length - 1; i++) {
    const current = COLOR_KEYFRAMES[i]
    const next = COLOR_KEYFRAMES[i + 1]

    if (percent >= current.percent && percent <= next.percent) {
      // Linear interpolation between keyframes
      const range = next.percent - current.percent
      const position = (percent - current.percent) / range
      
      // Simple color interpolation (hex to rgb, interpolate, back to hex)
      const currentRgb = hexToRgb(current.color)
      const nextRgb = hexToRgb(next.color)
      
      if (currentRgb && nextRgb) {
        const r = Math.round(currentRgb.r + (nextRgb.r - currentRgb.r) * position)
        const g = Math.round(currentRgb.g + (nextRgb.g - currentRgb.g) * position)
        const b = Math.round(currentRgb.b + (nextRgb.b - currentRgb.b) * position)
        return rgbToHex(r, g, b)
      }
      
      return current.color
    }
  }

  return COLOR_KEYFRAMES[0].color
}

// Helper to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

// Helper to convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

// Calculate initial color based on animation delay
function getInitialColor(delay: number): string {
  // Calculate what percentage through the animation cycle this delay represents
  // Since the animation loops, we use modulo
  const cyclePosition = (delay % ANIMATION_DURATION) / ANIMATION_DURATION * 100
  return getColorAtPercent(cyclePosition)
}

export default function RainbowText({ text, delayMultiplier = 0.2 }: RainbowTextProps) {
  return (
    <>
      {text.split('').map((letter, index) => {
        const delay = index * delayMultiplier
        const initialColor = getInitialColor(delay)
        
        return (
          <span
            key={index}
            className="rainbow-letter"
            style={{
              animationDelay: `${delay}s`,
              color: initialColor, // Set initial color to match animation position
            }}
          >
            {letter}
          </span>
        )
      })}
    </>
  )
}
