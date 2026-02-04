## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

## Protected Area (Google OAuth)

The `/private` route is protected with Google OAuth via NextAuth. Add these to
`.env.local` before using the private area:

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=http://localhost:3000
ALLOWED_GOOGLE_EMAILS=you@example.com,other@example.com
```

Only email addresses listed in `ALLOWED_GOOGLE_EMAILS` can sign in.

## Adding New Writing Posts

Create a new markdown file in `content/writing/` with the following frontmatter:

```markdown
---
title: "Your Post Title"
date: "2024-01-01"
excerpt: "A brief excerpt of your post"
---

Your post content here...
```

