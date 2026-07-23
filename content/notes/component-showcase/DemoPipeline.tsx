'use client'

import RoughCanvas, { useRoughThemeColors } from '@/components/diagrams/RoughCanvas'

export default function DemoPipeline() {
  const colors = useRoughThemeColors()

  return (
    <RoughCanvas
      ariaLabel="Sketch diagram of an event moving through a process into a result"
      width={720}
      height={260}
      seed={17}
      loop
      durationMs={5200}
      restMs={1000}
    >
      {({ roughSvg, svg, progress }) => {
        const showProcess = progress > 0.2
        const showResult = progress > 0.55
        const arrowOne = Math.min(1, Math.max(0, (progress - 0.05) / 0.2))
        const arrowTwo = Math.min(1, Math.max(0, (progress - 0.4) / 0.2))

        const event = roughSvg.circle(110, 120, 88, {
          stroke: colors.fg,
          strokeWidth: 2,
          roughness: 1.4,
          fill: colors.fill,
          fillStyle: 'solid',
        })
        svg.appendChild(event)

        const eventLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        eventLabel.setAttribute('x', '110')
        eventLabel.setAttribute('y', '125')
        eventLabel.setAttribute('text-anchor', 'middle')
        eventLabel.setAttribute('fill', colors.fg)
        eventLabel.setAttribute('font-size', '14')
        eventLabel.setAttribute('font-family', 'ui-sans-serif, system-ui, sans-serif')
        eventLabel.textContent = 'event'
        svg.appendChild(eventLabel)

        if (arrowOne > 0) {
          const line = roughSvg.line(160, 120, 160 + 120 * arrowOne, 120, {
            stroke: colors.accent,
            strokeWidth: 2,
            roughness: 1.1,
          })
          svg.appendChild(line)
        }

        if (showProcess) {
          const box = roughSvg.rectangle(300, 78, 160, 84, {
            stroke: colors.fg,
            strokeWidth: 2,
            roughness: 1.35,
            fill: colors.fill,
            fillStyle: 'solid',
          })
          svg.appendChild(box)
          const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          label.setAttribute('x', '380')
          label.setAttribute('y', '125')
          label.setAttribute('text-anchor', 'middle')
          label.setAttribute('fill', colors.fg)
          label.setAttribute('font-size', '14')
          label.setAttribute('font-family', 'ui-sans-serif, system-ui, sans-serif')
          label.textContent = 'process'
          svg.appendChild(label)
        }

        if (arrowTwo > 0) {
          const line = roughSvg.line(470, 120, 470 + 110 * arrowTwo, 120, {
            stroke: colors.accent,
            strokeWidth: 2,
            roughness: 1.1,
          })
          svg.appendChild(line)
        }

        if (showResult) {
          const result = roughSvg.circle(620, 120, 88, {
            stroke: colors.fg,
            strokeWidth: 2,
            roughness: 1.4,
          })
          svg.appendChild(result)
          const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          label.setAttribute('x', '620')
          label.setAttribute('y', '125')
          label.setAttribute('text-anchor', 'middle')
          label.setAttribute('fill', colors.fg)
          label.setAttribute('font-size', '14')
          label.setAttribute('font-family', 'ui-sans-serif, system-ui, sans-serif')
          label.textContent = 'result'
          svg.appendChild(label)
        }
      }}
    </RoughCanvas>
  )
}
