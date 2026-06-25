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

### Vercel (production hosting)

| Item | Value |
|------|-------|
| Project | `dylanfdl-website` |
| Project ID | `prj_U7mDYVegV8tb6qMvFokjbJh3gwhb` |
| Team slug | `dylanfernandezdelaras-projects` |
| Team ID | `team_geMHAB09HEyjI8UtYLOTUMic` |
| Canonical domain | `https://dylanfdl.com` (also `www.dylanfdl.com`) |
| Legacy domain | `dylanfdl.dev` — should redirect to `.com` or be removed from the project |

Dashboard: https://vercel.com/dylanfernandezdelaras-projects/dylanfdl-website/settings/domains

#### Agent access (two layers)

1. **Vercel MCP (OAuth)** — read/monitor: projects, deployments, build logs, runtime logs, docs search. Does **not** remove domains, change domain redirects, or manage env vars. Connect once in Cursor (**Settings → Tools & MCP → Vercel → Needs login**) and for Cloud Agents at https://cursor.com/agents (MCP dropdown).

2. **`VERCEL_TOKEN` (Cloud Agent secret)** — write/admin via CLI or REST API: `vercel domains rm`, `vercel env`, `vercel deploy`, etc. Create at https://vercel.com/account/tokens (scope: team `dylanfernandezdelaras-projects`). Add as a **Runtime Secret** named `VERCEL_TOKEN` at https://cursor.com/dashboard/cloud-agents#environments (Secrets tab). Optional: `VERCEL_ORG_ID=team_geMHAB09HEyjI8UtYLOTUMic`, `VERCEL_PROJECT_ID=prj_U7mDYVegV8tb6qMvFokjbJh3gwhb`.

Never commit tokens. `.vercel/` and `.cursor/` are gitignored.

#### Useful Vercel plugin skills (Cursor Marketplace → Vercel)

- `vercel-cli` — CLI commands (`domains`, `env`, `deploy`, `logs`)
- `deployments-cicd` — promote, rollback, CI pipelines
- `env-vars` — environment variable sync
- `routing-middleware` — `vercel.json` redirects/headers

#### Common CLI (requires `VERCEL_TOKEN` in cloud agents)

```bash
npx vercel@latest domains ls --scope dylanfernandezdelaras-projects
npx vercel@latest domains rm dylanfdl.dev --scope dylanfernandezdelaras-projects
npx vercel@latest env ls
```
