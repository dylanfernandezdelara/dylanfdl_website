'use client'

type HeadingAnchorLinkProps = {
  id: string
  label: string
}

async function copyHeadingLink(id: string) {
  const url = `${window.location.origin}${window.location.pathname}#${id}`
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    // Clipboard may be unavailable; navigation still works via the hash link.
  }
}

export default function HeadingAnchorLink({ id, label }: HeadingAnchorLinkProps) {
  return (
    <a
      href={`#${id}`}
      className="article-heading__anchor"
      aria-label={`Link to ${label || 'this section'}`}
      onClick={() => {
        void copyHeadingLink(id)
      }}
    >
      #
    </a>
  )
}
