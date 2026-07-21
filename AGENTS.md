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

### Notes

- The site root `/` serves the about/profile content. `/about` permanently redirects to `/`.
- Git hooks in `.githooks/` (pre-commit and pre-push) require `gitleaks`. These are not activated by default (the repo does not configure `core.hooksPath`), so they won't block cloud agent commits.
- Blog posts live in `content/essays/` as Markdown files with YAML frontmatter (`title`, `date`, `excerpt`).
- `npm run check` is the preferred pre-push gate (lint, typecheck, tests).
