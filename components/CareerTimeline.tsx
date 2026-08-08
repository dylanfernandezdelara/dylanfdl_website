import ExternalLink from '@/components/ExternalLink'
import { CAREER_ENTRIES } from '@/lib/career'
import { cn } from '@/lib/utils'

export default function CareerTimeline() {
  return (
    <section className="mt-6" aria-label="Career">
      <ul className="flex flex-col gap-1.5">
        {CAREER_ENTRIES.map((entry) => {
          const isMonochromeMark = entry.faviconSrc.endsWith('.svg')

          return (
            <li
              key={`${entry.company}-${entry.dates}`}
              className="flex min-w-0 items-center gap-2"
            >
              <img
                src={entry.faviconSrc}
                alt=""
                width={12}
                height={12}
                decoding="async"
                className={cn(
                  'size-3 shrink-0 opacity-40',
                  isMonochromeMark && 'dark:invert',
                )}
              />
              <time className="w-[11.5rem] shrink-0 tabular-nums text-fg4">
                {entry.dates}
              </time>
              <span className="min-w-0 text-pretty">
                <ExternalLink href={entry.href} noUnderline className="text-fg1 hover:text-fg0">
                  {entry.company}
                </ExternalLink>
                <span className="text-fg3"> · {entry.role}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
