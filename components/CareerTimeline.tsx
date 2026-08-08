import ExternalLink from '@/components/ExternalLink'
import { CAREER_ENTRIES } from '@/lib/career'

export default function CareerTimeline() {
  return (
    <section className="mt-6" aria-label="Career">
      <ul className="flex flex-col gap-1.5">
        {CAREER_ENTRIES.map((entry) => (
          <li
            key={`${entry.company}-${entry.dates}`}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex min-w-0 items-center gap-2">
              <img
                src={entry.faviconSrc}
                alt=""
                width={16}
                height={16}
                decoding="async"
                className="size-4 shrink-0"
              />
              <span className="min-w-0 text-pretty">
                <ExternalLink href={entry.href} noUnderline className="text-fg1 hover:text-fg0">
                  {entry.company}
                </ExternalLink>
                <span className="text-fg3"> · {entry.role}</span>
              </span>
            </div>
            <time className="shrink-0 tabular-nums text-fg3">{entry.dates}</time>
          </li>
        ))}
      </ul>
    </section>
  )
}
