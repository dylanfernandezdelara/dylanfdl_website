interface RainbowTextProps {
  text: string
  delayMultiplier?: number
}

export default function RainbowText({ text, delayMultiplier = 0.2 }: RainbowTextProps) {
  return (
    <>
      {text.split('').map((letter, index) => (
        <span
          key={index}
          className="rainbow-letter"
          style={{
            animationDelay: `${index * delayMultiplier}s`
          }}
        >
          {letter}
        </span>
      ))}
    </>
  )
}
