interface ArtifactCardProps {
  title: string
  date: string
  href: string
  videoSrc: string
  posterSrc: string
}

export default function ArtifactCard({
  title,
  date,
  href,
  videoSrc,
  posterSrc,
}: ArtifactCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-xl border border-bg3 bg-bg1 no-underline transition-[border-color] duration-200 hover:border-fg4/25"
    >
      <div className="flex items-baseline justify-between gap-3 px-3.5 pb-2 pt-3">
        <span className="text-[0.8125rem] font-medium leading-snug text-fg1 transition-colors duration-200 group-hover:text-fg0">
          {title}
        </span>
        <span className="shrink-0 text-[0.6875rem] tabular-nums text-fg4">
          {date}
        </span>
      </div>
      <div className="relative mx-1.5 mb-1.5 aspect-video overflow-hidden rounded-lg bg-bg2">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={posterSrc}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      </div>
    </a>
  )
}
