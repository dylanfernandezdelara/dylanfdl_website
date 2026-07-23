import Image from 'next/image'

import { cn } from '@/lib/utils'

type ArticleImageProps = {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
}

export default function ArticleImage({
  src,
  alt,
  width = 1600,
  height = 900,
  priority = false,
  className,
}: ArticleImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn('article-image', className)}
      sizes="(max-width: 768px) 100vw, min(840px, 100vw)"
    />
  )
}
