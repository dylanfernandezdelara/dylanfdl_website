Load demos for PR #61. Recorded against the local dev server with:

```bash
npm run dev
npx playwright install chromium
DEMO_BASE_URL=http://localhost:4321 node scripts/record-about-load-demo.mjs
```

Production/Vercel builds with Upstash `KV_REST_*` at build time embed the now-playing line in static HTML on first paint.
