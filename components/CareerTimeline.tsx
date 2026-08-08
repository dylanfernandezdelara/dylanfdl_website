import ExternalLink from '@/components/ExternalLink'
import { CAREER_ENTRIES } from '@/lib/career'

export default function CareerTimeline() {
  return (
    <section className="mt-8" aria-label="Career">
      <ul className="flex flex-col gap-3.5">
        {CAREER_ENTRIES.map((entry) => (
          <li
            key={`${entry.company}-${entry.dates}`}
            className="flex items-start justify-between gap-4"
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <img
                src={entry.faviconSrc}
                alt=""
                width={16}
                height={16}
                decoding="async"
                className="mt-0.5 size-4 shrink-0 rounded-[3px]"
              />
              <div className="min-w-0 leading-snug">
                <ExternalLink
                  href={entry.href}
                  noUnderline
                  className="font-[450] text-fg0 hover:text-fg0"
                >
                  {entry.company}
                </ExternalLink>
                <div className="text-[13px] text-fg3">{entry.role}</div>
              </div>
            </div>
            <time className="shrink-0 pt-0.5 text-xs font-normal tabular-nums text-fg3">
              {entry.dates}
            </time>
          </li>
        ))}
      </ul>
    </section>
  )
}
