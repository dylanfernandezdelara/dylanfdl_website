import Link from 'next/link'

import {
  partitionCardGridItems,
  type CardGridSerializableItem,
} from '@/lib/buildCardGridItems'
import { INLINE_LINK_STYLES } from '@/lib/linkStyles'

type Section = {
  heading: string
  items: CardGridSerializableItem[]
  empty: string
}

function WorkList({ heading, items, empty }: Section) {
  return (
    <section className="mb-6">
      <h3 className="mb-2 font-serif text-lg font-normal text-fg0">{heading}</h3>
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
  const { projects, notes, music } = partitionCardGridItems(items)

  return (
    <nav aria-label="Contents" className="mt-10 text-sm font-[450] leading-relaxed text-fg1">
      <WorkList heading="Projects" items={projects} empty="No published projects yet." />
      <WorkList heading="Notes" items={notes} empty="No published notes yet." />
      <WorkList heading="Music" items={music} empty="No music recordings yet." />
    </nav>
  )
}
