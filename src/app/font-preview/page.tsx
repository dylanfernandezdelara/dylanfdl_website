import type { Metadata } from 'next'
import type { CSSProperties, ReactNode } from 'react'

import ThemeToggle from '@/components/ThemeToggle'

export const metadata: Metadata = {
  title: 'Intro blurb font weight preview',
  robots: {
    index: false,
    follow: false,
  },
}

type PreviewOption = {
  id: string
  label: string
  note: string
  style: CSSProperties
}

const SAMPLE_PARAGRAPHS = [
  'I am an optimist.',
  'I currently work on post-training at Meta and build RL environments for frontier coding agents. We recently launched Muse Spark 1.1.',
  'Previously, I scaled crash infrastructure for Meta Glasses.',
  'I am a Yale graduate and am currently based in New York.',
] as const

/**
 * Same system UI stack as the live intro (`font-sans` / `--font-sans`).
 * Options only change weight / optical thickening — not the family.
 */
const OPTIONS: PreviewOption[] = [
  {
    id: 'current',
    label: 'A · Current',
    note: 'font-weight: 400 — baseline on the home page today',
    style: { fontWeight: 400 },
  },
  {
    id: 'w450',
    label: 'B · Weight 450',
    note: 'Slight step up; many system fonts (SF Pro, Segoe) expose this intermediate weight',
    style: { fontWeight: 450 },
  },
  {
    id: 'w500',
    label: 'C · Weight 500',
    note: 'Medium weight — clearly thicker, still the same family',
    style: { fontWeight: 500 },
  },
  {
    id: 'optical',
    label: 'D · Optical thicken',
    note: 'Keep 400, add a hairline stroke so glyphs read a bit fuller without jumping to Medium',
    style: {
      fontWeight: 400,
      WebkitTextStroke: '0.22px currentColor',
      paintOrder: 'stroke fill',
    },
  },
  {
    id: 'shadow',
    label: 'E · Soft shadow thicken',
    note: 'Keep 400, use a 1px text-shadow to optically fatten strokes',
    style: {
      fontWeight: 400,
      textShadow: '0.2px 0 currentColor, -0.2px 0 currentColor',
    },
  },
  {
    id: 'w450-darker',
    label: 'F · Weight 450 + darker',
    note: '450 with text-fg0 instead of fg1 — thicker and a touch higher contrast',
    style: {
      fontWeight: 450,
      color: 'var(--fg0)',
    },
  },
]

function SampleBlurb({ style }: { style: CSSProperties }) {
  return (
    <div
      className="text-pretty text-sm leading-relaxed text-fg1"
      style={style}
    >
      <h1 className="mb-6 font-serif text-2xl font-normal text-fg0">
        Dylan Fernandez de Lara
      </h1>
      {SAMPLE_PARAGRAPHS.map((paragraph) => (
        <p key={paragraph} className="mb-4 last:mb-0">
          {paragraph}
        </p>
      ))}
    </div>
  )
}

function OptionCard({
  option,
  children,
}: {
  option: PreviewOption
  children: ReactNode
}) {
  return (
    <section
      id={option.id}
      className="scroll-mt-8 border-t border-bg3 pt-8 first:border-t-0 first:pt-0"
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-sm font-medium tracking-wide text-fg0">
          {option.label}
        </h2>
        <p className="max-w-xl text-xs leading-snug text-fg3">{option.note}</p>
      </div>
      <div className="min-[640px]:max-w-[75%]">{children}</div>
    </section>
  )
}

export default function FontPreviewPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-12 text-base leading-[1.6] min-[481px]:px-6 md:px-8 md:pt-16">
      <header className="mb-10 flex items-start justify-between gap-4 border-b border-bg3 pb-6">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-fg3">
            Typography preview
          </p>
          <h1 className="mb-3 text-xl font-medium text-fg0">
            Intro blurb — same font, slightly thicker
          </h1>
          <p className="text-sm leading-relaxed text-fg2">
            Live home copy uses the system UI stack at{' '}
            <code className="font-mono text-xs text-fg1">text-sm</code> / weight{' '}
            <code className="font-mono text-xs text-fg1">400</code>. Below are
            options that keep that family and only change weight or optical
            thickening. Toggle light/dark to check both themes.
          </p>
          <nav className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-fg3">
            {OPTIONS.map((option) => (
              <a
                key={option.id}
                href={`#${option.id}`}
                className="underline decoration-[color:color-mix(in_oklab,var(--fg3),transparent_50%)] underline-offset-2 hover:text-fg1"
              >
                {option.label}
              </a>
            ))}
          </nav>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex flex-col gap-10">
        {OPTIONS.map((option) => (
          <OptionCard key={option.id} option={option}>
            <SampleBlurb style={option.style} />
          </OptionCard>
        ))}
      </div>

      <aside className="mt-12 border-t border-bg3 pt-6 text-xs leading-relaxed text-fg3">
        <p>
          Recommendation starting point: try <strong className="font-medium text-fg2">B (450)</strong>{' '}
          first — closest to current, usually enough for readability. If it still
          feels thin on your display, step to{' '}
          <strong className="font-medium text-fg2">C (500)</strong> or{' '}
          <strong className="font-medium text-fg2">F (450 + darker)</strong>.
        </p>
        <p className="mt-2">
          Preview-only page — not linked from the site. Say which letter you prefer
          and we can apply it to the home intro.
        </p>
      </aside>
    </div>
  )
}
