import type { CSSProperties } from 'react'

type StylexProps = {
  className?: string
  style?: CSSProperties
}

export function withClassName(extra: string | undefined, props: StylexProps): StylexProps {
  const className = [props.className, extra].filter(Boolean).join(' ')
  return {
    className: className || undefined,
    style: props.style,
  }
}
