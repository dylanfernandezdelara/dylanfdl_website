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

## Ship (Cloud Agents)

Copy/href/version-string PRs are Low risk on this repo.
1. Use `.cursor/skills/verify-dylanfdl` (not walkthrough-artifacts). Stills + http.sh + tests. No video.
2. `npm run check` is the pre-push gate.
3. Open the PR ready (not draft) if you can; otherwise `gh pr ready` when CI is green.
4. When CI `check` is green, Vercel preview is Ready, and verify evidence exists: `gh pr merge --squash --delete-branch`. Do not stop at ready. Do not ping a human for Low.
5. Ping instead of merging only if Medium/High, auth/env/deploy/policy files moved, or Bugbot wants a human.
