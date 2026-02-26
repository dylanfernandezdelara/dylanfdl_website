## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

## Adding New Writing Posts

Create a new markdown file in `content/essays/` with the following frontmatter:

```markdown
---
title: "Your Post Title"
date: "2024-01-01"
excerpt: "A brief excerpt of your post"
---

Your post content here...
```

## Vercel Deployment Behavior

This repository is configured to keep production deploys manual while automatically updating Vercel development/preview on each push to `main`.

- `vercel.json` keeps git-triggered deployments disabled by default (no automatic production deploys).
- `.github/workflows/vercel-dev-on-main.yml` runs on every push to `main` and performs a Vercel preview deploy.

### Required GitHub Secrets

Add these repository secrets so the workflow can deploy:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

You can get `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` from `.vercel/project.json` after running `vercel link`, or from your Vercel project settings.

