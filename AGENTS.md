# AGENTS.md

## Cursor Cloud specific instructions

This is a Next.js personal portfolio/blog site using npm as the package manager.

### Quick reference

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (serves on port 3000 by default) |
| Check (lint + typecheck + test) | `npm run check` |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Test | `npm run test` (Vitest) |
| Build | `npm run build` (output in `.next`) |
| Preview build | `npm run preview` |
| New Note draft | `npm run new:note -- "Title"` |
| New Project draft | `npm run new:project -- "Title"` |
| Refresh content registry | `npm run content:registry` |

### Notes

- The site root `/` serves the about/profile content. `/about`, `/contact`, and `/privacy` are standalone document pages.
- Git hooks in `.githooks/` (pre-commit and pre-push) require `gitleaks`. These are not activated by default (the repo does not configure `core.hooksPath`), so they won't block cloud agent commits.
- Writing lives in `content/notes/` and `content/projects/` as MDX folders (`index.mdx` + colocated components). See `docs/authoring.md`.
- Homepage categories are Projects, Notes, and Music. Legacy `/essays/:slug` permanently redirects to `/notes/:slug`.
- `npm run check` is the preferred pre-push gate (lint, typecheck, tests).
