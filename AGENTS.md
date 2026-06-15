# AGENTS.md

## Cursor Cloud specific instructions

This is an Astro static personal portfolio/blog site using npm as the package manager.

### Quick reference

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (serves on port 4321 by default) |
| Check (lint + API typecheck + test) | `npm run check` |
| Lint | `npm run lint` |
| API typecheck | `npm run typecheck:api` |
| Test | `npm run test` (Vitest) |
| Build | `npm run build` |
| Preview build | `npm run preview` |

### Notes

- The root URL `/` redirects (307) to `/about`. This is expected behaviour, not a bug.
- Git hooks in `.githooks/` (pre-commit and pre-push) require `gitleaks`. These are not activated by default (the repo does not configure `core.hooksPath`), so they won't block cloud agent commits.
- Blog posts live in `content/essays/` as Markdown files with YAML frontmatter (`title`, `date`, `excerpt`).
- `npm run check` is the preferred pre-push gate (lint, API typecheck, tests). Frontend/UI types are validated at `npm run build` time.
