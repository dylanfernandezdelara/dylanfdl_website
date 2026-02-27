interface RainbowTextProps {
  text: string
  delayMultiplier?: number
}

export default function RainbowText({ text, delayMultiplier = 0.2 }: RainbowTextProps) {
  return (
    <span className="inline-block">
      {text.split('').map((letter, index) => {
        const delay = index * delayMultiplier

        return (
          <span
            key={index}
            className="rainbow-letter"
            style={{
              animationDelay: `-${delay}s`,
            }}
          >
            {letter}
          </span>
        )
      })}
    </span>
  )
}
