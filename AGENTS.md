# AGENTS.md

## Cursor Cloud specific instructions

This is a Next.js 14 personal portfolio/blog site using npm as the package manager.

### Quick reference

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (serves on port 3000) |
| Lint | `npm run lint` |
| Test | `npm run test` (Vitest) |
| Build | `npm run build` |

### Notes

- The root URL `/` redirects (307) to `/about`. This is expected behaviour, not a bug.
- The visitor counter API (`/api/visitor-count`) requires a `BLOB_READ_WRITE_TOKEN` env var for Vercel Blob. Without it, the endpoint returns 500 with `count: 0`, but the rest of the site works fine. Do not treat this 500 as a blocker.
- Git hooks in `.githooks/` (pre-commit and pre-push) require `gitleaks`. These are not activated by default (the repo does not configure `core.hooksPath`), so they won't block cloud agent commits.
- Blog posts live in `content/essays/` as Markdown files with YAML frontmatter (`title`, `date`, `excerpt`).
