import ExternalLink from '@/components/ExternalLink'
import type { ContentEntry, ProjectStatus } from '@/lib/content'
import { cn } from '@/lib/utils'

type ProjectMetaProps = {
  entry: ContentEntry
  className?: string
}

const statusLabel: Record<ProjectStatus, string> = {
  active: 'Active',
  shipped: 'Shipped',
  archived: 'Archived',
}

export default function ProjectMeta({ entry, className }: ProjectMetaProps) {
  if (entry.kind !== 'projects') {
    return null
  }

  const hasLinks = Boolean(entry.liveUrl || entry.repositoryUrl)
  if (!entry.status && !hasLinks) {
    return null
  }

  return (
    <div className={cn('article-project-meta', className)}>
      {entry.status ? (
        <span className="article-project-meta__status">{statusLabel[entry.status]}</span>
      ) : null}
      <div className="article-project-meta__actions">
        {entry.liveUrl ? (
          <ExternalLink href={entry.liveUrl} className="article-project-meta__cta">
            Visit project
          </ExternalLink>
        ) : null}
        {entry.repositoryUrl ? (
          <ExternalLink href={entry.repositoryUrl} className="article-project-meta__link">
            Repository
          </ExternalLink>
        ) : null}
      </div>
    </div>
  )
}
