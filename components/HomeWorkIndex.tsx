import Link from 'next/link'

import {
  WORK_INDEX_SECTIONS,
  partitionCardGridItems,
  type CardGridSerializableItem,
} from '@/lib/buildCardGridItems'
import { INLINE_LINK_STYLES } from '@/lib/linkStyles'

function WorkList({
  heading,
  items,
  empty,
}: {
  heading: string
  items: CardGridSerializableItem[]
  empty: string
}) {
  return (
    <section className="mb-6">
      <h3>{heading}</h3>
      {items.length === 0 ? (
        <p className="text-fg2">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.href}>
              {item.kind === 'artifact' ? (
                <a href={item.href} className={INLINE_LINK_STYLES}>
                  {item.title}
                </a>
              ) : (
                <Link href={item.href} className={INLINE_LINK_STYLES}>
                  {item.title}
                </Link>
              )}
              <span className="text-fg3"> · {item.dateLabel}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function HomeWorkIndex({ items }: { items: CardGridSerializableItem[] }) {
  const partitioned = partitionCardGridItems(items)

  return (
    <nav aria-label="Contents" className="mt-2 text-sm font-[450] leading-relaxed text-fg1">
      {WORK_INDEX_SECTIONS.map((section) => (
        <WorkList
          key={section.key}
          heading={section.heading}
          items={partitioned[section.key]}
          empty={section.empty}
        />
      ))}
    </nav>
  )
}
