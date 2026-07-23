# Authoring Projects and Notes

This site publishes long-form writing as local MDX. Spend time on the content; drop in visuals when they earn the space.

## Categories

- **Projects** (`/projects/[slug]`): public things you shipped that people can try, use, or inspect.
- **Notes** (`/notes/[slug]`): idea-led or learning-led pieces, including sanitized work retrospectives.
- **Music**: still managed as homepage artifacts, not MDX.

Both Projects and Notes share the same editorial components. Projects may also set `status`, `liveUrl`, and `repositoryUrl`.

## Create a draft

```bash
npm run new:note -- "Making firmware crashes explain themselves"
npm run new:project -- "Agentation-style feedback tool"
```

Each command creates:

- `content/<kind>/<slug>/index.mdx` with `draft: true`
- `public/writing/<kind>/<slug>/` for media
- an updated content registry

Preview locally with `npm run dev`. Drafts appear in development (registry + routes). Production builds regenerate the registry without drafts (`CONTENT_INCLUDE_DRAFTS=0` via `prebuild`), and drafts are excluded from cards, metadata, and the sitemap.

Draft inclusion is controlled by one contract (`lib/content/draftPolicy.ts`) shared by the loader and registry generator:

- default: include drafts when `NODE_ENV !== 'production'`
- force on: `CONTENT_INCLUDE_DRAFTS=1`
- force off: `CONTENT_INCLUDE_DRAFTS=0`

The registry generator (`tsx scripts/generate-content-registry.ts`) uses the same `parseContentFrontMatter` path as runtime load, so invalid published frontmatter fails the build instead of shipping orphan modules.

## Publish

1. Write the piece in Markdown.
2. Add figures, recordings, or custom diagrams as needed.
3. Set `draft: false` (boolean, unquoted).
4. Run `npm run check` before pushing.

## Frontmatter

Common fields:

```yaml
title: "Title"
date: "2026-07-23" # quote dates — unquoted YAML becomes a Date
updated: "2026-08-01" # optional
summary: "One or two sentences for cards, SEO, and long-form intros."
draft: true # boolean only; strings like "true" / yes are rejected
topics: ["interfaces", "ai"]
cardImage: "/writing/notes/my-slug/card.png"
ogImage: "/writing/notes/my-slug/og.png"
```

Project-only fields:

```yaml
status: "active" # active | shipped | archived
liveUrl: "https://example.com"
repositoryUrl: "https://github.com/you/repo"
```

## MDX vocabulary

Global components are available without imports:

- `Figure` with `width="contained" | "wide" | "full"`
- `ArticleImage`
- `ArticleVideo`
- `Callout`
- `BrowserFrame`

Example:

```mdx
## The pipeline

A crash address is only the start.

<Figure width="wide" caption="How an address becomes a useful frame.">
  <FirmwarePipeline />
</Figure>
```

Custom diagrams live beside the MDX file and are imported explicitly:

```mdx
import FirmwarePipeline from './FirmwarePipeline'
```

Import `RoughCanvas` from `@/components/diagrams/RoughCanvas` inside those colocated diagram components (not from the global MDX map), so plain notes do not pay for `roughjs`. It handles responsive SVG setup, seeds, looping while visible, pause/replay, and reduced-motion static completion.

## Media conventions

Prefer MP4/WebM for screen recordings. GIFs still work for small loops. Put files in:

```text
public/writing/<kind>/<slug>/
```

Then reference them as `/writing/<kind>/<slug>/demo.mp4`.

## Layout defaults

- Prose stays at the 65ch reading measure.
- Selected visuals use the editorial breakout (`wide`) by default.
- Desktop pages show a sticky contents rail; mobile collapses it to an accordion.
- Diagrams and recordings loop only while visible and pause under `prefers-reduced-motion`.
