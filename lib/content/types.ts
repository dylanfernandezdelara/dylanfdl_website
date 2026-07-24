export type ContentKind = 'notes' | 'projects'

export type ProjectStatus = 'active' | 'shipped' | 'archived'

export type ContentHeading = {
  id: string
  text: string
  level: 2 | 3
}

type SharedFrontMatter = {
  title: string
  date: string
  updated?: string
  summary?: string
  draft: boolean
  topics: string[]
  cardImage?: string
  ogImage?: string
}

export type NoteFrontMatter = SharedFrontMatter & {
  kind: 'notes'
}

export type ProjectFrontMatter = SharedFrontMatter & {
  kind: 'projects'
  status?: ProjectStatus
  liveUrl?: string
  repositoryUrl?: string
}

export type ContentFrontMatter = NoteFrontMatter | ProjectFrontMatter

export type NoteEntry = NoteFrontMatter & {
  slug: string
  content: string
  headings: ContentHeading[]
}

export type ProjectEntry = ProjectFrontMatter & {
  slug: string
  content: string
  headings: ContentHeading[]
}

export type ContentEntry = NoteEntry | ProjectEntry
