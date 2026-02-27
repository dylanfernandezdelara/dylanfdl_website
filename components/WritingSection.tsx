import Link from 'next/link'
import SectionHeading from '@/components/SectionHeading'
import { formatPostDateShort, getPostsByYear } from '@/lib/posts'

export default function WritingSection() {
  const postsByYear = getPostsByYear()
  const years = Object.keys(postsByYear).sort((a, b) => parseInt(b) - parseInt(a))

  if (years.length === 0) {
    return (
      <div className="mt-12">
        <SectionHeading
          marginTop="0"
          className="text-fg2 [--section-heading-font-size:1.25rem] min-[481px]:[--section-heading-font-size:1.375rem] md:[--section-heading-font-size:1.5rem]"
        >
          Essays
        </SectionHeading>
        <p className="mt-2 text-fg1">
          No essays yet. Add markdown files to <code>content/essays/</code> and they will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-12">
      {years.map((year, index) => (
        <div key={year} className={index === 0 ? 'mt-0' : 'mt-8'}>
          <SectionHeading
            marginTop={index === 0 ? '0' : undefined}
            className="text-fg2 [--section-heading-font-size:1.25rem] min-[481px]:[--section-heading-font-size:1.375rem] md:[--section-heading-font-size:1.5rem]"
          >
            {year}
          </SectionHeading>

          <ul className="mt-4 flex list-none flex-col gap-3 p-0">
            {postsByYear[year].map((post) => (
              <li key={post.slug} className="flex items-baseline gap-2">
                <span className="text-base text-gray">{formatPostDateShort(post.date)}</span>
                <Link
                  href={`/essays/${post.slug}`}
                  className="text-base font-normal text-fg2 no-underline transition-colors hover:text-fg1"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
